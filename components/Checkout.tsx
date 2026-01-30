
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, CreditCard, Truck, Wallet, CheckCircle, Tag, ShieldCheck, MapPin, Lock, Loader2, Sparkles } from 'lucide-react';
import { CartItem, Coupon, StoreSettings, ShippingRate } from '../types';
import { formatPrice } from '../lib/utils';
import { db } from '../lib/supabase';

interface CheckoutProps {
  items: CartItem[];
  coupons: Coupon[];
  settings: StoreSettings;
  onBack: () => void;
  onPlaceOrder: (details: any) => void;
}

const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", 
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", 
  "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", 
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

const Checkout: React.FC<CheckoutProps> = ({ items, coupons, settings, onBack, onPlaceOrder }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Colombo'
  });
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const rates = await db.shippingRates.getAll();
        setShippingRates(rates);
      } catch (err) {
        console.warn("Could not fetch live shipping rates.");
      }
    };
    fetchRates();
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  
  const shippingFee = useMemo(() => {
    // SRI LANKA FREE SHIPPING RULE: 
    // If any product in the cart has isFreeShipping set to true, shipping for the whole order is Rs. 0.
    const hasFreeShippingItem = items.some(item => !!item.isFreeShipping);
    if (hasFreeShippingItem) return 0;

    // Otherwise, fetch district-specific rate
    const districtRate = shippingRates.find(r => r.district_name === form.city);
    if (districtRate) return Number(districtRate.rate);

    // Fallback defaults
    return form.city === 'Colombo' ? 350 : 500;
  }, [items, form.city, shippingRates]);

  const discount = useMemo(() => {
    if (!activeCoupon) return 0;
    return subtotal * (activeCoupon.discount_percent / 100);
  }, [activeCoupon, subtotal]);

  const total = subtotal + shippingFee - discount;

  const handleApplyCoupon = () => {
    setValidatingCoupon(true);
    setTimeout(() => {
      const found = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.active);
      if (found) {
        setActiveCoupon(found);
      } else {
        alert('Invalid or expired coupon');
        setActiveCoupon(null);
      }
      setValidatingCoupon(false);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.address || !form.phone) {
      alert('Please complete all recipient details');
      return;
    }

    setIsProcessing(true);
    try {
      const year = new Date().getFullYear();
      const randomSuffix = Math.random().toString(36).substr(2, 4).toUpperCase();
      const orderId = `#SSC-${year}-${randomSuffix}`;

      const orderPayload = {
        id: orderId,
        total,
        subtotal,
        shippingFee,
        discount,
        shippingAddress: form,
        paymentMethod: paymentMethod === 'card' ? 'Visa/Master' : paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer',
        date: new Date().toLocaleDateString(),
        status: 'Pending' as const
      };

      await onPlaceOrder(orderPayload);
    } catch (err: any) {
      alert("Checkout failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-[#FCFBF7] min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-[#D4AF37] transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Return to Boutique</span>
          </button>
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <Lock className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-100">
              <div className="flex items-center gap-4 mb-10 border-b border-stone-50 pb-6">
                <Truck className="w-6 h-6 text-[#D4AF37]" />
                <h2 className="text-2xl font-bold text-slate-800 serif italic">Delivery Concierge</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Recipient Name</label>
                  <input type="text" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Anjali Perera" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input type="email" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="recipient@email.com" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input type="tel" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+94 7X XXX XXXX" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">District</label>
                  <select className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-[#D4AF37] outline-none text-sm font-medium transition-all" value={form.city} onChange={e => setForm({...form, city: e.target.value})}>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Detailed Address</label>
                  <textarea rows={3} className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-[#D4AF37] outline-none text-sm font-medium resize-none transition-all" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="No, Street, Village..." />
                </div>
              </div>
            </section>

            <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-100">
              <div className="flex items-center gap-4 mb-10 border-b border-stone-50 pb-6">
                <CreditCard className="w-6 h-6 text-[#D4AF37]" />
                <h2 className="text-2xl font-bold text-slate-800 serif italic">Payment Method</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { id: 'card', name: 'Secure Card', icon: CreditCard, desc: 'Visa/Master' },
                  { id: 'cod', name: 'Cash on Delivery', icon: Wallet, desc: 'Pay at Door' },
                  { id: 'bank', name: 'Bank Transfer', icon: Tag, desc: 'Direct Deposit' }
                ].map(method => (
                  <button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`p-6 rounded-[2rem] border-2 text-left transition-all duration-300 relative group ${paymentMethod === method.id ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-sm' : 'border-stone-50 hover:bg-stone-50/50'}`}>
                    <method.icon className={`w-5 h-5 mb-4 ${paymentMethod === method.id ? 'text-[#D4AF37]' : 'text-slate-300'}`} />
                    <p className="font-bold text-slate-800 text-xs mb-1">{method.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">{method.desc}</p>
                    {paymentMethod === method.id && <div className="absolute top-4 right-4"><CheckCircle className="w-4 h-4 text-[#D4AF37]" /></div>}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-[#1C1917] p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/5 sticky top-24 text-white">
              <h3 className="text-xl font-bold mb-8 border-b border-white/10 pb-6 serif italic">Artisan Summary</h3>
              <div className="max-h-48 overflow-y-auto mb-8 pr-2 space-y-4 scrollbar-hide">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.image} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                    <div className="flex-grow">
                      <p className="text-[11px] font-bold text-stone-100 line-clamp-1">{item.name}</p>
                      <p className="text-[9px] text-stone-500 uppercase tracking-widest">Qty: {item.quantity}</p>
                      <p className="text-xs font-bold text-[#D4AF37] mt-1">{formatPrice(item.price * item.quantity)}</p>
                      {item.isFreeShipping && <span className="text-[8px] text-emerald-400 uppercase tracking-widest font-bold">Free Shipping Item</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-8 pt-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input type="text" placeholder="Promo Code" className="flex-grow px-4 py-3 text-xs rounded-xl bg-white/5 border border-white/10 outline-none text-white" value={couponCode} onChange={e => setCouponCode(e.target.value)} />
                  <button onClick={handleApplyCoupon} disabled={validatingCoupon} className="bg-[#D4AF37] text-white px-5 py-3 rounded-xl text-[10px] font-bold hover:bg-[#B8860B] disabled:opacity-50 uppercase tracking-widest">
                    {validatingCoupon ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Apply'}
                  </button>
                </div>
                {activeCoupon && <p className="text-[9px] text-[#D4AF37] mt-3 uppercase tracking-widest font-bold">✓ Coupon Applied</p>}
              </div>

              <div className="space-y-3 mb-10">
                <div className="flex justify-between text-[10px] text-stone-400 uppercase tracking-widest"><span>Items Subtotal</span><span className="font-bold text-white">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-[10px] text-stone-400 uppercase tracking-widest">
                  <span>Shipping ({form.city})</span>
                  <span className={`font-bold ${shippingFee === 0 ? 'text-emerald-400' : 'text-white'}`}>
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                  </span>
                </div>
                {discount > 0 && <div className="flex justify-between text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest"><span>Membership Discount</span><span>-{formatPrice(discount)}</span></div>}
                <div className="flex justify-between text-2xl font-bold pt-6 border-t border-white/10 text-white serif italic"><span>Total</span><span className="text-[#D4AF37]">{formatPrice(total)}</span></div>
              </div>

              <button 
                onClick={handleSubmit} 
                disabled={isProcessing}
                className="w-full py-5 bg-[#D4AF37] hover:bg-[#B8860B] text-white rounded-2xl font-bold transition-all shadow-xl shadow-[#D4AF37]/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> <span className="uppercase tracking-[0.2em] text-[10px]">Complete Creation</span></>}
              </button>
              
              <p className="text-center text-[8px] text-stone-500 uppercase tracking-widest mt-6">Secure Encrypted Payment Channel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
