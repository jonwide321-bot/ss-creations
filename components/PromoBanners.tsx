
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Tag, Truck, Sparkles } from 'lucide-react';

const PromoBanners: React.FC = () => {
  return (
    <section className="py-24 bg-[#FCFBF7]">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3rem] bg-[#1C1917] p-10 md:p-14 text-white group h-80 flex flex-col justify-center border border-white/5"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-48 h-48 text-[#D4AF37]" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block bg-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full">Limited Edition</span>
              <div className="h-[1px] w-8 bg-white/20" />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-4 serif italic">Exclusive 20% OFF</h3>
            <p className="text-stone-400 mb-8 max-w-sm text-lg font-light leading-relaxed">Indulge in our home collection. A temporary gift from us to you.</p>
            <button className="flex items-center gap-3 font-bold text-[#D4AF37] hover:text-white transition-all uppercase text-[10px] tracking-[0.4em] group/btn">
              Explore Now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3rem] bg-[#D4AF37] p-10 md:p-14 text-white group h-80 flex flex-col justify-center shadow-2xl shadow-[#D4AF37]/20"
        >
          <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
            <Truck className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block bg-white/20 text-[10px] font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full backdrop-blur-md">Complimentary</span>
              <div className="h-[1px] w-8 bg-white/40" />
            </div>
            <h3 className="text-4xl md:text-5xl font-bold mb-4 serif italic">Free Islandwide Delivery</h3>
            <p className="text-stone-100 mb-8 max-w-sm text-lg font-light leading-relaxed">No matter where you are, we bring the magic to your doorstep today.</p>
            <button className="flex items-center gap-3 font-bold text-white hover:text-stone-800 transition-all uppercase text-[10px] tracking-[0.4em] group/btn">
              Claim Your Perk <Clock className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const ArrowRight: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);

export default PromoBanners;
