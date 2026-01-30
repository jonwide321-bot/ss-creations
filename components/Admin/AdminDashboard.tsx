
import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3, Package, ShoppingCart, Users, Search, Filter, Printer, AlertCircle, Plus, Edit2, Settings as SettingsIcon, LogOut, Loader2, Tag, Trash2, CheckCircle2, Truck, Save, MapPin } from 'lucide-react';
import Logo from '../Logo';
import { Product, OrderDetails, OrderStatus, StoreSettings, Coupon, ShippingRate } from '../../types';
import ProductModal from './ProductModal';
import { supabase, db } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';

interface AdminDashboardProps {
  products: Product[];
  orders: OrderDetails[];
  coupons: Coupon[];
  settings: StoreSettings;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateSettings: (settings: StoreSettings) => void;
  onAddCoupon: (coupon: Partial<Coupon>) => void;
  onDeleteCoupon: (id: string) => void;
  onToggleCoupon: (id: string, active: boolean) => void;
}

const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", 
  "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", 
  "Mannar", "Matale", "Matara", "Moneragala", "Mullaitivu", "Nuwara Eliya", 
  "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, orders, coupons, settings, onUpdateProduct, onAddProduct, onDeleteProduct, onUpdateOrderStatus, onUpdateSettings, onAddCoupon, onDeleteCoupon, onToggleCoupon
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'coupons' | 'settings'>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [savingRates, setSavingRates] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      const rates = await db.shippingRates.getAll();
      setShippingRates(rates);
    };
    fetchRates();
  }, [activeTab]);

  const stats = useMemo(() => {
    const totalSales = orders.filter(o => o.status !== 'Cancelled').reduce((sum, o) => sum + Number(o.total), 0);
    const lowStockCount = products.filter(p => p.stock < 5).length;
    const uniqueCustomers = new Set(orders.map(o => o.shippingAddress?.email)).size;
    return { revenue: totalSales, ordersCount: orders.length, customers: uniqueCustomers, lowStock: lowStockCount };
  }, [orders, products]);

  const handleLogout = async () => { await (supabase.auth as any).signOut(); };

  const handleSaveProduct = async (product: Product) => {
    setIsSaving(true);
    try {
      if (editingProduct) {
        await onUpdateProduct(product);
      } else {
        await onAddProduct(product);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('❌ Error: ' + (err.message || 'Update your Supabase schema first!'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateShippingRate = async (district: string, rate: number) => {
    const existing = shippingRates.find(r => r.district_name === district);
    try {
      if (existing) {
        await db.shippingRates.updateRate(existing.id, rate);
      } else {
        await db.shippingRates.upsert({ district_name: district, rate });
      }
      const updated = await db.shippingRates.getAll();
      setShippingRates(updated);
    } catch (err) {
      alert("Failed to update shipping rate.");
    }
  };

  const handlePrepopulateRates = async () => {
    setSavingRates(true);
    try {
      for (const district of DISTRICTS) {
        const existing = shippingRates.find(r => r.district_name === district);
        if (!existing) {
          await db.shippingRates.upsert({ district_name: district, rate: district === 'Colombo' ? 350 : 500 });
        }
      }
      const updated = await db.shippingRates.getAll();
      setShippingRates(updated);
      alert("Defaults loaded!");
    } catch (err) {
      alert("Error prepopulating rates.");
    } finally {
      setSavingRates(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-50 flex flex-col md:flex-row overflow-hidden font-sans">
      <div className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col h-full shadow-2xl z-20">
        <div className="flex items-center gap-3 mb-12">
          <Logo variant="light" className="w-8 h-8 rounded-full" />
          <span className="text-lg font-bold tracking-tight serif">SS Admin</span>
        </div>
        <nav className="space-y-2 flex-grow">
          {[
            { id: 'overview', icon: BarChart3, label: 'Dashboard' },
            { id: 'orders', icon: ShoppingCart, label: 'Orders' },
            { id: 'inventory', icon: Package, label: 'Inventory' },
            { id: 'coupons', icon: Tag, label: 'Coupons' },
            { id: 'settings', icon: SettingsIcon, label: 'Settings' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <tab.icon className="w-5 h-5" />
              <span className="font-semibold text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-auto px-4 py-4 text-slate-400 hover:text-rose-400 flex items-center gap-3 text-sm font-bold border-t border-white/5 pt-6 group">
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Logout
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 md:p-8">
        <header className="flex justify-between items-center mb-8 pb-6 border-b border-stone-200">
          <h2 className="text-3xl font-bold text-slate-800 capitalize serif">{activeTab}</h2>
          <div className="bg-rose-50 text-rose-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Store Live</div>
        </header>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Revenue', value: formatPrice(stats.revenue), icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { label: 'Orders', value: stats.ordersCount, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50' },
              { label: 'Customers', value: stats.customers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
              { label: 'Low Stock', value: stats.lowStock, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
            ].map((card, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
                <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-4`}><card.icon className="w-6 h-6" /></div>
                <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{card.label}</p>
                <h4 className="text-2xl font-bold text-slate-800">{card.value}</h4>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h3 className="font-bold text-slate-800 serif text-xl">Inventory</h3>
              <button onClick={() => { setEditingProduct(undefined); setIsModalOpen(true); }} className="bg-slate-900 hover:bg-rose-500 text-white px-6 py-3 rounded-2xl text-xs font-bold transition-all"><Plus className="w-4 h-4 mr-2 inline" /> New Listing</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50/80 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  <tr>
                    <th className="px-6 py-4">Treasure</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4">Free Ship</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-stone-50/50 group">
                      <td className="px-6 py-4 flex items-center gap-4">
                        <img src={p.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                        <span className="text-sm font-bold text-slate-800">{p.name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatPrice(p.price)}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">{p.stock} units</td>
                      <td className="px-6 py-4">
                        {p.isFreeShipping ? (
                          <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">Active</span>
                        ) : (
                          <span className="text-stone-300 text-[9px] font-bold uppercase tracking-widest">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-rose-500"><Edit2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl">
              <div className="flex justify-between items-center mb-10 border-b border-stone-50 pb-6">
                <h3 className="font-bold text-slate-800 serif text-2xl italic">Sri Lanka Delivery Rates</h3>
                <button onClick={handlePrepopulateRates} disabled={savingRates} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-all flex items-center gap-2">
                  {savingRates ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Load Default Rates
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {DISTRICTS.map(district => {
                  const rateEntry = shippingRates.find(r => r.district_name === district);
                  return (
                    <div key={district} className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 block">{district}</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
                        <input 
                          type="number" 
                          className="w-full pl-10 pr-4 py-2 text-sm font-bold rounded-xl border border-stone-200 outline-none focus:border-[#D4AF37]" 
                          defaultValue={rateEntry?.rate || (district === 'Colombo' ? 350 : 500)}
                          onBlur={(e) => handleUpdateShippingRate(district, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ProductModal 
          product={editingProduct} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSaveProduct} 
          onDelete={onDeleteProduct} 
        />
      )}
      {isSaving && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
            <p className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Updating Database...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
