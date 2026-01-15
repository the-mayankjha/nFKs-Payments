import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendWebhook } from '@/lib/webhook';
import { generateId } from '@/lib/utils';
import { WebhookPayload, CheckoutSession } from '@/types/checkout';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ checkout_id: string }> }
) {
    let session: CheckoutSession | null = null;
    const { checkout_id } = await params;

    try {
        const body = await request.json(); // { method, details }

        // 1. Fetch Session
        session = await db.sessions.findById(checkout_id);

        if (!session) {
            return NextResponse.json({ success: false, error: { code: 'not_found', message: 'Session not found' } }, { status: 404 });
        }

        if (session.status !== 'pending') {
            return NextResponse.json({ success: false, error: { code: 'invalid_status', message: 'Session already processed' } }, { status: 400 });
        }

        // 2. Validate Payment (Simulated)
        // Check for simulated failure trigger: Card ending in '0000'
        if (body.details?.cardNumber?.endsWith('0000')) {
            throw new Error('Simulated bank decline');
        }

        const transaction_id = generateId('txn', 16);

        // 3. Update Session
        const completed_at = new Date().toISOString();

        // Invoice Generation
        const invoice_id = generateId('inv', 12);
        const invoice_number = `INV-2026-${Math.floor(Math.random() * 10000)}`;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://payments.nfks.co.in';
        const invoice_url = `${baseUrl}/api/v1/invoices/${invoice_id}`;

        const paymentData = {
            transaction_id,
            payment_method: {
                type: 'card',
                card_brand: 'visa',
                last4: body.details?.cardNumber?.slice(-4) || '4242',
                expiry_month: 12,
                expiry_year: 2028,
            },
            completed_at,
        };

        const invoiceData = {
            invoice_id,
            invoice_number,
            invoice_url,
            issued_at: completed_at,
        };

        const updatedSession = await db.sessions.update(checkout_id, {
            status: 'success',
            payment: paymentData as any,
            invoice: invoiceData
        });

        if (!updatedSession) throw new Error('Failed to update session');

        // --- Generate PDF and Send Email (Side Effect) ---
        try {
            const { generateInvoicePDF } = await import('@/lib/invoice');
            const { sendInvoiceEmail } = await import('@/lib/email');
            const pdfStream = await generateInvoicePDF(updatedSession, invoice_number, transaction_id);

            await sendInvoiceEmail({
                to: updatedSession.customer.email,
                subject: `Payment Successful - ${updatedSession.plan_name}`,
                pdfStream,
                filename: `Invoice-${invoice_number}.pdf`,
                customerName: updatedSession.customer.name,
                planName: updatedSession.plan_name,
                amount: updatedSession.amount,
                currency: updatedSession.currency,
                transactionId: transaction_id
            });
        } catch (emailErr) {
            console.error('Failed to send invoice email:', emailErr);
        }

        // 4. Send Success Webhook
        const webhookPayload: WebhookPayload = {
            event: 'payment.success',
            timestamp: completed_at,
            payment: {
                transaction_id,
                checkout_id,
                order_id: session.order_id,
                status: 'success',
                amount: session.amount,
                currency: session.currency,
                payment_method: paymentData.payment_method as any,
                created_at: session.created_at,
                completed_at,
                customer: session.customer,
                plan: {
                    plan_id: session.plan_id,
                    plan_name: session.plan_name,
                    billing_period: session.billing_period,
                },
                invoice: updatedSession.invoice!,
                metadata: session.metadata,
            },
            signature: '',
        };

        sendWebhook(session.webhook_url, webhookPayload).catch(err => console.error('Webhook failed', err));

        // Construct Success Redirect URL
        const successUrl = new URL(session.redirect_urls.success);
        successUrl.searchParams.append('status', 'success');
        successUrl.searchParams.append('session_id', checkout_id);
        successUrl.searchParams.append('order_id', session.order_id);

        return NextResponse.json({
            success: true,
            data: {
                redirect_url: successUrl.toString(),
                session: updatedSession
            }
        });

    } catch (error: any) {
        console.error('Payment processing error:', error);

        const errorCode = error.message === 'Simulated bank decline' ? 'insufficient_funds' : 'payment_processing_error';
        const errorMessage = error.message || 'The transaction failed due to an unknown error.';

        // Handle Failure: Send Webhook and Return Redirect URL
        if (session) {
            // 1. Send specific Failure Webhook as requested
            const failurePayload: WebhookPayload = {
                event: 'payment.failed',
                data: {
                    amount: session.amount,
                    user_id: session.customer.user_id,
                    plan_id: session.plan_id,
                    error: {
                        code: errorCode,
                        message: errorMessage
                    },
                    metadata: {
                        billingCycle: session.metadata?.billingCycle || 'Monthly', // Fallback or explicit
                        order_id: session.order_id,
                        ...session.metadata
                    }
                }
            };

            sendWebhook(session.webhook_url, failurePayload).catch(e => console.error("Failure Webhook failed", e));

            // 2. Construct Failure Redirect URL
            const failUrl = new URL(session.redirect_urls.failure);
            failUrl.searchParams.append('status', 'failed');
            failUrl.searchParams.append('plan_id', session.plan_id);
            failUrl.searchParams.append('amount', session.amount.toString());
            failUrl.searchParams.append('session_id', checkout_id); // Using checkout_id as session_id per convention
            failUrl.searchParams.append('error_code', errorCode);

            // Return success: false but with data.redirect_url so frontend can redirect
            return NextResponse.json({
                success: false,
                data: {
                    redirect_url: failUrl.toString()
                },
                error: { code: errorCode, message: errorMessage }
            }, { status: 402 }); // 402 Payment Required is appropriate for failures
        }

        return NextResponse.json({
            success: false,
            error: { code: 'payment_failed', message: 'Payment processing failed' }
        }, { status: 500 });
    }
}
