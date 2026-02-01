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
      className="group bg-white dark:bg-[#1C1917] rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 border border-stone-100 dark:border-white/5 flex flex-col h-full cursor-pointer relative hover:-translate-y-2"
    >
      <div className="relative overflow-hidden aspect-[4/5]">
        <img 
          src={`${product.image}&w=800&q=75&fm=webp`} 
          alt={`A curated view of ${product.name}`}
          loading="lazy"
          decoding="async"
          width="400"
          height="500"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Quick actions overlay */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4">
           <button 
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(product);
            }}
            className="w-14 h-14 bg-white dark:bg-gold rounded-full flex items-center justify-center text-slate-800 shadow-xl scale-0 group-hover:scale-100 transition-transform duration-500 delay-75 hover:bg-gold dark:hover:bg-white hover:text-white"
            aria-label={`View detailed information about ${product.name}`}
          >
            <Eye className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        <div className="absolute top-5 right-5 flex flex-col gap-3 translate-x-16 group-hover:translate-x-0 transition-transform duration-500">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist();
            }}
            className={`p-4 rounded-full shadow-lg backdrop-blur-md transition-all min-h-[44px] min-w-[44px] ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/80 dark:bg-black/50 text-slate-400 hover:text-rose-500'}`}
            aria-label={isWishlisted ? `Remove ${product.name} from your wishlist` : `Add ${product.name} to your wishlist`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} aria-hidden="true" />
          </button>
        </div>

        <div className="absolute top-5 left-5 bg-white/80 dark:bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-stone-100 dark:border-white/10" aria-label={`Customer Rating: ${product.rating} stars`}>
          <Star className="w-3 h-3 fill-gold text-gold" aria-hidden="true" />
          <span className="text-[10px] font-bold text-slate-700 dark:text-stone-300 uppercase tracking-tighter">{product.rating}</span>
        </div>
        
        {product.originalPrice && (
          <div className="absolute bottom-5 left-5 bg-gold text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg tracking-widest">
            OFFER
          </div>
        )}
      </div>
      
      <div className="p-8 flex flex-col flex-grow bg-white dark:bg-[#1C1917]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] uppercase tracking-[0.3em] text-gold font-bold">{product.category}</span>
          <div className="h-[1px] flex-grow bg-gold/10" aria-hidden="true" />
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 dark:text-stone-100 mb-3 group-hover:text-gold transition-colors line-clamp-1 serif">
          {product.name}
        </h3>
        
        <p className="text-sm text-[#705E52] dark:text-stone-400 line-clamp-2 mb-6 flex-grow font-light leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-[#FCFBF7] dark:border-white/5">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900 dark:text-gold tracking-tight">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 dark:text-stone-600 line-through font-medium">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="bg-[#1C1917] dark:bg-gold text-white dark:text-slate-900 p-4 rounded-full hover:bg-gold dark:hover:bg-white transition-all shadow-xl hover:shadow-gold/30 active:scale-90 min-h-[48px] min-w-[48px]"
            aria-label={`Add one ${product.name} to your shopping basket`}
          >
            <ShoppingCart className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;