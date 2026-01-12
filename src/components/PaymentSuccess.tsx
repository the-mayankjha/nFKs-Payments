import React from 'react';
import { motion } from 'framer-motion';
import { Check, Download, ArrowLeft, Mail, Calendar, CreditCard } from 'lucide-react';

interface PaymentSuccessProps {
  amount: number;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ amount }) => {
  const date = new Date().toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const invoiceId = 'INV-' + Math.floor(Math.random() * 1000000);

  return (
    <div className="w-full max-w-md text-center">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-green-500/20 text-green-500"
      >
        <Check size={48} strokeWidth={3} />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-white mb-2"
      >
        Payment Successful!
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-slate-400 mb-8"
      >
        Thank you for your purchase. A confirmation email has been sent to your inbox.
      </motion.p>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-6 mb-8 text-left"
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
          <span className="text-slate-400">Total Paid</span>
          <span className="text-2xl font-bold text-white">${amount.toFixed(2)}</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm flex items-center gap-2">
               <Calendar size={14} /> Date
            </span>
            <span className="text-white text-sm">{date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 text-sm flex items-center gap-2">
               <CreditCard size={14} /> Invoice ID
            </span>
            <span className="text-white text-sm font-mono">{invoiceId}</span>
          </div>
           <div className="flex justify-between">
            <span className="text-slate-400 text-sm flex items-center gap-2">
               <Mail size={14} /> Email
            </span>
            <span className="text-white text-sm">user@ayscroll.com</span>
          </div>
        </div>
      </motion.div>

      <motion.div 
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ delay: 0.5 }}
         className="space-y-3"
      >
        <button className="btn-primary" onClick={() => window.location.reload()}>
           <Download size={20} />
           Download Invoice
        </button>
        
        <button className="w-full py-3 bg-transparent text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
           <ArrowLeft size={18} />
           Return to AyScroll
        </button>
      </motion.div>
    </div>
  );
};
