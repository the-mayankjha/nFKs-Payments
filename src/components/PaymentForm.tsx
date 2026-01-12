import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Lock, User, ShieldCheck } from 'lucide-react';
import { CardPreview } from './CardPreview';

interface PaymentFormProps {
  onSuccess: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [focused, setFocused] = useState<'number' | 'name' | 'expiry' | 'cvc' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess();
    }, 2500); // 2.5s delay for realism
  };

  return (
    <div className="w-full max-w-md">
      <CardPreview 
        cardNumber={cardNumber} 
        cardHolder={cardHolder} 
        expiry={expiry} 
        cvc={cvc} 
        focused={focused} 
      />
      
      <form onSubmit={handleSubmit} className="glass-panel p-8 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white">Payment Details</h2>
          <div className="flex space-x-2">
             <div className="w-8 h-5 bg-white/10 rounded"></div>
             <div className="w-8 h-5 bg-white/10 rounded"></div>
             <div className="w-8 h-5 bg-white/10 rounded"></div>
          </div>
        </div>

        <div>
          <label className="label">
            Card Number
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              onFocus={() => setFocused('number')}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">
            Card Holder
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              className="input-field pl-10"
              placeholder="Full Name"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              onFocus={() => setFocused('name')}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              Expiry Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="MM/YY"
                maxLength={5}
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                onFocus={() => setFocused('expiry')}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">
              CVC
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                className="input-field pl-10"
                placeholder="123"
                maxLength={3}
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                onFocus={() => setFocused('cvc')}
                required
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-primary mt-6"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="spinner"></div>
              <span>Processing Securely...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={20} />
              <span>Pay Now</span>
            </>
          )}
        </button>
        
        <div className="text-center mt-4">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
            <Lock size={12} />
            Encrypted and Secure Payment
          </p>
        </div>
      </form>
    </div>
  );
};
