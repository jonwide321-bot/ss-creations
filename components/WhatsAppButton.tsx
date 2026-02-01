import React from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton: React.FC = () => {
  const phoneNumber = "9470596039"; 
  const message = "Hello SS Creations! I'm interested in finding a perfect gift. Can you help me?";
  
  const handleChat = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-24 right-6 md:bottom-28 md:right-10 z-[100] group">
      {/* Luxury Tooltip */}
      <div className="absolute bottom-full mb-6 right-0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none translate-y-4 group-hover:translate-y-0 hidden sm:block">
        <div className="bg-white/80 dark:bg-[#1C1917]/90 backdrop-blur-xl border border-gold/20 text-slate-800 dark:text-stone-200 text-[10px] font-bold px-6 py-4 rounded-[2rem] shadow-2xl whitespace-nowrap flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="uppercase tracking-[0.3em]">Direct Concierge</span>
          </div>
          <span className="text-gold font-medium tracking-normal normal-case italic text-xs">How may we assist you today?</span>
          <div className="absolute top-full right-8 w-4 h-4 bg-white/80 dark:bg-[#1C1917]/90 backdrop-blur-xl border-r border-b border-gold/20 rotate-45 -translate-y-2" />
        </div>
      </div>

      <button
        onClick={handleChat}
        aria-label="Contact Studio via WhatsApp Messenger"
        className="w-16 h-16 md:w-20 md:h-20 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all duration-500 relative group overflow-hidden border-4 border-white dark:border-[#1C1917] min-h-[64px] min-w-[64px]"
      >
        <MessageCircle className="w-8 h-8 md:w-10 md:h-10 fill-white/20 relative z-10" aria-hidden="true" />
        <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
        <span className="absolute inset-0 rounded-full bg-gold animate-ping opacity-30 group-hover:hidden" />
      </button>
    </div>
  );
};

export default WhatsAppButton;