
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShoppingBag, MessageCircle, Heart, Star, Sparkles, Copy, Check, Loader2, ArrowRight } from 'lucide-react';
import { OrderDetails } from '../types';
import { formatPrice } from '../lib/utils';

interface OrderSuccessProps {
  order: OrderDetails;
  onContinue: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ order, onContinue }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);
  const [redirecting, setRedirecting] = useState(true);
  const [countdown, setCountdown] = useState(5);

  const getWhatsAppURL = () => {
    const itemsList = (order.items || []).map(i => `• ${i.name} (x${i.quantity})`).join('\n');
    const phoneNumber = "94705966039";
    
    const message = `🛍️ *NEW ORDER CONFIRMATION - SS CREATIONS* 🛍️
----------------------------
🆔 *Order ID:* ${order.id}
👤 *Customer:* ${order.shippingAddress.name}
📞 *Phone:* ${order.shippingAddress.phone}
📍 *Address:* ${order.shippingAddress.address}, ${order.shippingAddress.city}
💳 *Payment:* ${order.paymentMethod}

📦 *Items Ordered:* 
${itemsList}

💰 *Total Value:* ${formatPrice(order.total)}
----------------------------
✨ *Creative Note:* 
"Every gift tells a story, and I'm so excited for this one to begin! Thank you SS Creations for crafting these treasures with so much love. Please confirm my order at your earliest convenience." ✨`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Countdown for visual feedback
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto redirect to WhatsApp after 5 seconds
    const redirectTimer = setTimeout(() => {
      window.open(getWhatsAppURL(), '_blank');
      setRedirecting(false);
    }, 5000);

    const confettiTimer = setTimeout(() => setShowConfetti(false), 8000);
    
    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
      clearTimeout(confettiTimer);
    };
  }, [order.id]);

  const handleManualWhatsApp = () => {
    window.open(getWhatsAppURL(), '_blank');
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
        {showConfetti && [...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, x: '50vw', y: '50vh' }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0.5, 1.2, 0.5],
              x: `${Math.random() * 100}vw`,
              y: `${Math.random() * 100}vh`,
            }}
            transition={{ duration: 3 + Math.random() * 3, repeat: Infinity, ease: "easeOut" }}
            className="fixed pointer-events-none z-0"
          >
            <Sparkles className={`w-8 h-8 ${i % 3 === 0 ? 'text-[#D4AF37]' : i % 3 === 1 ? 'text-rose-300' : 'text-emerald-200'} opacity-20`} />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="max-w-3xl w-full mx-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white p-8 md:p-16 rounded-[3.5rem] shadow-2xl text-center border border-stone-100 relative overflow-hidden"
        >
          {/* Subtle signature pattern background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none flex items-center justify-center">
            <span className="text-[18rem] font-bold cinzel rotate-12">SS</span>
          </div>

          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
          >
            <CheckCircle className="w-10 h-10" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 serif italic">Creation Confirmed</h1>
          <p className="text-[#705E52] mb-10 max-w-md mx-auto leading-relaxed text-base font-light">
            Your selection has been curated with care, <span className="font-bold text-slate-800">{order.shippingAddress.name}</span>. 
            We are weaving your gifts together.
          </p>

          {/* WhatsApp Auto-Redirect Banner */}
          <AnimatePresence>
            {redirecting && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-10 overflow-hidden"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-[10px]">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Connecting to Studio Concierge
                  </div>
                  <p className="text-xs text-emerald-700">Redirecting to WhatsApp in <span className="font-bold text-lg">{countdown}</span> seconds...</p>
                  <button 
                    onClick={handleManualWhatsApp}
                    className="text-[10px] text-emerald-600 underline font-bold uppercase tracking-widest mt-1 hover:text-emerald-800"
                  >
                    Click here to open immediately
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-10">
            <div className="bg-[#FAF9F6] p-6 rounded-[2rem] border border-stone-50 shadow-sm relative">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">Reference ID</span>
                 <button onClick={handleCopyId} className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-300 hover:text-[#D4AF37]">
                   {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                 </button>
              </div>
              <p className="text-lg font-mono font-bold text-slate-800 mb-1">{order.id}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest">{order.date} • {order.items?.length || 0} Artifacts</p>
            </div>

            <div className="bg-[#1C1917] p-6 rounded-[2rem] shadow-xl text-white">
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-4 block">Total Investment</span>
              <p className="text-2xl font-bold mb-1 serif italic text-[#D4AF37]">{formatPrice(order.total)}</p>
              <div className="flex items-center gap-2 text-[9px] text-stone-500 uppercase tracking-widest">
                <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" /> Verified Via {order.paymentMethod}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={handleManualWhatsApp}
              className="flex-2 py-4 bg-[#25D366] text-white rounded-[1.5rem] font-bold hover:bg-[#1EBE57] transition-all shadow-xl shadow-[#25D366]/20 flex items-center justify-center gap-3 group active:scale-95 px-8"
            >
              <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="uppercase tracking-[0.2em] text-[10px]">Confirm on WhatsApp</span>
            </button>
            <button 
              onClick={onContinue}
              className="flex-1 py-4 bg-[#1C1917] text-white rounded-[1.5rem] font-bold hover:bg-[#D4AF37] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group px-8"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="uppercase tracking-[0.2em] text-[10px]">Return to shop</span>
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-stone-50 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-rose-400">
              <Heart className="w-3 h-3 fill-rose-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em]">SS Creations Artisan Promise</span>
            </div>
            <p className="text-[10px] text-slate-400 font-light italic">Studio Inquiries: +94 70 596 6039</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
