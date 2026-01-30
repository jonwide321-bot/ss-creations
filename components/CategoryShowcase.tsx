
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Home, Gift, Star, Coffee, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

const categoryDef = [
  { name: 'Flowers', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-50/50' },
  { name: 'Gourmet', icon: Coffee, color: 'text-amber-500', bg: 'bg-amber-50/50' },
  { name: 'Home Decor', icon: Home, color: 'text-blue-400', bg: 'bg-blue-50/50' },
  { name: 'Personalized', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-50/50' },
  { name: 'Gifts for Him', icon: Gift, color: 'text-slate-500', bg: 'bg-slate-50/50' },
  { name: 'Toys', icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-50/50' },
];

const CategoryShowcase: React.FC<{ onCategoryClick: (name: string) => void }> = ({ onCategoryClick }) => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        // Fetch all categories from the products table
        const { data, error } = await supabase
          .from('products')
          .select('category');

        if (error) throw error;

        // Count occurrences of each category
        const countsMap = (data || []).reduce((acc: Record<string, number>, item: any) => {
          const cat = item.category;
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {});

        setCounts(countsMap);
      } catch (err) {
        console.error("Error fetching category counts:", err);
      }
    };

    fetchCategoryCounts();
  }, []);

  return (
    <section className="py-24 bg-[#FCFBF7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-3 text-[#D4AF37] mb-6">
            <div className="h-[1px] w-12 bg-[#D4AF37]/30" />
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold">Discover</span>
            <div className="h-[1px] w-12 bg-[#D4AF37]/30" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 serif italic">The Collections</h2>
          <p className="text-[#705E52] max-w-xl mx-auto text-lg font-light leading-relaxed">Each category is a world of its own, waiting for you to find the perfect expression of your feelings.</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {categoryDef.map((cat, idx) => {
            const productCount = counts[cat.name] || 0;
            return (
              <motion.button
                key={cat.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                onClick={() => {
                  onCategoryClick(cat.name);
                  document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group flex flex-col items-center p-8 rounded-[2.5rem] bg-white border border-stone-100 hover:border-[#D4AF37]/30 hover:shadow-2xl hover:shadow-[#D4AF37]/5 transition-all duration-500"
              >
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: idx * 0.3 }}
                  className={`w-20 h-20 ${cat.bg} rounded-full flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 shadow-inner`}
                >
                  <cat.icon className={`w-8 h-8 ${cat.color} group-hover:scale-110 transition-transform`} />
                </motion.div>
                <h3 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-widest">{cat.name}</h3>
                <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">
                  {productCount} {productCount === 1 ? 'Artifact' : 'Artifacts'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
