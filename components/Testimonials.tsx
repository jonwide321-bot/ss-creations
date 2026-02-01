import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Heart } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  return (
    <section className="py-32 bg-[#FAF9F6] overflow-hidden relative">
      {/* Decorative Signature Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#D4AF37]/5 font-bold cinzel text-[30rem] select-none pointer-events-none rotate-12" aria-hidden="true">
        LOVE
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="flex items-center justify-center gap-3 text-rose-400 mb-6">
            <Heart className="w-5 h-5 fill-rose-400" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold">Kind Words</span>
            <Heart className="w-5 h-5 fill-rose-400" aria-hidden="true" />
          </div>
          <h2 className="text-5xl md:text-7xl font-bold text-slate-800 mb-8 serif">Voice of the Heart</h2>
          <p className="text-[#705E52] max-w-2xl mx-auto text-xl font-light italic leading-relaxed">"Gifting is an art of the soul, and we are honored to be your medium."</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {testimonials.map((t, idx) => (
            <motion.div 
              key={t.id} 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white p-12 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-700 relative group border border-stone-50"
            >
              <div className="absolute top-10 right-10 text-[#D4AF37]/10 group-hover:text-[#D4AF37]/20 transition-all duration-500 transform group-hover:-rotate-12" aria-hidden="true">
                <Quote className="w-16 h-16" />
              </div>
              <div className="flex gap-1.5 mb-10" aria-label={`${t.rating} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < t.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-stone-100'}`} 
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-slate-700 mb-10 italic leading-[1.8] text-lg font-light">"{t.content}"</p>
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#D4AF37] rounded-full scale-110 blur-sm opacity-0 group-hover:opacity-20 transition-opacity" aria-hidden="true" />
                  <img 
                    src={`${t.avatar}&fm=webp`} 
                    alt={`${t.name} profile`} 
                    loading="lazy"
                    decoding="async"
                    width="56"
                    height="56"
                    className="w-14 h-14 rounded-full object-cover relative z-10 border-2 border-[#FCFBF7]" 
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base uppercase tracking-widest">{t.name}</h3>
                  <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-[0.2em]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;