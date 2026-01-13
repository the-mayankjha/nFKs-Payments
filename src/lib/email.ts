import { Resend } from 'resend';

// Helper to convert Stream to Buffer
async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

export async function sendInvoiceEmail({
    to,
    subject,
    pdfStream,
    filename,
    customerName,
    planName,
    amount,
    currency,
    transactionId
}: {
    to: string;
    subject: string;
    pdfStream: NodeJS.ReadableStream;
    filename: string;
    customerName: string;
    planName: string;
    amount: number;
    currency: string;
    transactionId: string;
}) {
    // Check for API Key
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.log('⚠️ RESEND_API_KEY not found. Simulating email send.');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Attachment: ${filename}`);
        return { success: true, id: 'mock-email-id' };
    }

    try {
        const resend = new Resend(apiKey);
        const pdfBuffer = await streamToBuffer(pdfStream);

        const { data, error } = await resend.emails.send({
            from: 'AyScroll Payments <payments@resend.dev>', // Default testing domain
            to: [to],
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Payment Successful</h2>
                    <p>Hi ${customerName},</p>
                    <p>Thank you for your payment! Your subscription to <strong>${planName}</strong> is now active.</p>
                    
                    <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Amount:</strong> ${currency} ${amount.toFixed(2)}</p>
                        <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>
                        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>

                    <p>Your invoice is attached to this email.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                    
                    <p style="font-size: 12px; color: #888;">
                        If you have any questions, please contact us at <a href="mailto:support@ayscroll.com">support@ayscroll.com</a>.
                    </p>
                </div>
            `,
            attachments: [
                {
                    filename: filename,
                    content: pdfBuffer,
                },
            ],
        });

        if (error) {
            console.error('Resend Error:', error);
            throw new Error(error.message);
        }

        return { success: true, id: data?.id };

    } catch (error) {
        console.error('Email sending failed:', error);
        // Don't block the flow if email fails, just log it.
        return { success: false, error };
    }
}
