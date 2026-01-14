'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import NotificationBar from '../components/NotificationBar';
import CustomDropdown from '../components/CustomDropdown';
// Assets
import walletAnimation from '../assets/lottie/wallet.json';
import cardSuccessAnimation from '../assets/lottie/cardsuccess.json';
import processingAnimation from '../assets/lottie/proccessing.json';
import successAnimation from '../assets/lottie/success.json';
import failedAnimation from '../assets/lottie/failed.json';
import qrAnimation from '../assets/lottie/qr.json';
import bankAnimation from '../assets/lottie/bank.json';

// Dynamic import for lottie-react to avoid SSR issues
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

type ViewState = 'method-selection' | 'details' | 'processing' | 'success' | 'failed';

function PaymentContent() {
   const searchParams = useSearchParams();

   // App State
   const [viewState, setViewState] = useState<ViewState>('method-selection');
   const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
   const [notification, setNotification] = useState<{ show: boolean; title: string; message: string; type?: 'success' | 'error' }>({ show: false, title: '', message: '', type: 'error' });

   // Data from Microservice Params
   const [orderData, setOrderData] = useState({
      amount: '549.99',
      currency: 'USD',
      orderId: '1266201',
      product: 'MackBook Air',
      company: 'Apple',
      vat: '100.00'
   });

   // Form State
   const [cardNumber, setCardNumber] = useState('');
   const [expMonth, setExpMonth] = useState('09');
   const [expYear, setExpYear] = useState('26');
   const [cvc, setCvc] = useState('');
   const [name, setName] = useState('John Doe');
   const [upiId, setUpiId] = useState('');
   const [referenceId, setReferenceId] = useState('');
   const [selectedCountry, setSelectedCountry] = useState('India');
   const [selectedBank, setSelectedBank] = useState('');
   const [upiMode, setUpiMode] = useState<'apps' | 'id'>('apps');

   const walletBalance = referenceId.toLowerCase() === 'iluvmayank' ? 10000 : 0;

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

   // Show notification when success or failed page loads
   useEffect(() => {
      if (viewState === 'success') {
         setNotification({ show: true, title: 'Payment Successful', message: 'Your payment has been processed successfully.', type: 'success' });
         setTimeout(() => setNotification({ show: false, title: '', message: '', type: 'error' }), 5000);
      } else if (viewState === 'failed') {
         setNotification({ show: true, title: 'Payment Failed', message: 'Something went wrong with your payment. Please try again.', type: 'error' });
         setTimeout(() => setNotification({ show: false, title: '', message: '', type: 'error' }), 5000);
      }
   }, [viewState]);


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

      // Check for insufficient wallet balance
      if (selectedMethod === 'wallet' && Number(orderData.amount) > walletBalance) {
         setNotification({ show: true, title: 'Insufficient Balance', message: 'You do not have enough balance in your nFKs wallet to complete this transaction.', type: 'error' });
         setTimeout(() => setNotification({ show: false, title: '', message: '', type: 'error' }), 4000);
         return;
      }

      // Check for net banking - bank server connection error
      if (selectedMethod === 'netbanking') {
         const bankOptions = [
            { value: 'HDFC', label: 'HDFC Bank' },
            { value: 'ICICI', label: 'ICICI Bank' },
            { value: 'SBI', label: 'State Bank of India' },
            { value: 'AXIS', label: 'Axis Bank' },
            { value: 'KOTAK', label: 'Kotak Mahindra Bank' },
            { value: 'PNB', label: 'Punjab National Bank' },
            { value: 'BOB', label: 'Bank of Baroda' },
            { value: 'YES', label: 'Yes Bank' },
            { value: 'UNION', label: 'Union Bank of India' },
            { value: 'BOA', label: 'Bank of America' },
            { value: 'DEUTSCHE', label: 'Deutsche Bank' },
            { value: 'STANDARD', label: 'Standard Bank' },
         ];

         const selectedBankOption = bankOptions.find(bank => bank.value === selectedBank);
         const bankName = selectedBankOption ? selectedBankOption.label : 'Bank';

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
         <>
            <NotificationBar
               show={notification.show}
               title={notification.title}
               message={notification.message}
               type={notification.type}
               onClose={() => setNotification({ show: false, title: '', message: '', type: 'error' })}
            />
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
         </>
      );
   }

   // 3. Failed View
   if (viewState === 'failed') {
      return (
         <>
            <NotificationBar
               show={notification.show}
               title={notification.title}
               message={notification.message}
               type={notification.type}
               onClose={() => setNotification({ show: false, title: '', message: '', type: 'error' })}
            />
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
         </>
      );
   }

   // STANDARD VIEW (Selection & Details)
   return (
      <>
         {/* Notification Toast */}
         <NotificationBar
            show={notification.show}
            title={notification.title}
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ show: false, title: '', message: '', type: 'error' })}
         />
         <main className="fade-in">
            <div className="checkout-container">

               {/* Left Side - Dynamic Content */}
               <div className="left-side" style={{ position: 'relative' }}>
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
                     <form onSubmit={handlePay} className="fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
                        <button type="button" className="btn-back" onClick={() => setViewState('method-selection')}>
                           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                           Change Method
                        </button>

                        {/* CARD FORM */}
                        {selectedMethod === 'card' && (
                           <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                           </div>
                        )}

                        {/* UPI FORM */}
                        {selectedMethod === 'upi' && (
                           <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                                       <input
                                          type="text"
                                          className="input-field"
                                          value={upiId}
                                          onChange={(e) => setUpiId(e.target.value)}
                                          placeholder="username@oksbi"
                                       />
                                    </div>
                                 </div>
                              )}
                           </div>
                        )}

                        {/* WALLET FORM */}
                        {selectedMethod === 'wallet' && (
                           <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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



                              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px' }}>
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

                        {/* NET BANKING FORM */}
                        {selectedMethod === 'netbanking' && (
                           <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                              {/* Country Selection */}
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

                              {/* Bank Selection */}
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

                              {/* Instructions */}
                              {selectedBank && (
                                 <div style={{ padding: '16px', background: '#0a0a0a', borderRadius: '12px', border: '1px solid #333', marginTop: '16px', marginBottom: '20px' }}>
                                    <div style={{ color: '#888', fontSize: '13px', lineHeight: '1.6' }}>
                                       <strong style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>To complete your payment:</strong>
                                       You will be redirected to {selectedBank} secure payment page to complete the transaction.
                                    </div>
                                 </div>
                              )}
                           </div>
                        )}

                        <button type="submit" className="btn-primary" style={{ marginBottom: '24px' }}>
                           Proceed
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

                  {/* The Ticket Container */}
                  <div className="ticket">

                     {/* Floating Vertical Card - Only show on Card Method or Default */}
                     {(selectedMethod === 'card' || selectedMethod === null) && (
                        <div className="floating-lottie-container fade-in">
                           <div className="floating-card">
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

                              <div style={{ marginTop: 'auto', marginBottom: '24px', paddingBottom: '20px' }}>
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

                  <div style={{ position: 'absolute', bottom: '24px', right: '40px', fontSize: '11px', color: '#666', fontFamily: 'var(--font-geist-mono)', opacity: 0.8 }}>
                     Developed by Mayank Kumar Jha
                  </div>
               </div>

            </div>
         </main>
         <div className="footer-copyright">
            <div>© 2025-26 nFKs. All Rights Reserved</div>
         </div>
      </>
   );
}

export default function Page() {
   return (
      <Suspense fallback={<div className="flex-center" style={{ height: '100vh', color: 'white' }}>Loading Gateway...</div>}>
         <PaymentContent />
      </Suspense>
   );
}
