import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendWebhook } from '@/lib/webhook';
import { generateId } from '@/lib/utils';
import { WebhookPayload } from '@/types/checkout';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ checkout_id: string }> }
) {
    try {
        const { checkout_id } = await params;
        const body = await request.json(); // { method, details }

        // 1. Fetch Session
        const session = await db.sessions.findById(checkout_id);
        if (!session) {
            return NextResponse.json({ success: false, error: { code: 'not_found', message: 'Session not found' } }, { status: 404 });
        }

        if (session.status !== 'pending') {
            return NextResponse.json({ success: false, error: { code: 'invalid_status', message: 'Session already processed' } }, { status: 400 });
        }

        // 2. Validate Payment (Simulated)
        // In a real app, we'd check card details here, talk to Stripe/Bank, etc.
        const transaction_id = generateId('txn', 16);

        // 3. Update Session
        const completed_at = new Date().toISOString();

        // Invoice Generation
        const invoice_id = generateId('inv', 12);
        const invoice_number = `INV-2026-${Math.floor(Math.random() * 10000)}`;
        // Dynamic URL for downloading invoice later
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

        // Prepare invoice data for DB update
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

        // --- NEW: Generate PDF and Send Email ---
        try {
            // Import dynamically to avoid circular dependency issues if any
            const { generateInvoicePDF } = await import('@/lib/invoice');
            const { sendInvoiceEmail } = await import('@/lib/email');

            // Generate PDF Stream
            const pdfStream = await generateInvoicePDF(updatedSession, invoice_number, transaction_id);

            // Send Email
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
            console.log('📧 Invoice email sent/simulated successfully');
        } catch (emailErr) {
            console.error('Failed to send invoice email:', emailErr);
            // Non-blocking error
        }

        // 4. Send Webhook
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
            signature: '', // will be set by sendWebhook
        };

        // Fire and forget webhook
        sendWebhook(session.webhook_url, webhookPayload).catch(err => console.error('Webhook failed', err));

        // Construct Redirect URL with params
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

    } catch (error) {
        console.error('Payment processing error:', error);
        return NextResponse.json({
            success: false,
            error: { code: 'payment_failed', message: 'Payment processing failed' }
        }, { status: 500 });
    }
}
