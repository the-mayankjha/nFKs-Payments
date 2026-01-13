import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateInvoicePDF } from '@/lib/invoice';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ invoice_id: string }> }
) {
    try {
        const { invoice_id } = await params;

        const session = await db.sessions.findByInvoiceId(invoice_id);

        if (!session || !session.invoice || !session.payment) {
            return NextResponse.json(
                { success: false, error: { code: 'not_found', message: 'Invoice not found' } },
                { status: 404 }
            );
        }

        // Generate PDF
        const pdfStream = await generateInvoicePDF(
            session,
            session.invoice.invoice_number,
            session.payment.transaction_id
        );

        // Convert Stream to Buffer
        const chunks: Buffer[] = [];
        for await (const chunk of pdfStream) {
            chunks.push(Buffer.from(chunk));
        }
        const pdfBuffer = Buffer.concat(chunks);

        // Return PDF
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${session.invoice.invoice_number}.pdf"`,
            },
        });

    } catch (error) {
        console.error('Invoice generation error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'internal_error', message: 'Failed to generate invoice' } },
            { status: 500 }
        );
    }
}
