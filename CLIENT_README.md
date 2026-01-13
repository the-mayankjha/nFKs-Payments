# Client Integration Guide: NFKS Payment Gateway

This guide explains how to integrate your client application (e.g., AyScroll) with the NFKS Payment Gateway.

## 🚀 Quick Integration

### 1. Environment Setup

Add these variables to your client application's `.env.local`:

```bash
# Production
NEXT_PUBLIC_PAYMENT_API_URL=https://payments.nfks.co.in/api/v1
PAYMENT_API_KEY=pk_live_...
PAYMENT_WEBHOOK_SECRET=your_webhook_secret

# Sandbox (Development)
NEXT_PUBLIC_PAYMENT_API_URL=http://localhost:3000/api/v1
PAYMENT_API_KEY=pk_test_...
```

---

### 2. Initiate Checkout (Frontend)

Use this function to redirect users to the payment page when they click "Upgrade".

```typescript
// utils/payment.ts

export async function initiateCheckout(planId: string, amount: number) {
  try {
    const response = await fetch('/api/payment/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, amount }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    // Redirect user to NFKS Payment Gateway
    window.location.href = data.checkoutUrl;
  } catch (error) {
    console.error('Checkout failed:', error);
    alert('Failed to start payment processing');
  }
}
```

---

### 3. Backend API Route (Secure Proxy)

Do not call the Payment Gateway directly from the browser to keep your API key secure. Create a proxy route in your Next.js app.

**File:** `src/app/api/payment/create-session/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, amount } = body;

    // Call NFKS Payment Gateway
    const gatewayRes = await fetch(`${process.env.NEXT_PUBLIC_PAYMENT_API_URL}/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PAYMENT_API_KEY}`
      },
      body: JSON.stringify({
        order_id: `ORD-${Date.now()}`, // Generate your internal Order ID
        amount: amount,
        currency: 'INR',
        plan_id: planId,
        plan_name: 'AyScroll Pro Plan',
        billing_period: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days
        },
        customer: {
            user_id: 'user_123', // Get from your Auth session
            email: 'user@example.com',
            name: 'John Doe'
        },
        redirect_urls: {
            success: 'https://your-app.com/dashboard?payment=success',
            failure: 'https://your-app.com/pricing?payment=failed',
            cancel: 'https://your-app.com/pricing'
        },
        webhook_url: 'https://your-app.com/api/webhooks/nfks-payment'
      })
    });

    const gatewayData = await gatewayRes.json();

    if (!gatewayRes.ok) {
        return NextResponse.json({ success: false, error: gatewayData.error?.message }, { status: 400 });
    }

    return NextResponse.json({ 
        success: true, 
        checkoutUrl: gatewayData.data.checkout_url 
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### 4. Handle Webhooks (Critical)

This endpoint listens for payment updates (Success, Failure) from the gateway.

**File:** `src/app/api/webhooks/nfks-payment/route.ts`

```typescript
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('X-NFKS-Signature');
    
    // 1. Verify Signature
    // In production, implement HMAC verification here using process.env.PAYMENT_WEBHOOK_SECRET
    
    const payload = JSON.parse(rawBody);

    // 2. Handle Events
    if (payload.event === 'payment.success') {
        const { order_id, transaction_id, invoice } = payload.payment;
        
        console.log(`✅ Payment Successful for Order ${order_id}`);
        console.log(`📄 Invoice URL: ${invoice.invoice_url}`);

        // TODO: Update your database
        // await db.users.updateSubscription(payload.payment.customer.user_id, 'pro');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
```

---

## 🧪 Testing

1. **Card Numbers**:
   - Success: `4242 4242 4242 4242`
   - Failure: `4000 0000 0000 0002`

2. **Any Expiry**: Future date (e.g., 12/2028)
3. **Any CVV**: 123
