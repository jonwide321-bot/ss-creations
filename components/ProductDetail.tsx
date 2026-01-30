
import React, { useState, useEffect } from 'react';
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Facebook, MessageCircle, CheckCircle, Package, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { Product } from '../types';
import GreetingGenerator from './GreetingGenerator';
import { formatPrice } from '../lib/utils';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart, onBuyNow, isWishlisted, onToggleWishlist }) => {
  const [activeImg, setActiveImg] = useState(product.image);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [showGreetingGenerator, setShowGreetingGenerator] = useState(false);

  useEffect(() => {
    setActiveImg(product.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product.id]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({ display: 'block', backgroundPosition: `${x}% ${y}%` });
  };

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=Check out this amazing gift: ${encodeURIComponent(product.name)} at ${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const gallery = Array.isArray(product.gallery) && product.gallery.length > 0 
    ? product.gallery 
    : [product.image];

  return (
    <div className="pt-20 pb-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors mb-6 group py-2"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Back to Catalog</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div 
              className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-100 bg-stone-50 cursor-crosshair group"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setZoomStyle({ ...zoomStyle, display: 'none' })}
            >
              <img 
                src={`${activeImg}${activeImg.includes('?') ? '&' : '?'}w=1200&q=85`} 
                alt={product.name} 
                className="w-full h-full object-cover"
                decoding="async"
              />
              
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-200 hidden lg:block"
                style={{
                  ...zoomStyle,
                  backgroundImage: `url(${activeImg}${activeImg.includes('?') ? '&' : '?'}w=2000&q=90)`,
                  backgroundSize: '200%',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-slate-800">{product.rating}</span>
              </div>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist();
                }}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-rose-500'}`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-white' : ''}`} />
              </button>
            </div>

            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {gallery.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImg(img)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 snap-start ${activeImg === img ? 'border-rose-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={`${img}${img.includes('?') ? '&' : '?'}w=200&q=60`} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
                {product.category}
              </span>
              <button 
                onClick={() => setShowGreetingGenerator(true)}
                className="flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-rose-500 transition-colors bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100 shadow-sm"
              >
                <Sparkles className="w-3 h-3" />
                Write a Greeting card
              </button>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 serif leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-lg sm:text-xl text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-slate-600 leading-relaxed text-base sm:text-lg italic">
                {product.description}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                {(product.highlights || ['Premium Quality', 'Hand Crafted']).map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {product.options && (
              <div className="space-y-6 mb-8">
                {product.options.map((opt) => (
                  <div key={opt.name}>
                    <label className="block text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">
                      {opt.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {opt.values.map(val => (
                        <button
                          key={val}
                          onClick={() => handleOptionChange(opt.name, val)}
                          className={`px-3 py-2 sm:px-4 rounded-lg border text-xs sm:text-sm font-medium transition-all ${selectedOptions[opt.name] === val ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' : 'bg-white text-slate-600 border-stone-200'}`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mb-8">
              <Package className="w-4 h-4 text-slate-400" />
              <span className={`text-xs font-bold ${product.stock < 5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {product.stock < 5 ? `Low Stock: Only ${product.stock} left!` : 'In Stock: Express Delivery Available'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
              <button 
                onClick={() => onAddToCart(product)}
                className="flex-1 bg-white border-2 border-slate-900 text-slate-900 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button 
                onClick={() => onBuyNow(product)}
                className="flex-1 bg-rose-500 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-lg active:scale-95"
              >
                Buy It Now
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 mb-8">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Lock className="w-5 h-5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">SSL Secure</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Package className="w-5 h-5 text-rose-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">Insured</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6 border-t border-stone-100">
              <span className="text-xs font-medium text-slate-400">Share this gift:</span>
              <button onClick={shareOnFacebook} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Facebook className="w-5 h-5" /></button>
              <button onClick={shareOnWhatsApp} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><MessageCircle className="w-5 h-5" /></button>
              <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Share2 className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>

      {showGreetingGenerator && (
        <GreetingGenerator 
          productName={product.name} 
          onClose={() => setShowGreetingGenerator(false)} 
        />
      )}
    </div>
  );
};

export default ProductDetail;
