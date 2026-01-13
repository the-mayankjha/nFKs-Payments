import { NextRequest, NextResponse } from 'next/server';
import { generateId } from '@/lib/utils';
import { z } from 'zod';
import { db } from '@/lib/db';
import { CheckoutSession } from '@/types/checkout';

// Validation schema
const createCheckoutSchema = z.object({
    order_id: z.string().min(1),
    amount: z.number().positive(),
    currency: z.string().length(3),
    plan_id: z.string().min(1),
    plan_name: z.string().min(1),
    billing_period: z.object({
        start: z.string(),
        end: z.string(),
    }),
    customer: z.object({
        user_id: z.string().min(1),
        email: z.string().email(),
        name: z.string().min(1),
        phone: z.string().optional(),
        address: z.object({
            line1: z.string(),
            city: z.string(),
            state: z.string(),
            postal_code: z.string(),
            country: z.string(),
        }).optional(),
    }),
    redirect_urls: z.object({
        success: z.string().url(),
        failure: z.string().url(),
        cancel: z.string().url(),
    }),
    webhook_url: z.string().url(),
    metadata: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json();
        const validatedData = createCheckoutSchema.parse(body);

        // Generate checkout ID
        const checkout_id = generateId('cs', 24);

        // Set expiry (15 minutes from now)
        const created_at = new Date().toISOString();
        const expires_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        // Create checkout session
        const session: CheckoutSession = {
            checkout_id,
            ...validatedData,
            status: 'pending',
            created_at,
            expires_at,
        };

        // Save to database
        await db.sessions.create(session);

        // Generate checkout URL
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const checkout_url = `${baseUrl}/checkout/${checkout_id}`;

        // Return response
        return NextResponse.json({
            success: true,
            data: {
                checkout_id,
                checkout_url,
                expires_at,
                order_id: validatedData.order_id,
            },
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: {
                    code: 'validation_error',
                    message: 'Invalid request data',
                    details: (error as any).errors,
                },
            }, { status: 400 });
        }

        console.error('Checkout creation error:', error);
        return NextResponse.json({
            success: false,
            error: {
                code: 'internal_error',
                message: 'Failed to create checkout session',
                debug: error instanceof Error ? error.message : String(error)
            },
        }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
