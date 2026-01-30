
import React from 'react';
import { Heart, ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';

interface WishlistProps {
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product) => void;
  onBack: () => void;
}

const Wishlist: React.FC<WishlistProps> = ({ products, wishlist, onToggleWishlist, onAddToCart, onBack }) => {
  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-stone-50 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors mb-8 font-semibold">
          <ArrowLeft className="w-5 h-5" />
          Back to Store
        </button>

        <div className="flex items-center gap-3 mb-12">
          <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
          <h1 className="text-4xl font-bold text-slate-900 serif">Your Wishlist</h1>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="bg-white p-20 rounded-[2.5rem] shadow-sm border border-stone-100 text-center">
            <Heart className="w-16 h-16 text-stone-200 mx-auto mb-6" />
            <p className="text-slate-500 text-lg mb-8 italic">Your wishlist is currently empty.</p>
            <button 
              onClick={onBack}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-rose-500 transition-all shadow-lg"
            >
              Discover New Gifts
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlistedProducts.map(product => (
              <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 group relative">
                <div className="aspect-square overflow-hidden relative">
                  <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                  <button 
                    onClick={() => onToggleWishlist(product.id)}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg text-rose-500 hover:scale-110 transition-transform"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{product.name}</h3>
                  <p className="text-rose-500 font-bold mb-6">{formatPrice(product.price)}</p>
                  <button 
                    onClick={() => onAddToCart(product)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-500 transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
