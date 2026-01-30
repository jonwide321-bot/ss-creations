
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShoppingBag, ArrowRight, MessageCircle, Heart, Star, Sparkles, Copy, Check } from 'lucide-react';
import { OrderDetails } from '../types';
import { formatPrice } from '../lib/utils';

interface OrderSuccessProps {
  order: OrderDetails;
  onContinue: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ order, onContinue }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppConfirm = () => {
    const itemsList = order.items.map(i => `• ${i.name} x ${i.quantity}`).join('\n');
    
    const message = `🛍️ *NEW ORDER FROM SS CREATIONS* 🛍️
*Order ID:* ${order.id}
----------------------------
👤 *Customer:* ${order.shippingAddress.name}
📍 *Address:* ${order.shippingAddress.address}, ${order.shippingAddress.city}
📞 *Phone:* ${order.shippingAddress.phone}
📦 *Items:* 
${itemsList}
💰 *Total Amount:* ${formatPrice(order.total)}
💳 *Payment:* ${order.paymentMethod}
----------------------------
Please confirm my order! Thank you. ✨`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/9470596039?text=${encodedMessage}`, '_blank');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-24 pb-32 min-h-screen flex items-center justify-center bg-[#FCFBF7] relative overflow-hidden">
      {/* Celebration Orbs */}
      <AnimatePresence>
        {showConfetti && [...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              opacity: 0, 
              scale: 0, 
              x: '50vw', 
              y: '50vh' 
            }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0.5, 1.5, 0.5],
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
            }}
            transition={{ 
              duration: 3 + Math.random() * 2, 
              repeat: Infinity,
              ease: "easeOut" 
            }}
            className="fixed pointer-events-none z-0"
          >
            <Sparkles className={`w-8 h-8 ${i % 2 === 0 ? 'text-[#D4AF37]' : 'text-rose-200'} opacity-20`} />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="max-w-3xl w-full mx-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white p-10 md:p-16 rounded-[3.5rem] shadow-2xl text-center border border-stone-100 relative overflow-hidden"
        >
          {/* Subtle signature pattern background */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none select-none flex items-center justify-center">
            <span className="text-[15rem] font-bold cinzel rotate-12">SS</span>
          </div>

          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner"
          >
            <CheckCircle className="w-12 h-12" />
          </motion.div>
          
          <h1 className="text-5xl font-bold text-slate-900 mb-6 serif italic">Order Confirmed</h1>
          <p className="text-[#705E52] mb-12 max-w-md mx-auto leading-relaxed text-lg font-light">
            Your selection has been curated with care, <span className="font-bold text-slate-800">{order.shippingAddress.name}</span>. 
            We are preparing your treasures for their journey.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mb-12">
            <div className="bg-[#FAF9F6] p-8 rounded-[2.5rem] border border-stone-50 shadow-sm relative group">
              <div className="flex justify-between items-center mb-6">
                 <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">Reference</span>
                 <button onClick={handleCopyId} className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-300 hover:text-[#D4AF37]">
                   {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                 </button>
              </div>
              <p className="text-xl font-mono font-bold text-slate-800 mb-2">{order.id}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{order.date} • {order.items.length} Artifacts</p>
            </div>

            <div className="bg-[#1C1917] p-8 rounded-[2.5rem] shadow-xl text-white">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-6 block">Total Amount Paid</span>
              <p className="text-3xl font-bold mb-2 serif italic text-[#D4AF37]">{formatPrice(order.total)}</p>
              <div className="flex items-center gap-2 text-[10px] text-stone-500 uppercase tracking-widest">
                <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" /> Verified Via {order.paymentMethod}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
            <button 
              onClick={handleWhatsAppConfirm}
              className="flex-1 py-5 bg-[#25D366] text-white rounded-[2rem] font-bold hover:bg-[#1EBE57] transition-all shadow-xl shadow-[#25D366]/20 flex items-center justify-center gap-3 group active:scale-95"
            >
              <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="uppercase tracking-[0.2em] text-[11px]">Confirm via WhatsApp</span>
            </button>
            <button 
              onClick={onContinue}
              className="flex-1 py-5 bg-[#1C1917] text-white rounded-[2rem] font-bold hover:bg-[#D4AF37] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="uppercase tracking-[0.2em] text-[11px]">Return to Boutique</span>
            </button>
          </div>

          <div className="mt-12 pt-10 border-t border-stone-50 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-rose-400">
              <Heart className="w-4 h-4 fill-rose-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Artisan Promise</span>
            </div>
            <p className="text-xs text-slate-400 font-light italic">Need assistance? Connect with our studio: +94 70 596 039</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
