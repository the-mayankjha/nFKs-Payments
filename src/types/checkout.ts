export interface CheckoutSession {
    checkout_id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'success' | 'failed' | 'expired';

    plan_id: string;
    plan_name: string;
    billing_period: {
        start: string;
        end: string;
    };

    customer: {
        user_id: string;
        email: string;
        name: string;
        phone?: string;
        address?: {
            line1: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
        };
    };

    redirect_urls: {
        success: string;
        failure: string;
        cancel: string;
    };

    webhook_url: string;
    metadata?: Record<string, any>;

    payment?: {
        transaction_id: string;
        payment_method: {
            type: 'card';
            card_brand: string;
            last4: string;
            expiry_month: number;
            expiry_year: number;
        };
        completed_at: string;
    };

    invoice?: {
        invoice_id: string;
        invoice_number: string;
        invoice_url: string;
        issued_at: string;
    };

    created_at: string;
    expires_at: string;
}

export interface CreateCheckoutRequest {
    order_id: string;
    amount: number;
    currency: string;
    plan_id: string;
    plan_name: string;
    billing_period: {
        start: string;
        end: string;
    };
    customer: {
        user_id: string;
        email: string;
        name: string;
        phone?: string;
        address?: {
            line1: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
        };
    };
    redirect_urls: {
        success: string;
        failure: string;
        cancel: string;
    };
    webhook_url: string;
    metadata?: Record<string, any>;
}

export interface WebhookPayload {
    event: 'payment.success' | 'payment.failed' | 'payment.cancelled';
    timestamp: string;
    payment: {
        transaction_id: string;
        checkout_id: string;
        order_id: string;
        status: 'success' | 'failed' | 'cancelled';
        amount: number;
        currency: string;
        payment_method: {
            type: 'card';
            card_brand: string;
            last4: string;
            expiry_month: number;
            expiry_year: number;
        };
        created_at: string;
        completed_at: string;
        customer: {
            user_id: string;
            email: string;
            name: string;
        };
        plan: {
            plan_id: string;
            plan_name: string;
            billing_period: {
                start: string;
                end: string;
            };
        };
        invoice: {
            invoice_id: string;
            invoice_number: string;
            invoice_url: string;
            issued_at: string;
        };
        metadata?: Record<string, any>;
    };
    signature: string;
}
