
import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';
import { formatPrice } from '../lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-slate-800">Your Basket</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <ShoppingBag className="w-16 h-16 mb-4 text-stone-200" />
              <p className="text-slate-500">Your basket is currently empty.</p>
              <button 
                onClick={onClose}
                className="mt-4 text-rose-500 font-semibold hover:underline"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 group">
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-stone-50">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-semibold text-slate-800 line-clamp-1">{item.name}</h4>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-stone-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-rose-500 font-bold mb-3">{formatPrice(item.price)}</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-stone-50 rounded-lg border border-stone-200">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="p-1.5 hover:text-rose-500 transition-colors disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="p-1.5 hover:text-rose-500 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-stone-100 bg-stone-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="text-2xl font-bold text-slate-900">{formatPrice(total)}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]"
            >
              Proceed to Checkout
            </button>
            <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure SSL Checkout. Free shipping over Rs. 20,000.00.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
