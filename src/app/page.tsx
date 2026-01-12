'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
// Assets
import walletAnimation from '../assets/lottie/wallet.json';
import cardSuccessAnimation from '../assets/lottie/cardsuccess.json';
import processingAnimation from '../assets/lottie/proccessing.json';
import successAnimation from '../assets/lottie/success.json';
import failedAnimation from '../assets/lottie/failed.json';

// Dynamic import for lottie-react to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

type ViewState = 'method-selection' | 'details' | 'processing' | 'success' | 'failed';

function PaymentContent() {
   const searchParams = useSearchParams();

   // App State
   const [viewState, setViewState] = useState<ViewState>('method-selection');
   const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

   // Data from Microservice Params
   const [orderData, setOrderData] = useState({
      amount: '549.99',
      currency: 'USD',
      orderId: '1266201',
      product: 'MackBook Air',
      company: 'Apple',
      vat: '100.00'
   });

   const [walletBalance] = useState(10000);

   useEffect(() => {
      // Simulate reading params or fetching order details
      const amount = searchParams.get('amount');
      const currency = searchParams.get('currency');
      const orderId = searchParams.get('orderId');
      const product = searchParams.get('product');
      const clientName = searchParams.get('name');

      if (amount || orderId || clientName) {
         setOrderData(prev => ({
            ...prev,
            amount: amount || prev.amount,
            currency: currency || prev.currency,
            orderId: orderId || prev.orderId,
            product: product || prev.product
         }));

         if (clientName) setName(clientName);
      }
   }, [searchParams]);

   // Form State
   const [cardNumber, setCardNumber] = useState('');
   const [expMonth, setExpMonth] = useState('09');
   const [expYear, setExpYear] = useState('26');
   const [cvc, setCvc] = useState('');
   const [name, setName] = useState('John Doe');

   const [upiId, setUpiId] = useState('');

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
      setViewState('processing');

      // Simulate API Call
      setTimeout(() => {
         // Simple logic for success/fail demo
         // For now always success unless name is 'fail'
         if (name.toLowerCase() === 'fail' || name.toLowerCase() === 'failed') {
            setViewState('failed');
         } else {
            setViewState('success');
         }
      }, 4000);
   };

   // --- FULL PAGE VIEWS ---

   // 1. Processing View
   if (viewState === 'processing') {
      return (
         <main className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', textAlign: 'center', width: '100%' }}>
               <div style={{ width: '800px', height: '800px', marginBottom: selectedMethod === 'card' ? '-100px' : '-250px', padding: selectedMethod === 'card' ? '30px' : '0px' }}>
                  <Lottie
                     animationData={selectedMethod === 'card' ? cardSuccessAnimation : processingAnimation}
                     loop={true}
                  />
               </div>
               <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px', color: '#fff' }}>Processing Transaction</h2>
               <p style={{ color: '#94a3b8' }}>Please do not close this window...</p>
            </div>
         </main>
      );
   }

   // 2. Success View
   if (viewState === 'success') {
      return (
         <main className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', textAlign: 'center', width: '100%' }}>
               <div style={{ width: '800px', height: '800px', marginBottom: '-250px' }}>
                  <Lottie animationData={successAnimation} loop={false} />
               </div>
               <h1 style={{ fontSize: '32px', marginBottom: '12px', fontWeight: 'bold', color: '#fff' }}>Payment Accepted</h1>
               <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '40px' }}>Your {orderData.product} is on its way!</p>
               <button className="btn-primary" style={{ maxWidth: '300px' }} onClick={() => window.location.href = 'https://ayscroll.com/dashboard'}>
                  Return to Merchant
               </button>
            </div>
         </main>
      );
   }

   // 3. Failed View
   if (viewState === 'failed') {
      return (
         <main className="fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', textAlign: 'center', width: '100%' }}>
               <div style={{ width: '800px', height: '800px', marginBottom: '-250px' }}>
                  <Lottie animationData={failedAnimation} loop={false} />
               </div>

               <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '40px' }}>Something went wrong. Please try again.</p>
               <button className="btn-primary" style={{ maxWidth: '300px', background: '#333' }} onClick={() => setViewState('details')}>
                  Try Again
               </button>
            </div>
         </main>
      );
   }

   // STANDARD VIEW (Selection & Details)
   return (
      <main className="fade-in">
         <div className="checkout-container">

            {/* Left Side - Dynamic Content */}
            <div className="left-side">
               <div className="header-logo">
                  <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                     <Image src="/nfks_logo.png" alt="nFKs Pay" fill style={{ objectFit: 'contain' }} />
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>nFKs Pay</h2>
               </div>

               {viewState === 'method-selection' && (
                  <div className="fade-in">
                     <h3 style={{ fontSize: '18px', marginBottom: '20px', color: '#fff' }}>Select Payment Method</h3>
                     <div className="method-grid">
                        <div className="method-card" onClick={() => handleMethodSelect('card')}>
                           <svg className="method-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                           <span className="method-title">Credit / Debit Card</span>
                           <span className="method-desc">Pay securely with Visa, Mastercard</span>
                        </div>
                        <div className="method-card" onClick={() => handleMethodSelect('upi')}>
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
                  <form onSubmit={handlePay} className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                     <button type="button" className="btn-back" onClick={() => setViewState('method-selection')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Change Method
                     </button>

                     {/* CARD FORM */}
                     {selectedMethod === 'card' && (
                        <>
                           <div className="input-group">
                              <div className="section-label">
                                 <span>Card Number</span>
                              </div>
                              <div className="input-wrapper">
                                 <div style={{ position: 'absolute', left: '16px', display: 'flex', alignItems: 'center' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                       <circle cx="7" cy="12" r="7" fill="#EB001B" fillOpacity="0.8" />
                                       <circle cx="17" cy="12" r="7" fill="#F79E1B" fillOpacity="0.8" />
                                    </svg>
                                 </div>
                                 <input
                                    type="text"
                                    className="input-field"
                                    value={cardNumber.replace(/(.{4})/g, '$1   ').trim()}
                                    onChange={handleCardChange}
                                    placeholder="0000   0000   0000   0000"
                                    maxLength={26}
                                    style={{ paddingLeft: '50px', paddingRight: '40px', fontFamily: 'monospace' }}
                                 />
                              </div>
                           </div>

                           <div className="input-group">
                              <div className="section-label">Account Holder Name</div>
                              <div className="input-wrapper">
                                 <input
                                    type="text"
                                    className="input-field"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Name on Card"
                                 />
                              </div>
                           </div>

                           <div className="input-group">
                              <div className="section-label">CVV Number</div>
                              <div className="input-wrapper">
                                 <input
                                    type="password"
                                    className="input-field"
                                    value={cvc}
                                    onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, '').substring(0, 4))}
                                    placeholder="***"
                                    style={{ textAlign: 'center', letterSpacing: '4px', fontWeight: 'bold' }}
                                 />
                              </div>
                           </div>

                           <div className="input-group">
                              <div className="section-label">Expiry Date</div>
                              <div className="row">
                                 <div className="input-wrapper col">
                                    <input
                                       type="text"
                                       className="input-field"
                                       value={expMonth}
                                       onChange={(e) => setExpMonth(e.target.value)}
                                       style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}
                                       placeholder="MM"
                                    />
                                 </div>
                                 <div style={{ display: 'flex', alignItems: 'center', fontSize: '24px', color: '#666' }}>/</div>
                                 <div className="input-wrapper col">
                                    <input
                                       type="text"
                                       className="input-field"
                                       value={expYear}
                                       onChange={(e) => setExpYear(e.target.value)}
                                       style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px' }}
                                       placeholder="YY"
                                    />
                                 </div>
                              </div>
                           </div>
                        </>
                     )}

                     {/* UPI FORM */}
                     {selectedMethod === 'upi' && (
                        <div className="fade-in">
                           <div style={{ textAlign: 'center', marginBottom: '24px', padding: '20px', background: '#0a0a0a', borderRadius: '16px', border: '1px solid #333' }}>
                              <div style={{ width: '200px', height: '200px', background: '#fff', margin: '0 auto 16px', padding: '10px' }}>
                                 <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                    <Image src="/qr.jpeg" alt="Payment QR" fill style={{ objectFit: 'contain' }} />
                                 </div>
                              </div>
                              <span style={{ fontSize: '14px', color: '#888' }}>Scan with any UPI App</span>
                           </div>

                           {/* Pay with App Grid */}
                           <div style={{ marginBottom: '24px' }}>
                              <div className="section-label" style={{ marginBottom: '12px', color: '#888', fontSize: '14px' }}>Pay with App</div>
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

                           <div className="input-group">
                              <div className="section-label">Or Enter UPI ID</div>
                              <div className="input-wrapper">
                                 <input
                                    type="text"
                                    className="input-field"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    placeholder="username@oksbi"
                                 />
                              </div>
                           </div>
                        </div>
                     )}

                     {/* WALLET FORM */}
                     {selectedMethod === 'wallet' && (
                        <div className="fade-in" style={{ padding: '20px 0', textAlign: 'center' }}>
                           <div style={{ padding: '24px', background: '#1c1c1c', borderRadius: '16px', border: '1px solid #333', marginBottom: '24px' }}>
                              <span style={{ color: '#888', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Available Balance</span>
                              <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>₹ {walletBalance.toLocaleString()}</span>
                           </div>

                           {Number(orderData.amount) > walletBalance ? (
                              <div style={{ color: '#ff4444', padding: '12px', background: 'rgba(255, 68, 68, 0.1)', borderRadius: '8px' }}>
                                 Insufficient Balance
                              </div>
                           ) : (
                              <div style={{ color: '#4CAF50', padding: '12px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px' }}>
                                 Sufficient Balance to Pay
                              </div>
                           )}
                        </div>
                     )}

                     {/* GENERIC MESSAGE FOR NET BANKING */}
                     {selectedMethod === 'netbanking' && (
                        <div className="fade-in" style={{ padding: '40px 0', textAlign: 'center', color: '#888' }}>
                           <p>Redirecting you to secure gateway...</p>
                        </div>
                     )}

                     <button type="submit" className="btn-primary" disabled={(selectedMethod === 'wallet' && Number(orderData.amount) > walletBalance)}>
                        {`Pay ${orderData.currency} ${orderData.amount}`}
                     </button>
                  </form>
               )}
            </div>

            {/* Right Side - Ticket UI */}
            <div className="right-side">

               {/* The Ticket Container */}
               <div className="ticket" style={{ paddingTop: selectedMethod === 'wallet' ? '200px' : undefined }}>

                  {/* Floating Vertical Card - Only show on Card Method or Default */}
                  {(selectedMethod === 'card' || selectedMethod === null) && (
                     <div className="floating-card fade-in">
                        <div className="fc-top">
                           <div style={{ position: 'relative', width: '50px', height: '40px' }}>
                              <Image src="/chip.png" alt="Chip" fill style={{ objectFit: 'contain' }} />
                           </div>
                           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
                              <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
                              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                              <line x1="12" y1="20" x2="12.01" y2="20"></line>
                           </svg>
                        </div>

                        <div style={{ marginTop: 'auto', marginBottom: '24px' }}>
                           <div className="fc-name">{name || 'Jonathan Michael'}</div>
                           <div className="fc-number">••••   {cardNumber.slice(-4) || '3456'}</div>
                        </div>

                        <div className="fc-bottom">
                           <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                              {expMonth}/{expYear}
                           </div>
                           <svg width="40" height="25" viewBox="0 0 24 24" fill="none">
                              <circle cx="7" cy="12" r="7" fill="#EB001B" fillOpacity="0.9" />
                              <circle cx="17" cy="12" r="7" fill="#F79E1B" fillOpacity="0.9" />
                           </svg>
                        </div>
                     </div>
                  )}

                  {/* Generic Logo/Icon for UPI */}
                  {selectedMethod === 'upi' && (
                     <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '120px', background: '#fff', borderRadius: '50%', border: '4px solid #111', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 20 }}>
                        <div style={{ position: 'relative', width: '80%', height: '80%' }}>
                           <Image src="/upi_logo.png" alt="UPI" fill style={{ objectFit: 'contain' }} />
                        </div>
                     </div>
                  )}

                  {/* Floating Wallet Lottie */}
                  {selectedMethod === 'wallet' && (
                     <div style={{ position: 'absolute', top: '-90px', left: '50%', transform: 'translateX(-50%)', width: '250px', height: '250px', zIndex: 20 }}>
                        <Lottie animationData={walletAnimation} loop={true} />
                     </div>
                  )}

                  {/* Ticket Details */}
                  <div className="ticket-details">
                     <div className="ticket-row">
                        <span>Company</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: '600' }}>
                           <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <div style={{ width: '10px', height: '10px', background: '#000', borderRadius: '50%' }}></div>
                           </div>
                           {orderData.company}
                        </div>
                     </div>
                     <div className="ticket-row">
                        <span>Order Number</span>
                        <span className="ticket-val">{orderData.orderId}</span>
                     </div>
                     <div className="ticket-row">
                        <span>Product</span>
                        <span className="ticket-val">{orderData.product}</span>
                     </div>
                     <div className="ticket-row">
                        <span>VAT (Included)</span>
                        <span className="ticket-val">{orderData.vat}</span>
                     </div>
                  </div>

                  {/* Divider */}
                  <div className="ticket-divider"></div>

                  {/* Total */}
                  <div className="ticket-row" style={{ marginBottom: 0, alignItems: 'center' }}>
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="ticket-total-label">You have to Pay</span>
                        <span className="ticket-total-amount">
                           {Math.floor(Number(orderData.amount))}
                           <span style={{ fontSize: '20px' }}>.{orderData.amount.split('.')[1] || '00'}</span>
                           <span style={{ fontSize: '14px', fontWeight: '500', color: '#888', marginLeft: '6px' }}>{orderData.currency}</span>
                        </span>
                     </div>
                  </div>

               </div>

            </div>

         </div>
      </main>
   );
}

export default function Page() {
   return (
      <Suspense fallback={<div className="flex-center" style={{ height: '100vh', color: 'white' }}>Loading Gateway...</div>}>
         <PaymentContent />
      </Suspense>
   );
}
