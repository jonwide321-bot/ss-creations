
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Tag, Truck, Sparkles, ArrowRight } from 'lucide-react';
import { Promotion } from '../types';

interface PromoBannersProps {
  items: Promotion[];
}

const PromoBanners: React.FC<PromoBannersProps> = ({ items }) => {
  // Only show active banners
  const activeItems = (items || []).filter(item => item.active);
  
  // If no active promotions exist, do not render the section
  if (activeItems.length === 0) {
    return null;
  }

  const handleCTAClick = (url: string) => {
    if (!url) return;
    if (url.startsWith('#')) {
      const element = document.querySelector(url);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="py-24 bg-[#FCFBF7]">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10">
        {activeItems.map((item, idx) => (
          <motion.div 
            key={item.id || idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[3.5rem] p-12 md:p-16 group h-[22rem] md:h-[24rem] flex flex-col justify-center shadow-2xl transition-all duration-700 hover:shadow-[#D4AF37]/10"
            style={{ backgroundColor: item.bg_color, color: item.text_color }}
          >
            {/* Artistic Background Watermarks */}
            <div className="absolute top-0 right-0 p-12 opacity-5 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
              {item.title.toLowerCase().includes('delivery') || item.badge_text.toLowerCase().includes('delivery') ? (
                <Truck className="w-56 h-56" />
              ) : (
                <Sparkles className="w-56 h-56" />
              )}
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <span 
                  className="inline-block text-[11px] font-bold uppercase tracking-[0.4em] px-6 py-2.5 rounded-full backdrop-blur-md"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.08)', 
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
                  }}
                >
                  {item.badge_text}
                </span>
                <div className="h-[1px] w-12 opacity-20" style={{ backgroundColor: item.text_color }} />
              </div>

              <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 serif italic leading-[1.15] tracking-tight">
                {item.title}
              </h3>

              <p className="opacity-70 mb-10 max-w-sm text-lg md:text-xl font-light leading-relaxed">
                {item.description}
              </p>

              <button 
                onClick={() => handleCTAClick(item.link_url)}
                className="flex items-center gap-4 font-bold uppercase text-[11px] tracking-[0.5em] group/btn transition-all duration-500 hover:tracking-[0.7em]"
                style={{ color: item.text_color }}
              >
                {item.cta_text} 
                <ArrowRight className="w-5 h-5 transition-transform duration-500 group-hover/btn:translate-x-3" />
              </button>
            </div>

            {/* Subtle Gradient Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5 pointer-events-none" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PromoBanners;
