
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
    <div className="fixed bottom-10 right-10 z-[100] group">
      {/* Luxury Tooltip */}
      <div className="absolute bottom-full mb-6 right-0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none translate-y-4 group-hover:translate-y-0">
        <div className="bg-white/80 backdrop-blur-xl border border-[#D4AF37]/20 text-slate-800 text-[10px] font-bold px-6 py-4 rounded-[2rem] shadow-2xl whitespace-nowrap flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="uppercase tracking-[0.3em]">Direct Concierge</span>
          </div>
          <span className="text-[#D4AF37] font-medium tracking-normal normal-case italic text-xs">How may we assist you today?</span>
          <div className="absolute top-full right-8 w-4 h-4 bg-white/80 backdrop-blur-xl border-r border-b border-[#D4AF37]/20 rotate-45 -translate-y-2" />
        </div>
      </div>

      <button
        onClick={handleChat}
        className="w-20 h-20 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all duration-500 relative group overflow-hidden border-4 border-white"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-10 h-10 fill-white/20 relative z-10" />
        <span className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
        <span className="absolute inset-0 rounded-full bg-[#D4AF37] animate-ping opacity-30 group-hover:hidden" />
      </button>
    </div>
  );
};

export default WhatsAppButton;
