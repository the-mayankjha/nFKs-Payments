import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ checkout_id: string }> }
) {
    try {
        const { checkout_id } = await params;

        // Fetch session from DB
        const session = await db.sessions.findById(checkout_id);

        if (!session) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'not_found',
                    message: 'Checkout session not found or expired',
                },
            }, { status: 404 });
        }

        // Check expiry
        if (new Date(session.expires_at) < new Date()) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'expired',
                    message: 'Checkout session has expired',
                },
            }, { status: 410 });
        }

        return NextResponse.json({
            success: true,
            data: session,
        });

    } catch (error) {
        console.error('Checkout retrieval error:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'internal_error',
                message: 'Failed to retrieve checkout session',
            },
        }, { status: 500 });
    }
}
