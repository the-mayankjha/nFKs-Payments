import React from 'react';
import { motion } from 'framer-motion';

interface CardPreviewProps {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvc: string;
  focused: 'number' | 'name' | 'expiry' | 'cvc' | null;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ cardNumber, cardHolder, expiry, cvc, focused }) => {
  return (
    <div className="relative w-80 h-48 mx-auto mb-8 perspective-1000">
      <motion.div
        className="w-full h-full relative preserve-3d transition-transform duration-500"
        animate={{ rotateY: focused === 'cvc' ? 180 : 0 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div className="absolute w-full h-full rounded-2xl p-6 text-white shadow-2xl overflow-hidden backface-hidden"
             style={{
               background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
               backfaceVisibility: 'hidden'
             }}>
          
          {/* Chip */}
          <div className="w-12 h-9 border border-yellow-400/50 rounded-md mb-8 relative overflow-hidden bg-yellow-400/20">
             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-yellow-400/40"></div>
             <div className="absolute top-0 left-1/2 w-[1px] h-full bg-yellow-400/40"></div>
          </div>

          {/* Number */}
          <div className="mb-6">
            <div className="text-xs uppercase opacity-75 mb-1">Card Number</div>
            <div className="font-mono text-xl tracking-wider h-8">
              {cardNumber || '#### #### #### ####'}
            </div>
          </div>

          {/* Bottom Details */}
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs uppercase opacity-75 mb-1">Card Holder</div>
              <div className="font-medium tracking-wide uppercase truncate w-40">
                {cardHolder || 'FULL NAME'}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase opacity-75 mb-1">Expires</div>
              <div className="font-mono font-medium">
                {expiry || 'MM/YY'}
              </div>
            </div>
          </div>
          
          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-white/10 pointer-events-none"></div>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full rounded-2xl bg-slate-800 text-white shadow-2xl overflow-hidden"
             style={{
               transform: 'rotateY(180deg)',
               backfaceVisibility: 'hidden',
               background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
             }}>
          <div className="w-full h-10 bg-black/50 mt-6 mb-6"></div>
          <div className="px-6">
            <div className="text-right text-xs uppercase opacity-75 mb-1">CVC</div>
            <div className="bg-white text-black font-mono text-right px-2 py-1 rounded w-full h-8 flex items-center justify-end">
              {cvc || '123'}
            </div>
          </div>
          <div className="absolute bottom-6 right-6 opacity-50">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
               <rect x="2" y="5" width="20" height="14" rx="2" />
               <line x1="2" y1="10" x2="22" y2="10" />
             </svg>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
