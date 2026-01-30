
import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewProduct, isWishlisted, onToggleWishlist }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => onViewProduct(product)}
      className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-stone-100 flex flex-col h-full cursor-pointer relative hover:-translate-y-2"
    >
      <div className="relative overflow-hidden aspect-[4/5]">
        <img 
          src={`${product.image}&w=800&q=80`} 
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4">
           <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(product);
            }}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-800 shadow-xl scale-0 group-hover:scale-100 transition-transform duration-500 delay-75 hover:bg-[#D4AF37] hover:text-white"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute top-5 right-5 flex flex-col gap-3 translate-x-16 group-hover:translate-x-0 transition-transform duration-500">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
            className={`p-3 rounded-full shadow-lg backdrop-blur-md transition-all ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-400 hover:text-rose-500'}`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
          </button>
        </div>

        <div className="absolute top-5 left-5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-stone-100">
          <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">{product.rating}</span>
        </div>
        
        {product.originalPrice && (
          <div className="absolute bottom-5 left-5 bg-[#D4AF37] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg tracking-widest">
            OFFER
          </div>
        )}
      </div>
      
      <div className="p-8 flex flex-col flex-grow bg-white">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold">{product.category}</span>
          <div className="h-[1px] flex-grow bg-[#D4AF37]/10" />
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-[#D4AF37] transition-colors line-clamp-1 serif">
          {product.name}
        </h3>
        
        <p className="text-sm text-[#705E52] line-clamp-2 mb-6 flex-grow font-light leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-[#FCFBF7]">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900 tracking-tight">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through font-medium">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="bg-[#1C1917] text-white p-4 rounded-full hover:bg-[#D4AF37] transition-all shadow-xl hover:shadow-[#D4AF37]/30 active:scale-90"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
