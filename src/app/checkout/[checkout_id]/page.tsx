'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import NotificationBar from '@/components/NotificationBar';
import CustomDropdown from '@/components/CustomDropdown';
import { CheckoutSession } from '@/types/checkout';

// Assets (Standardized imports)
import walletAnimation from '@/assets/lottie/wallet.json';
import cardSuccessAnimation from '@/assets/lottie/cardsuccess.json';
import processingAnimation from '@/assets/lottie/proccessing.json';
import successAnimation from '@/assets/lottie/success.json';
import failedAnimation from '@/assets/lottie/failed.json';
import qrAnimation from '@/assets/lottie/qr.json';
import bankAnimation from '@/assets/lottie/bank.json';
import rocketAnimation from '@/assets/lottie/rocket.json';

// Dynamic import for lottie-react
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

type ViewState = 'loading' | 'method-selection' | 'details' | 'processing' | 'success' | 'failed' | 'expired' | 'redirecting';

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const checkout_id = params.checkout_id as string;

    // App State
    const [viewState, setViewState] = useState<ViewState>('loading');
    const [session, setSession] = useState<CheckoutSession | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ show: boolean; title: string; message: string; type?: 'success' | 'error' }>({ show: false, title: '', message: '', type: 'error' });

    // Form State
    const [cardNumber, setCardNumber] = useState('');
    const [expMonth, setExpMonth] = useState('');
    const [expYear, setExpYear] = useState('');
    const [cvc, setCvc] = useState('');
    const [name, setName] = useState('');
    const [upiId, setUpiId] = useState('');
    const [referenceId, setReferenceId] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('India');
    const [selectedBank, setSelectedBank] = useState('');
    const [upiMode, setUpiMode] = useState<'apps' | 'id'>('apps');

    const walletBalance = referenceId.toLowerCase() === 'iluvmayank' ? 10000 : 0;

    // 1. Fetch Session Data
    useEffect(() => {
        async function fetchSession() {
            try {
                const res = await fetch(`/api/v1/checkout/${checkout_id}`);
                const data = await res.json();

                if (!res.ok) {
                    if (res.status === 410 || res.status === 404) {
                        setViewState('expired');
                        return;
                    }
                    throw new Error(data.error?.message || 'Failed to load session');
                }

                setSession(data.data);
                setName(data.data.customer.name); // Pre-fill name

                // 3. Handle Payment Method Preference
                if (data.data.payment_method_preference) {
                    const pref = data.data.payment_method_preference;
                    setSelectedMethod(pref.type);

                    if (pref.type === 'upi' && pref.upi_id) {
                        setUpiId(pref.upi_id);
                        setUpiMode('id');
                    }

                    if (pref.type === 'card' && pref.card_last4) {
                        setCardNumber(`**** **** **** ${pref.card_last4}`);
                        // Optionally set month/year if available (though standard says card_expiry is string)
                        if (pref.card_expiry) {
                            const [m, y] = pref.card_expiry.split('/');
                            setExpMonth(m);
                            setExpYear(y);
                        }
                    }

                    setViewState('details');
                } else {
                    setViewState('method-selection');
                }
            } catch (error) {
                console.error(error);
                setNotification({ show: true, title: 'Error', message: 'Failed to load payment session', type: 'error' });
            }
        }

        if (checkout_id) {
            fetchSession();
        }
    }, [checkout_id]);

    // 2. Redirection Logic
    useEffect(() => {
        if (viewState === 'success' && session) {
            const timer = setTimeout(() => {
                setViewState('redirecting');
            }, 3000); // Show success message for 3 seconds
            return () => clearTimeout(timer);
        }
        if (viewState === 'redirecting' && session) {
            const timer = setTimeout(() => {
                window.location.href = session.redirect_urls.success;
            }, 3000); // Show redirecting animation for 3 seconds
            return () => clearTimeout(timer);
        }
    }, [viewState, session]);

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length <= 16) {
            setCardNumber(val);
        }
    };

    const handleMethodSelect = (method: string) => {
        setSelectedMethod(method);
        setViewState('details');
    };

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session) return;

        // wallet check
        if (selectedMethod === 'wallet' && session.amount > walletBalance) {
            setNotification({ show: true, title: 'Insufficient Balance', message: 'You do not have enough balance.', type: 'error' });
            setTimeout(() => setNotification({ show: false, title: '', message: '', type: 'error' }), 4000);
            return;
        }

        // Net Banking Error Simulation
        if (selectedMethod === 'netbanking') {
            const bankName = selectedBank || 'Bank';
            setNotification({
                show: true,
                title: 'Connection Failed',
                message: `Connect to ${bankName} server failed. Please use other Payment Method.`,
                type: 'error'
            });
            setTimeout(() => setNotification({ show: false, title: '', message: '', type: 'error' }), 5000);
            return;
        }

        setViewState('processing');

        // Minimum visible delay for UX
        const startTime = Date.now();

        try {
            const res = await fetch(`/api/v1/checkout/${checkout_id}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    method: selectedMethod,
                    details: {
                        cardNumber,
                        name,
                        // In a real app, send tokenized data!
                    }
                })
            });

            const data = await res.json();

            // Ensure at least 2.5s of animation plays
            const elapsed = Date.now() - startTime;
            if (elapsed < 2500) {
                await new Promise(resolve => setTimeout(resolve, 2500 - elapsed));
            }

            if (!res.ok) {
                // specific handling for already processed
                if (data.error?.code === 'invalid_status') {
                    setViewState('details');
                    setNotification({
                        show: true,
                        title: 'Transaction Complete',
                        message: 'This transaction has already been successfully processed.',
                        type: 'success'
                    });
                    return;
                }
                throw new Error(data.error?.message || 'Payment failed');
            }

            // Success!
            setViewState('success');

            // Allow user to view success animation before redirect
            // The success view has a "Return to Merchant" button uses session.redirect_urls.success

        } catch (error) {
            console.error(error);
            setViewState('details'); // Stay on form
            setNotification({
                show: true,
                title: 'Payment Failed',
                message: error instanceof Error ? error.message : 'Transaction could not be processed.',
                type: 'error'
            });
        }
    };

    // --- RENDER HELPERS ---

    if (viewState === 'loading') {
        return <div className="flex-center" style={{ height: '100vh', color: 'white' }}>Loading Payment Session...</div>; // Simplified loading
    }

    if (viewState === 'expired') {
        return (
            <div className="flex-center" style={{ height: '100vh', color: 'white', flexDirection: 'column' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Session Expired</h1>
                <p style={{ color: '#888' }}>This payment link is no longer valid.</p>
            </div>
        );
    }

    if (!session) return null;

    // Formatting amount
    const amountStr = (session.amount).toFixed(2);
    const [whole, decimal] = amountStr.split('.');

    // --- VIEWS ---

    // Processing
    if (viewState === 'processing') {
        return (
            <main className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', textAlign: 'center', width: '100%' }}>
                    <div className={`animation-container ${selectedMethod === 'card' ? 'card' : 'processing'}`}>
                        <Lottie
                            animationData={selectedMethod === 'card' ? cardSuccessAnimation : processingAnimation}
                            loop={true}
                            autoplay={true}
                        />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#fff' }}>Processing Transaction</h2>
                    <p style={{ color: '#94a3b8' }}>Please do not close this window...</p>
                </div>
            </main>
        );
    }

    // Success
    if (viewState === 'success') {
        return (
            <main className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', textAlign: 'center', width: '100%' }}>
                    <div className="animation-container processing">
                        <Lottie animationData={successAnimation} loop={false} autoplay={true} />
                    </div>
                    <h1 style={{ fontSize: '32px', marginBottom: '12px', fontWeight: 'bold', color: '#fff' }}>Payment Accepted</h1>
                    <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '40px' }}>Your subscription is now active!</p>
                    <button className="btn-primary" style={{ maxWidth: '300px' }} onClick={() => window.location.href = session.redirect_urls.success}>
                        Return to {session.metadata?.app_name || 'Merchant'}
                    </button>
                </div>
            </main>
        );
    }

    // Redirecting
    if (viewState === 'redirecting') {
        return (
            <main className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', textAlign: 'center', width: '100%' }}>
                    <div className="animation-container processing" style={{ width: '400px', height: '400px' }}>
                        <Lottie animationData={rocketAnimation} loop={true} autoplay={true} />
                    </div>
                    <h1 style={{ fontSize: '32px', marginBottom: '12px', fontWeight: 'bold', color: '#fff' }}>Redirecting...</h1>
                    <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '40px' }}>Taking you back to {session.metadata?.app_name || 'Merchant'}</p>
                    <div className="loading-dots" style={{ display: 'flex', gap: '8px' }}>
                        <div className="dot" style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }}></div>
                        <div className="dot" style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.16s' }}></div>
                        <div className="dot" style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.32s' }}></div>
                    </div>
                    <button className="btn-primary" style={{ maxWidth: '300px', marginTop: '40px' }} onClick={() => window.location.href = session.redirect_urls.success}>
                        Return to {session.metadata?.app_name || 'Merchant'}
                    </button>
                </div>
            </main>
        );
    }

    // Main Layout
    return (
        <>
            <NotificationBar
                show={notification.show}
                title={notification.title}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ show: false, title: '', message: '', type: 'error' })}
            />
            <main className="fade-in">
                <div className="checkout-container">
                    {/* Left Side (Methods/Form) */}
                    <div className="left-side" style={{ position: 'relative' }}>
                        <div className="header-logo">
                            <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                                <Image src="/nfks_logo.png" alt="nFKs Pay" fill style={{ objectFit: 'contain' }} />
                            </div>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>nFKs Pay</h2>
                        </div>

                        {viewState === 'method-selection' && (
                            <div className="fade-in">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ fontSize: '18px', color: '#fff', margin: 0 }}>Select Payment Method</h3>
                                    {session?.payment_method_preference && (
                                        <div style={{
                                            background: '#4CAF50',
                                            color: '#fff',
                                            padding: '3px 10px',
                                            borderRadius: '20px',
                                            fontSize: '10px',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}>Recommended</div>
                                    )}
                                </div>
                                <div className="method-grid">
                                    <div
                                        className={`method-card ${session?.payment_method_preference?.type === 'card' ? 'preferred' : ''}`}
                                        onClick={() => handleMethodSelect('card')}
                                    >
                                        <svg className="method-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                        <span className="method-title">Credit / Debit Card</span>
                                        <span className="method-desc">Pay securely with Visa, Mastercard</span>
                                    </div>
                                    <div
                                        className={`method-card ${session?.payment_method_preference?.type === 'upi' ? 'preferred' : ''}`}
                                        onClick={() => handleMethodSelect('upi')}
                                    >
                                        <svg className="method-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                        <span className="method-title">UPI / QR</span>
                                        <span className="method-desc">Instant payment via any UPI app</span>
                                    </div>
                                    <div className="method-card" onClick={() => handleMethodSelect('netbanking')}>
                                        <svg className="method-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18M5 21v-7M19 21v-7M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v3H4v-3zM12 3v4"></path></svg>
                                        <span className="method-title">Net Banking</span>
                                        <span className="method-desc">Directly from your bank account</span>
                                    </div>
                                    <div className="method-card" onClick={() => handleMethodSelect('wallet')}>
                                        <svg className="method-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
                                        <span className="method-title">Wallet</span>
                                        <span className="method-desc">Balance: {walletBalance.toLocaleString()} INR</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {viewState === 'details' && (
                            <form onSubmit={handlePay} className="fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
                                <button type="button" className="btn-back" onClick={() => setViewState('method-selection')}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                                    Change Method
                                </button>

                                {selectedMethod === 'card' && (
                                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
                                        {session?.payment_method_preference?.type === 'card' && session?.payment_method_preference?.card_last4 && (
                                            <div className="saved-card-tile">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <div style={{ width: '48px', height: '32px', background: '#1c1c1c', border: '1px solid #333', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="12" r="7" fill="#EB001B" fillOpacity="0.8" /><circle cx="17" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8" /></svg>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>•••• {session.payment_method_preference.card_last4}</div>
                                                        <div style={{ fontSize: '11px', color: '#4CAF50', fontWeight: '600' }}>Saved Preference</div>
                                                    </div>
                                                </div>
                                                <div style={{ color: '#666', fontSize: '12px' }}>
                                                    Expires {session.payment_method_preference.card_expiry || '--/--'}
                                                </div>
                                            </div>
                                        )}

                                        <div className="section-label" style={{ marginBottom: '12px', color: '#666', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {session?.payment_method_preference?.type === 'card' ? 'Or Pay with new Card' : 'Card Details'}
                                        </div>

                                        <div className="input-group">
                                            <div className="section-label">Card Number</div>
                                            <div className="input-wrapper">
                                                <div style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center' }}>
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="12" r="7" fill="#EB001B" fillOpacity="0.8" /><circle cx="17" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8" /></svg>
                                                </div>
                                                <input type="text" className="input-field" value={cardNumber.replace(/(.{4})/g, '$1   ').trim()} onChange={handleCardChange} placeholder="0000 0000 0000 0000" maxLength={26} style={{ paddingLeft: '50px', fontFamily: 'monospace' }} />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <div className="section-label">Account Holder Name</div>
                                            <div className="input-wrapper">
                                                <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name on Card" />
                                            </div>
                                        </div>
                                        <div className="input-group">
                                            <div className="section-label">CVV & Expiry</div>
                                            <div className="row">
                                                <div className="input-wrapper col">
                                                    <input type="text" className="input-field" value={expMonth} onChange={(e) => setExpMonth(e.target.value)} placeholder="MM" style={{ textAlign: 'center' }} />
                                                </div>
                                                <span style={{ color: '#666', fontSize: '18px' }}>/</span>
                                                <div className="input-wrapper col">
                                                    <input type="text" className="input-field" value={expYear} onChange={(e) => setExpYear(e.target.value)} placeholder="YY" style={{ textAlign: 'center' }} />
                                                </div>
                                                <div className="input-wrapper col">
                                                    <input type="password" className="input-field" value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder="CVV" style={{ textAlign: 'center' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedMethod === 'upi' && (
                                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ textAlign: 'center', marginBottom: '24px', padding: '20px', background: '#0a0a0a', borderRadius: '16px', border: '1px solid #333' }}>
                                            <div style={{ width: '200px', height: '200px', background: '#fff', margin: '0 auto 16px', padding: '10px' }}>
                                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                    <Image src="/qr.jpeg" alt="Payment QR" fill style={{ objectFit: 'contain' }} />
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '14px', color: '#888' }}>Scan with any UPI App</span>
                                        </div>

                                        <div style={{ display: 'flex', gap: '32px', marginBottom: '20px', borderBottom: '1px solid #222' }}>
                                            <div
                                                onClick={() => setUpiMode('apps')}
                                                style={{
                                                    paddingBottom: '12px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: upiMode === 'apps' ? '#fff' : '#666',
                                                    borderBottom: upiMode === 'apps' ? '2px solid #fff' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                Pay with App
                                            </div>
                                            <div
                                                onClick={() => setUpiMode('id')}
                                                style={{
                                                    paddingBottom: '12px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    color: upiMode === 'id' ? '#fff' : '#666',
                                                    borderBottom: upiMode === 'id' ? '2px solid #fff' : 'none',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                Enter UPI ID
                                            </div>
                                        </div>

                                        {upiMode === 'apps' ? (
                                            <div className="fade-in" style={{ marginBottom: '24px' }}>
                                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                                    {[
                                                        { name: 'GPay', icon: '/logos/gpay.svg' },
                                                        { name: 'PhonePe', icon: '/logos/phonepe.svg' },
                                                        { name: 'Paytm', icon: '/logos/paytm.svg' },
                                                        { name: 'Apple Pay', icon: '/logos/apple.svg' },
                                                        { name: 'Super.money', icon: '/logos/supermoney.svg' },
                                                    ].map((app) => (
                                                        <div
                                                            key={app.name}
                                                            onClick={() => console.log(`Selected ${app.name}`)}
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                background: 'transparent',
                                                                borderRadius: '12px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                cursor: 'pointer',
                                                                transition: 'transform 0.1s',
                                                                padding: '8px'
                                                            }}
                                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                        >
                                                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                                <Image
                                                                    src={app.icon}
                                                                    alt={app.name}
                                                                    fill
                                                                    style={{
                                                                        objectFit: 'contain'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="fade-in input-group">
                                                <div className="input-wrapper">
                                                    <input type="text" className="input-field" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="username@oksbi" />
                                                    {session?.payment_method_preference?.type === 'upi' && session?.payment_method_preference?.upi_id === upiId && (
                                                        <div className="saved-input-badge">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                            Saved
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedMethod === 'wallet' && (
                                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div className="input-group">
                                            <div className="section-label">Reference ID</div>
                                            <div className="input-wrapper">
                                                <input
                                                    type="text"
                                                    className="input-field"
                                                    value={referenceId}
                                                    onChange={(e) => setReferenceId(e.target.value)}
                                                    placeholder="Enter reference ID"
                                                />
                                            </div>
                                        </div>

                                        <div style={{ padding: '24px', background: '#1c1c1c', borderRadius: '16px', border: '1px solid #333', marginBottom: '24px' }}>
                                            <span style={{ color: '#888', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Available Balance</span>
                                            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>₹ {walletBalance.toLocaleString()}</span>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#111', borderRadius: '12px', border: '1px solid #222' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
                                                    </div>
                                                    <div style={{ textAlign: 'left' }}>
                                                        <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>nFKs Wallet</div>
                                                        <div style={{ color: '#666', fontSize: '11px' }}>**** 8829</div>
                                                    </div>
                                                </div>
                                                <div style={{ color: '#4CAF50', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>Top Up</div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <div style={{ flex: 1, padding: '12px', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #222', textAlign: 'left' }}>
                                                    <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>Cashback</div>
                                                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>₹ 50.00</div>
                                                </div>
                                                <div style={{ flex: 1, padding: '12px', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #222', textAlign: 'left' }}>
                                                    <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>Points</div>
                                                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>240 pts</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedMethod === 'netbanking' && (
                                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
                                        <CustomDropdown
                                            label="Select Country"
                                            placeholder="Choose your country..."
                                            value={selectedCountry}
                                            onChange={setSelectedCountry}
                                            options={[
                                                { value: 'India', label: 'India', iconUrl: '/logos/country/india.svg' },
                                                { value: 'United States', label: 'United States', iconUrl: '/logos/country/us.svg' },
                                                { value: 'United Kingdom', label: 'United Kingdom', iconUrl: '/logos/country/uk.svg' },
                                                { value: 'Canada', label: 'Canada', iconUrl: '/logos/country/canada.svg' },
                                                { value: 'Australia', label: 'Australia', iconUrl: '/logos/country/australia.svg' },
                                                { value: 'Singapore', label: 'Singapore', iconUrl: '/logos/country/singapore.svg' },
                                            ]}
                                        />
                                        <CustomDropdown
                                            label="Select Your Bank"
                                            placeholder="Choose your bank..."
                                            value={selectedBank}
                                            onChange={setSelectedBank}
                                            options={[
                                                { value: 'HDFC', label: 'HDFC Bank', iconUrl: '/logos/bank/hdfc.svg' },
                                                { value: 'ICICI', label: 'ICICI Bank', iconUrl: '/logos/bank/icici.svg', size: 'small' },
                                                { value: 'SBI', label: 'State Bank of India', iconUrl: '/logos/bank/sbi.svg', size: 'small' },
                                                { value: 'AXIS', label: 'Axis Bank', iconUrl: '/logos/bank/axis.svg', size: 'small' },
                                                { value: 'KOTAK', label: 'Kotak Mahindra Bank', iconUrl: '/logos/bank/kotek.svg' },
                                                { value: 'PNB', label: 'Punjab National Bank', iconUrl: '/logos/bank/pnb.svg' },
                                                { value: 'BOB', label: 'Bank of Baroda', iconUrl: '/logos/bank/bob.svg' },
                                                { value: 'YES', label: 'Yes Bank', iconUrl: '/logos/bank/yes-bank.svg' },
                                                { value: 'UNION', label: 'Union Bank of India', iconUrl: '/logos/bank/union-bank-of-india.svg', size: 'small' },
                                                { value: 'BOA', label: 'Bank of America', iconUrl: '/logos/bank/bank-of-america.svg' },
                                                { value: 'DEUTSCHE', label: 'Deutsche Bank', iconUrl: '/logos/bank/deutsche-bank-logo-without-wordmark.svg', size: 'small' },
                                                { value: 'STANDARD', label: 'Standard Bank', iconUrl: '/logos/bank/standard-bank.svg' },
                                            ]}
                                        />
                                    </div>
                                )}

                                <button type="submit" className="btn-primary">
                                    Pay {session.currency} {session.amount}
                                </button>
                            </form>
                        )}
                        <div className="footer-links" style={{ position: 'absolute', bottom: '24px', left: '50px' }}>
                            <span>Help</span>
                            <span>Privacy</span>
                            <span>Terms</span>
                        </div>
                    </div>

                    {/* Right Side - Ticket UI */}
                    <div className="right-side">
                        <div className="ticket">
                            {/* Floating Card UI for Card Method */}
                            {(selectedMethod === 'card' || !selectedMethod) && (
                                <div className="floating-lottie-container fade-in">
                                    <div className="floating-card">
                                        <div className="fc-top">
                                            <Image src="/chip.png" alt="Chip" width={50} height={40} style={{ objectFit: 'contain' }} />
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path></svg>
                                        </div>
                                        <div style={{ marginTop: 'auto', marginBottom: '24px', paddingBottom: '20px' }}>
                                            <div className="fc-name">{name || 'Card Holder'}</div>
                                            <div className="fc-number">•••• {cardNumber.slice(-4) || 'XXXX'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Floating Lottie for UPI, Netbanking, Wallet */}
                            {(selectedMethod === 'upi' || selectedMethod === 'netbanking' || selectedMethod === 'wallet') && (
                                <div className="floating-lottie-container fade-in">
                                    <div style={{ width: selectedMethod === 'wallet' ? '280px' : '380px', height: selectedMethod === 'wallet' ? '380px' : '380px', position: 'relative', top: '-20px' }}>
                                        <Lottie
                                            animationData={
                                                selectedMethod === 'upi' ? qrAnimation :
                                                    selectedMethod === 'netbanking' ? bankAnimation :
                                                        walletAnimation
                                            }
                                            loop={true}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="ticket-details">
                                <div className="ticket-row">
                                    <span>Order ID</span>
                                    <span className="ticket-val">{session.order_id}</span>
                                </div>
                                <div className="ticket-row">
                                    <span>Plan</span>
                                    <span className="ticket-val">{session.plan_name}</span>
                                </div>
                                <div className="ticket-row">
                                    <span>Customer</span>
                                    <span className="ticket-val">{session.customer.name}</span>
                                </div>
                                <div className="ticket-divider"></div>
                                <div className="ticket-row">
                                    <span className="ticket-total-label">Total</span>
                                    <span className="ticket-total-amount">
                                        <small>{session.currency}</small> {whole}.<small>{decimal || '00'}</small>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div style={{ position: 'absolute', bottom: '24px', right: '40px', fontSize: '11px', color: '#666', fontFamily: 'var(--font-geist-mono)', opacity: 0.8 }}>
                            Developed by Mayank Kumar Jha
                        </div>
                    </div>
                </div>
            </main >
        </>
    );
}
