# NFKS Payment Gateway - Integration Guide

> **Project**: NFKS Payment Gateway Microservice  
> **Domain**: `payments.nfks.co.in`  
> **Tech Stack**: Next.js  
> **Client Application**: AyScroll (React + TypeScript)  
> **Purpose**: Demo payment gateway for subscription payments with invoice generation

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [API Contract](#api-contract)
3. [Request/Response Specifications](#requestresponse-specifications)
4. [Payment Flow](#payment-flow)
5. [Security & Authentication](#security--authentication)
6. [Invoice Generation](#invoice-generation)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

---

## 🎯 Overview

The NFKS Payment Gateway is a microservice that handles:
- Payment processing for AyScroll subscriptions
- Invoice generation and email delivery
- Secure payment redirects
- Webhook notifications to client applications

### Key Features Required:
- ✅ Realistic payment form (card details, billing info)
- ✅ Payment processing simulation
- ✅ Automatic invoice generation (PDF)
- ✅ Email delivery of invoices
- ✅ Secure webhook notifications
- ✅ Redirect handling (success/failure/cancel)

---

## 🔌 API Contract

### Base URL
```
Production: https://payments.nfks.co.in/api/v1
Sandbox: https://sandbox.payments.nfks.co.in/api/v1
```

### Authentication
All API requests require an API key in the header:
```
Authorization: Bearer {API_KEY}
```

---

## 📡 Request/Response Specifications

### 1. Create Checkout Session

**Endpoint**: `POST /checkout/create`

**Purpose**: Initiate a payment session from AyScroll client

#### Request Body:
```typescript
{
  // Order Details
  order_id: string;              // Unique order ID from client (e.g., "ORD-20260113-001")
  amount: number;                // Amount in smallest unit (e.g., 49900 for ₹499.00)
  currency: string;              // "INR", "USD", etc.
  
  // Product/Plan Details
  plan_id: string;               // "pro_monthly" | "pro_yearly"
  plan_name: string;             // "AyScroll Pro - Monthly"
  billing_period: {
    start: string;               // ISO 8601: "2026-01-13T00:00:00Z"
    end: string;                 // ISO 8601: "2026-02-13T00:00:00Z"
  };
  
  // Customer Details
  customer: {
    user_id: string;             // Client's internal user ID
    email: string;               // Required for invoice
    name: string;                // Full name
    phone?: string;              // Optional
    address?: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;           // ISO 3166-1 alpha-2 (e.g., "IN", "US")
    };
  };
  
  // Callback URLs
  redirect_urls: {
    success: string;             // "https://ayscroll.com/subscription?status=success"
    failure: string;             // "https://ayscroll.com/subscription?status=failed"
    cancel: string;              // "https://ayscroll.com/subscription?status=cancelled"
  };
  
  // Webhook URL (Server-to-Server notification)
  webhook_url: string;           // "https://ayscroll.com/api/webhooks/payment"
  
  // Optional Metadata
  metadata?: {
    app_name?: string;           // "AyScroll"
    environment?: string;        // "production" | "sandbox"
    [key: string]: any;
  };
}
```

#### Response (Success):
```typescript
{
  success: true;
  data: {
    checkout_id: string;         // Unique session ID (e.g., "cs_1234567890abcdef")
    checkout_url: string;        // "https://payments.nfks.co.in/checkout/cs_1234567890abcdef"
    expires_at: string;          // ISO 8601 (15 minutes from creation)
    order_id: string;            // Echo back the order_id
  };
}
```

#### Response (Error):
```typescript
{
  success: false;
  error: {
    code: string;                // "invalid_amount", "missing_customer", etc.
    message: string;             // Human-readable error
    details?: object;            // Additional context
  };
}
```

**Client Action**: Redirect user to `checkout_url` using `window.location.href` or `<a>` tag.

---

### 2. Payment Completion - Browser Redirect

After payment is processed, redirect the user back to the client application:

#### Success Redirect:
```
{redirect_urls.success}?status=success&session_id={checkout_id}&order_id={order_id}
```

#### Failure Redirect:
```
{redirect_urls.failure}?status=failed&session_id={checkout_id}&order_id={order_id}&error={error_code}
```

#### Cancel Redirect:
```
{redirect_urls.cancel}?status=cancelled&session_id={checkout_id}&order_id={order_id}
```

**Query Parameters**:
- `status`: `"success"` | `"failed"` | `"cancelled"`
- `session_id`: Checkout session ID
- `order_id`: Original order ID from client
- `error`: (optional) Error code if payment failed

---

### 3. Webhook Notification (Server-to-Server)

**Endpoint**: Client's webhook URL (e.g., `POST https://ayscroll.com/api/webhooks/payment`)

**Purpose**: Reliable server-side notification of payment status

#### Webhook Payload:
```typescript
{
  event: "payment.success" | "payment.failed" | "payment.cancelled";
  timestamp: string;             // ISO 8601
  
  payment: {
    // Transaction Details
    transaction_id: string;      // Unique payment ID (e.g., "txn_abc123xyz")
    checkout_id: string;         // Original checkout session ID
    order_id: string;            // Client's order ID
    
    // Status & Amount
    status: "success" | "failed" | "cancelled";
    amount: number;              // Amount charged (in smallest unit)
    currency: string;
    
    // Payment Method
    payment_method: {
      type: "card";
      card_brand: "visa" | "mastercard" | "amex" | "rupay";
      last4: string;             // Last 4 digits (e.g., "4242")
      expiry_month: number;      // 1-12
      expiry_year: number;       // Full year (e.g., 2028)
    };
    
    // Timestamps
    created_at: string;          // When checkout was created
    completed_at: string;        // When payment was completed
    
    // Customer Info (echoed back)
    customer: {
      user_id: string;
      email: string;
      name: string;
      phone?: string;
    };
    
    // Plan Info (echoed back)
    plan: {
      plan_id: string;
      plan_name: string;
      billing_period: {
        start: string;
        end: string;
      };
    };
    
    // Invoice Details
    invoice: {
      invoice_id: string;        // Unique invoice ID
      invoice_number: string;    // Human-readable (e.g., "INV-2026-001234")
      invoice_url: string;       // PDF download URL (valid for 30 days)
      issued_at: string;         // ISO 8601
    };
    
    // Metadata (if provided during checkout)
    metadata?: object;
  };
  
  // Security Signature
  signature: string;             // HMAC SHA256 signature for verification
}
```

#### Expected Response from Client:
```typescript
{
  received: true;
}
```
**Status Code**: `200 OK`

**Important**: 
- Respond within 5 seconds
- If no response, webhook will retry (3 attempts with exponential backoff)
- Verify the signature before processing

---

### 4. Verify Checkout Session (Optional)

**Endpoint**: `GET /checkout/{checkout_id}`

**Purpose**: Verify payment status on client side

**Headers**:
```
Authorization: Bearer {API_KEY}
```

#### Response:
```typescript
{
  success: true;
  data: {
    checkout_id: string;
    order_id: string;
    status: "pending" | "processing" | "success" | "failed" | "expired";
    
    payment?: {                  // Only present if status is "success"
      transaction_id: string;
      amount: number;
      currency: string;
      payment_method: {
        type: "card";
        card_brand: string;
        last4: string;
      };
      completed_at: string;
    };
    
    invoice?: {                  // Only present if status is "success"
      invoice_id: string;
      invoice_number: string;
      invoice_url: string;
    };
    
    created_at: string;
    expires_at: string;
  };
}
```

---

### 5. Resend Invoice Email

**Endpoint**: `POST /invoices/{invoice_id}/send`

**Purpose**: Manually trigger invoice email (if needed)

**Headers**:
```
Authorization: Bearer {API_KEY}
```

#### Request Body:
```typescript
{
  email?: string;                // Override recipient (optional)
  cc?: string[];                 // CC emails (optional)
}
```

#### Response:
```typescript
{
  success: true;
  message: "Invoice sent successfully";
  sent_to: string;
  sent_at: string;               // ISO 8601
}
```

---

## 🔄 Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PAYMENT FLOW DIAGRAM                           │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌────────────────────┐         ┌──────────────┐
│   AyScroll   │         │  NFKS Payment      │         │    Email     │
│   Client     │         │    Gateway         │         │   Service    │
└──────┬───────┘         └─────────┬──────────┘         └──────┬───────┘
       │                           │                            │
       │ 1. User clicks            │                            │
       │    "Upgrade to Pro"       │                            │
       │                           │                            │
       │ 2. POST /checkout/create  │                            │
       │    (order, customer,      │                            │
       │     plan, webhooks)       │                            │
       ├──────────────────────────>│                            │
       │                           │                            │
       │                           │ 3. Create checkout session │
       │                           │    Generate checkout_id    │
       │                           │    Store in database       │
       │                           │                            │
       │ 4. Return checkout_url    │                            │
       │<──────────────────────────┤                            │
       │                           │                            │
       │ 5. Redirect user to       │                            │
       │    payments.nfks.co.in    │                            │
       ├──────────────────────────>│                            │
       │                           │                            │
       │    ┌──────────────────────────────────┐                │
       │    │  User on Payment Gateway Page    │                │
       │    │  - Fills card details            │                │
       │    │  - Enters billing address        │                │
       │    │  - Reviews order summary         │                │
       │    │  - Clicks "Pay Now"              │                │
       │    └──────────────────────────────────┘                │
       │                           │                            │
       │                           │ 6. Process payment         │
       │                           │    (simulate 2-3 sec)      │
       │                           │                            │
       │                           │ 7. Generate invoice PDF    │
       │                           │    Create transaction      │
       │                           │    Update checkout status  │
       │                           │                            │
       │ 8. Redirect to            │                            │
       │    success_url with       │                            │
       │    session_id & order_id  │                            │
       │<──────────────────────────┤                            │
       │                           │                            │
       │ 9. Show "Processing..."   │                            │
       │    message on client      │                            │
       │                           │                            │
       │                           │ 10. POST webhook to        │
       │                           │     client's webhook_url   │
       │<──────────────────────────┤                            │
       │                           │                            │
       │ 11. Verify signature      │                            │
       │     Update subscription   │                            │
       │     in Supabase           │                            │
       │                           │                            │
       │ 12. Return 200 OK         │                            │
       ├──────────────────────────>│                            │
       │                           │                            │
       │                           │ 13. Send invoice email     │
       │                           ├───────────────────────────>│
       │                           │                            │
       │                           │                            │ 14. Email
       │                           │                            │     delivered
       │                           │                            │     to customer
       │                           │                            │
       │ 15. Show success message  │                            │
       │     "Payment successful!  │                            │
       │      Invoice sent to      │                            │
       │      your email"          │                            │
       │                           │                            │
```

---

## 🔐 Security & Authentication

### 1. API Key Authentication

Generate API keys for clients:
```typescript
// Format: pk_live_... (production) or pk_test_... (sandbox)
const apiKey = "pk_live_1234567890abcdefghijklmnop";
```

**Storage**: 
- Store in environment variables on client side
- Never expose in frontend code
- Use server-side API routes in Next.js

### 2. Webhook Signature Verification

**Algorithm**: HMAC SHA256

**Signing Process** (Payment Gateway):
```typescript
import crypto from 'crypto';

const payload = JSON.stringify(webhookData);
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

// Send in header
headers['X-NFKS-Signature'] = signature;
```

**Verification Process** (Client):
```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Usage in webhook handler
const rawBody = await request.text();
const signature = request.headers.get('X-NFKS-Signature');
const isValid = verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET);

if (!isValid) {
  return new Response('Invalid signature', { status: 401 });
}
```

### 3. HTTPS Only
- All communication must use HTTPS
- Reject HTTP requests in production

### 4. CORS Configuration
```typescript
// Allow only specific origins
const allowedOrigins = [
  'https://ayscroll.com',
  'https://www.ayscroll.com'
];
```

---

## 📄 Invoice Generation

### Invoice Requirements

#### 1. Invoice Number Format
```
INV-{YEAR}-{SEQUENCE}
Example: INV-2026-001234
```

#### 2. Invoice Content (PDF)

**Header Section**:
- Company logo (NFKS/AyScroll)
- Invoice title
- Invoice number
- Issue date

**Billing Details**:
```
Bill To:
{customer.name}
{customer.email}
{customer.address.line1}
{customer.address.city}, {customer.address.state} {customer.address.postal_code}
{customer.address.country}
```

**Payment Details**:
```
Payment Method: {card_brand} ending in {last4}
Transaction ID: {transaction_id}
Payment Date: {completed_at}
```

**Itemized Breakdown**:
```
Item                              Period                    Amount
─────────────────────────────────────────────────────────────────
{plan_name}                       {start} - {end}           {amount}

                                                  Subtotal: {subtotal}
                                                       Tax: {tax}
                                                     Total: {total}
```

**Footer**:
- Support email: support@ayscroll.com
- Terms & conditions link
- Privacy policy link
- Company address

#### 3. PDF Generation Libraries (Next.js)

**Recommended**: 
- `@react-pdf/renderer` - React components to PDF
- `pdfkit` - Low-level PDF generation
- `jsPDF` - Client-side PDF generation

**Example with @react-pdf/renderer**:
```typescript
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const Invoice = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>Invoice #{data.invoice_number}</Text>
      </View>
      {/* ... rest of invoice */}
    </Page>
  </Document>
);
```

#### 4. Email Delivery

**Email Service Options**:
- Resend (recommended for Next.js)
- SendGrid
- AWS SES
- Postmark

**Email Template**:
```html
Subject: Your AyScroll Invoice - {invoice_number}

Body:
Hi {customer.name},

Thank you for your payment! Your subscription to {plan_name} is now active.

Payment Details:
- Amount: {currency} {amount}
- Transaction ID: {transaction_id}
- Date: {completed_at}

Your invoice is attached to this email.

Billing Period: {start} to {end}
Next Billing Date: {next_billing_date}

If you have any questions, please contact us at support@ayscroll.com

Best regards,
The AyScroll Team
```

**Attachment**: Invoice PDF

---

## ⚠️ Error Handling

### Error Response Format
```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: object;
  };
}
```

### Error Codes

#### Checkout Creation Errors:
| Code | Message | HTTP Status |
|------|---------|-------------|
| `invalid_amount` | Amount must be greater than 0 | 400 |
| `invalid_currency` | Currency not supported | 400 |
| `missing_customer` | Customer details are required | 400 |
| `invalid_email` | Invalid email format | 400 |
| `invalid_redirect_url` | Redirect URL must be HTTPS | 400 |
| `invalid_webhook_url` | Webhook URL must be HTTPS | 400 |
| `unauthorized` | Invalid API key | 401 |
| `rate_limit_exceeded` | Too many requests | 429 |

#### Payment Processing Errors:
| Code | Message | HTTP Status |
|------|---------|-------------|
| `checkout_expired` | Checkout session has expired | 400 |
| `checkout_not_found` | Checkout session not found | 404 |
| `payment_failed` | Payment processing failed | 400 |
| `card_declined` | Card was declined | 400 |
| `insufficient_funds` | Insufficient funds | 400 |
| `invalid_card` | Invalid card details | 400 |
| `expired_card` | Card has expired | 400 |
| `invalid_cvv` | Invalid CVV | 400 |

#### Webhook Errors:
| Code | Message | HTTP Status |
|------|---------|-------------|
| `webhook_failed` | Failed to deliver webhook | 500 |
| `webhook_timeout` | Webhook endpoint timeout | 504 |

---

## 🧪 Testing

### Test Mode

Enable test mode using sandbox API:
```
Base URL: https://sandbox.payments.nfks.co.in/api/v1
API Key: pk_test_...
```

### Test Card Numbers

**Success Cases**:
```
Visa:       4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
Amex:       3782 822463 10005
RuPay:      6521 1234 5678 9012
```

**Failure Cases**:
```
Card Declined:       4000 0000 0000 0002
Insufficient Funds:  4000 0000 0000 9995
Expired Card:        4000 0000 0000 0069
Invalid CVV:         4000 0000 0000 0127
```

### Handling Defaults & Abandonment
When a user cancels (closes tab, hits back button) or payment fails:

1.  **The Gateway**:
    *   Detects the exit via `pagehide` event (beacon).
    *   Sends a `payment.failed` webhook with `error.code: "user_cancelled"`.
    *   Attempting to pay with a card triggering failure redirects to `failure_url`.

2.  **AyScroll Backend (Webhook)**:
    *   Listen for `payment.failed`.
    *   If `error.code === 'user_cancelled'`, consider sending an "Abandonment Recovery" email (optional).
    *   If `error.code === 'insufficient_funds'`, prompt user to try another card.

3.  **AyScroll Frontend**:
    *   **Redirects**: Check URL params: `?status=failed&reason=...`. Show a Toast notification.
    *   **Browser Back**: The user will land on your page *without* URL params. Recommended: Re-fetch subscription status on window focus to ensure UI reflects current state (inactive).

**Test Details** (use with any test card):
- **Success**: Use a standard card.
- **Failure**: Use card ending in `0000`.
- **Cancel**: Close the tab or click Browser Back during checkout.

### Test Details (use with any test card):
- Expiry: Any future date (e.g., 12/28)
- CVV: Any 3 digits (e.g., 123)
- Name: Any name
- Address: Any valid address

### Webhook Testing

Use tools like:
- **ngrok**: Expose local server for webhook testing
- **webhook.site**: Inspect webhook payloads
- **Postman**: Manual webhook simulation

---

## 📦 Implementation Checklist

### Payment Gateway (Next.js) - Your Task:

#### Phase 1: Core Setup
- [ ] Initialize Next.js project
- [ ] Set up database (PostgreSQL/MongoDB) for:
  - [ ] Checkout sessions
  - [ ] Transactions
  - [ ] Invoices
- [ ] Configure environment variables
- [ ] Set up API routes structure

#### Phase 2: Checkout API
- [ ] `POST /api/v1/checkout/create` endpoint
  - [ ] Validate request payload
  - [ ] Generate checkout_id
  - [ ] Store session in database
  - [ ] Return checkout_url
- [ ] `GET /api/v1/checkout/[id]` endpoint
  - [ ] Retrieve session details
  - [ ] Return payment status

#### Phase 3: Payment UI
- [ ] Create checkout page (`/checkout/[id]`)
  - [ ] Payment form (card details, billing)
  - [ ] Order summary
  - [ ] Security badges
  - [ ] Loading states
- [ ] Form validation
  - [ ] Card number (Luhn algorithm)
  - [ ] Expiry date
  - [ ] CVV
  - [ ] Email format
- [ ] Payment processing simulation
  - [ ] 2-3 second delay
  - [ ] Success/failure logic based on test cards
  - [ ] Update database

#### Phase 4: Invoice Generation
- [ ] Set up PDF generation library
- [ ] Create invoice template
- [ ] Generate invoice PDF after successful payment
- [ ] Store invoice in database
- [ ] Upload PDF to storage (S3/Cloudinary)

#### Phase 5: Email Service
- [ ] Set up email service (Resend/SendGrid)
- [ ] Create email template
- [ ] Send invoice email after payment
- [ ] Handle email failures

#### Phase 6: Webhooks
- [ ] Implement webhook delivery
  - [ ] Generate signature
  - [ ] POST to client webhook_url
  - [ ] Retry logic (3 attempts)
  - [ ] Log webhook attempts
- [ ] Handle webhook responses

#### Phase 7: Redirects
- [ ] Implement redirect logic
  - [ ] Success redirect
  - [ ] Failure redirect
  - [ ] Cancel redirect
- [ ] Append query parameters

#### Phase 8: Security
- [ ] API key authentication
- [ ] HMAC signature generation
- [ ] HTTPS enforcement
- [ ] CORS configuration
- [ ] Rate limiting

#### Phase 9: Testing
- [ ] Test card number validation
- [ ] Test payment flows
- [ ] Test webhook delivery
- [ ] Test email delivery
- [ ] Test error scenarios

#### Phase 10: Documentation
- [ ] API documentation
- [ ] Integration guide
- [ ] Test credentials

---

### AyScroll Client - Already Handled:

- [ ] Create checkout session from SubscriptionSection
- [ ] Redirect to payment gateway
- [ ] Handle redirect callbacks
- [ ] Implement webhook endpoint
- [ ] Verify webhook signatures
- [ ] Update subscription in database
- [ ] Show success/error messages

---

## 🎨 UI/UX Requirements

### Payment Page Design

**Must Have**:
1. **Modern, Premium Look**
   - Glassmorphism effects
   - Smooth animations
   - Gradient accents
   - Dark mode support

2. **Security Indicators**
   - SSL/HTTPS badge
   - "Secure Payment" text
   - Lock icons
   - Trust badges

3. **Payment Form**
   - Card number input (auto-formatted: `XXXX XXXX XXXX XXXX`)
   - Expiry date (MM/YY format)
   - CVV (masked input)
   - Cardholder name
   - Billing address fields

4. **Order Summary**
   - Plan name
   - Billing period
   - Amount breakdown
   - Total amount (prominent)

5. **Loading States**
   - "Processing payment..." spinner
   - Progress indicators
   - Disable form during processing

6. **Success/Error States**
   - Success animation (checkmark, confetti)
   - Error messages (clear, actionable)
   - Redirect countdown

**Inspiration**:
- Stripe Checkout
- Razorpay
- PayPal

---

## 📞 Support

For questions or issues:
- Email: dev@nfks.co.in
- Documentation: https://docs.payments.nfks.co.in
- Status Page: https://status.payments.nfks.co.in

---

## 📝 Notes

1. **Invoice Timing**: Send invoice email AFTER successful webhook delivery to ensure subscription is updated first.

2. **Webhook Reliability**: Implement retry logic (3 attempts with exponential backoff: 1s, 5s, 25s).

3. **Session Expiry**: Checkout sessions expire after 15 minutes. Show countdown timer on payment page.

4. **Currency Support**: Start with INR, add more currencies later.

5. **Tax Calculation**: For demo, you can skip tax or use a flat 18% GST for Indian customers.

6. **Invoice Storage**: Store PDFs for at least 7 years (compliance requirement).

7. **Webhook Logs**: Log all webhook attempts for debugging.

8. **Test Mode**: Clearly indicate test mode on payment page (banner/watermark).

---

## 🚀 Quick Start for Payment Gateway

```bash
# 1. Create Next.js project
npx create-next-app@latest nfks-payment-gateway
cd nfks-payment-gateway

# 2. Install dependencies
npm install @react-pdf/renderer resend zod

# 3. Set up environment variables
cp .env.example .env.local

# 4. Run development server
npm run dev

# 5. Test checkout creation
curl -X POST http://localhost:3000/api/v1/checkout/create \
  -H "Authorization: Bearer pk_test_123" \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

---

**Version**: 1.0.0  
**Last Updated**: 2026-01-13  
**Author**: Mayank Jha (@thenfks)
