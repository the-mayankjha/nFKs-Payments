import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendWebhook } from '@/lib/webhook';
import { WebhookPayload } from '@/types/checkout';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ checkout_id: string }> }
) {
    try {
        const { checkout_id } = await params;

        // 1. Fetch Session
        const session = await db.sessions.findById(checkout_id);
        if (!session) {
            return NextResponse.json({ success: false, error: { code: 'not_found', message: 'Session not found' } }, { status: 404 });
        }

        // Only cancel if pending
        if (session.status !== 'pending') {
            // If already success/failed, just return the appropriate redirect without modifying
            const targetUrl = session.status === 'success' ? session.redirect_urls.success : session.redirect_urls.failure;
            return NextResponse.json({
                success: true,
                data: { redirect_url: targetUrl }
            });
        }

        // 2. Update Session to Failed (User Cancelled)
        const updatedSession = await db.sessions.update(checkout_id, {
            status: 'failed',
            payment: {
                ...session.payment!, // Keep existing if any partial info
                completed_at: new Date().toISOString()
            }
            // Note: We are treating this as a failure per user request
        });

        if (!updatedSession) throw new Error('Failed to update session');

        // 3. Send Webhook (payment.failed)
        const failurePayload: WebhookPayload = {
            event: 'payment.failed',
            data: {
                amount: session.amount,
                user_id: session.customer.user_id,
                plan_id: session.plan_id,
                error: {
                    code: 'user_cancelled',
                    message: 'User cancelled the payment process.'
                },
                metadata: {
                    billingCycle: session.metadata?.billingCycle || 'Monthly',
                    order_id: session.order_id,
                    ...session.metadata
                }
            },
            signature: ''
        };

        sendWebhook(session.webhook_url, failurePayload).catch(err => console.error('Webhook failed', err));

        // 4. Construct Redirect URL
        const failUrl = new URL(session.redirect_urls.failure);
        failUrl.searchParams.append('status', 'failed');
        failUrl.searchParams.append('reason', 'user_cancelled');
        failUrl.searchParams.append('plan_id', session.plan_id);
        failUrl.searchParams.append('amount', session.amount.toString());
        failUrl.searchParams.append('session_id', checkout_id);

        return NextResponse.json({
            success: true,
            data: {
                redirect_url: failUrl.toString(),
                session: updatedSession
            }
        });

    } catch (error) {
        console.error('Cancellation error:', error);
        return NextResponse.json({
            success: false,
            error: { code: 'server_error', message: 'Failed to cancel session' }
        }, { status: 500 });
    }
}
