import React, { useState } from 'react';
import { Search, Package, ArrowLeft, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { OrderDetails } from '../types';

interface OrderTrackingProps {
  orders: OrderDetails[];
  onBack: () => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orders, onBack }) => {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState<OrderDetails | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(o => o.id.toUpperCase() === orderId.trim().toUpperCase());
    setResult(found || null);
    setSearched(true);
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pending': return 1;
      case 'Shipped': return 2;
      case 'Delivered': return 3;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors mb-8 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Shopping
        </button>

        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-stone-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 serif">Track Your Gift</h1>
            <p className="text-slate-500">Enter your order ID below to check its current status.</p>
          </div>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 mb-12">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Order ID (e.g. ORD-B2C4...)"
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all font-mono text-sm"
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-rose-500 transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              Track Order
            </button>
          </form>

          {searched && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              {result ? (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-center p-6 bg-stone-50 rounded-3xl border border-stone-100 gap-4 text-center sm:text-left">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                      <h3 className={`text-xl font-bold ${result.status === 'Delivered' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {result.status}
                      </h3>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Delivery</p>
                      <p className="text-sm font-bold text-slate-800">2-3 Business Days</p>
                    </div>
                  </div>

                  <div className="relative pt-8 pb-4">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-100 -translate-y-1/2 rounded-full" />
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-rose-500 -translate-y-1/2 rounded-full transition-all duration-1000" 
                      style={{ width: `${(getStatusStep(result.status) - 1) * 50}%` }}
                    />
                    
                    <div className="relative flex justify-between">
                      {[
                        { icon: Clock, label: 'Order Placed', step: 1 },
                        { icon: Truck, label: 'In Transit', step: 2 },
                        { icon: CheckCircle, label: 'Delivered', step: 3 }
                      ].map((s) => (
                        <div key={s.label} className="flex flex-col items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${getStatusStep(result.status) >= s.step ? 'bg-rose-500 border-rose-100 text-white' : 'bg-white border-stone-50 text-slate-300'}`}>
                            <s.icon className="w-5 h-5" />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${getStatusStep(result.status) >= s.step ? 'text-slate-800' : 'text-slate-300'}`}>
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-white border border-stone-100 rounded-3xl space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Delivery Address</span>
                      <span className="font-bold text-slate-800">{result.shippingAddress.address}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">City</span>
                      <span className="font-bold text-slate-800">{result.shippingAddress.city}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Order Not Found</h3>
                  <p className="text-slate-500 text-sm">We couldn't find an order with that ID. Please check the spelling and try again.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;