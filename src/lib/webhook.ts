import crypto from 'crypto';
import { WebhookPayload } from '@/types/checkout';

export async function sendWebhook(url: string, payload: WebhookPayload, secret: string = 'whsec_demo') {
    const payloadString = JSON.stringify(payload);
    const signature = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-NFKS-Signature': signature,
            },
            body: payloadString,
        });

        if (!response.ok) {
            throw new Error(`Webhook failed: ${response.statusText}`);
        }

        return true;
    } catch (error) {
        console.error('Webhook sending failed:', error);
        return false;
    }
}
