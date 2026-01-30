
import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, Package, ShoppingCart, Search, Filter, AlertCircle, Plus, 
  Edit2, LogOut, Loader2, Tag, Trash2, CheckCircle2, Layout, 
  Eye, Save, DollarSign, Calendar, TrendingUp, Clock, User, 
  MapPin, Phone, Mail, X, Info, Truck, ChevronRight, Globe
} from 'lucide-react';
import Logo from '../Logo';
import { Product, OrderDetails, OrderStatus, StoreSettings, Coupon, Promotion, ShippingRate } from '../../types';
import ProductModal from './ProductModal';
import { supabase, db } from '../../lib/supabase';
import { formatPrice } from '../../lib/utils';

interface AdminDashboardProps {
  products: Product[];
  orders: OrderDetails[];
  coupons: Coupon[];
  promotions: Promotion[];
  settings: StoreSettings;
  onUpdateProduct: (product: Product) => Promise<void>;
  onAddProduct: (product: Product) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onUpdateSettings: (settings: StoreSettings) => Promise<void>;
  onAddCoupon: (coupon: Partial<Coupon>) => Promise<void>;
  onDeleteCoupon: (id: string) => Promise<void>;
  onToggleCoupon: (id: string, active: boolean) => Promise<void>;
  onRefreshData: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, orders, coupons, promotions, settings, onUpdateProduct, onAddProduct, onDeleteProduct, onUpdateOrderStatus, onUpdateSettings, onAddCoupon, onDeleteCoupon, onToggleCoupon, onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'coupons' | 'promotions' | 'settings'>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);

  // Search & Filters
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  // Coupon State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState<Partial<Coupon>>({
    code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0
  });

  // Settings State
  const [tempSettings, setTempSettings] = useState<StoreSettings>(settings);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const stats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalSales = validOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    
    const chartData = Array.from({length: 7}).map((_, i) => ({
      day: i + 1,
      val: Math.floor(Math.random() * (totalSales / 5)) + 1000
    }));

    return { revenue: totalSales, ordersCount: orders.length, lowStock: products.filter(p => p.stock < 5).length, pendingCount, chartData };
  }, [orders, products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesCategory = inventoryCategory === 'All' || p.category === inventoryCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, inventorySearch, inventoryCategory]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.shippingAddress.name.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await onUpdateSettings(tempSettings);
      alert('Studio configurations updated.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code?.trim()) {
      alert("Please enter a code");
      return;
    }
    
    setIsSaving(true);
    try {
      await onAddCoupon(couponForm);
      setIsCouponModalOpen(false);
      setCouponForm({ code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0 });
    } catch (err: any) { 
      console.error("Coupon Add Failed:", err);
      alert("Database Error: " + err.message); 
    }
    finally { setIsSaving(false); }
  };

  const handleSaveProduct = async (product: Product) => {
    setIsSaving(true);
    try {
      if (editingProduct) await onUpdateProduct(product);
      else await onAddProduct(product);
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    setIsSaving(true);
    try {
      await onDeleteCoupon(id);
    } catch (err: any) {
      alert("Failed to delete coupon: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-600';
      case 'Shipped': return 'bg-blue-100 text-blue-600';
      case 'Delivered': return 'bg-emerald-100 text-emerald-600';
      case 'Cancelled': return 'bg-rose-100 text-rose-600';
      default: return 'bg-stone-100 text-stone-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#FAF9F6] flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-[#1C1917] text-white p-8 flex flex-col h-full shadow-2xl z-20">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-2 bg-white rounded-2xl">
            <Logo variant="dark" className="w-10 h-10" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight block serif text-white">SS Studio</span>
            <span className="text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-bold">Management</span>
          </div>
        </div>

        <nav className="space-y-2 flex-grow">
          {[
            { id: 'overview', icon: BarChart3, label: 'Analytics' },
            { id: 'orders', icon: ShoppingCart, label: 'Orders' },
            { id: 'inventory', icon: Package, label: 'Inventory' },
            { id: 'coupons', icon: Tag, label: 'Coupons' },
            { id: 'promotions', icon: Layout, label: 'Banners' },
            { id: 'settings', icon: Save, label: 'Settings' },
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${activeTab === tab.id ? 'bg-[#D4AF37] text-white shadow-lg shadow-[#D4AF37]/20' : 'text-stone-500 hover:text-white hover:bg-white/5'}`}
            >
              <tab.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === tab.id ? 'text-white' : 'text-stone-500'}`} />
              <span className="font-bold text-sm tracking-wide">{tab.label}</span>
              {tab.id === 'orders' && stats.pendingCount > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">{stats.pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-white/5">
          <button onClick={handleLogout} className="w-full px-5 py-4 text-stone-500 hover:text-rose-400 rounded-2xl flex items-center gap-4 text-sm font-bold transition-all group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <main className="flex-grow overflow-y-auto p-6 md:p-12 relative scrollbar-hide">
        <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-4xl font-bold text-slate-900 capitalize serif italic">{activeTab}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Live Workshop Connection</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onRefreshData()} className="p-4 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all shadow-sm group">
              <CheckCircle2 className="w-5 h-5 text-stone-400 group-hover:text-[#D4AF37] transition-colors" />
            </button>
            {activeTab === 'coupons' && (
              <button onClick={() => setIsCouponModalOpen(true)} className="px-6 py-4 bg-[#1C1917] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#D4AF37] transition-all shadow-xl">
                <Plus className="w-4 h-4" /> Create Code
              </button>
            )}
            {activeTab === 'inventory' && (
              <button onClick={() => { setEditingProduct(undefined); setIsModalOpen(true); }} className="px-6 py-4 bg-[#1C1917] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#D4AF37] transition-all shadow-xl">
                <Plus className="w-4 h-4" /> Add Masterpiece
              </button>
            )}
          </div>
        </header>

        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-stone-50/50 text-[10px] uppercase font-bold text-stone-400 tracking-widest border-b border-stone-100">
                     <tr>
                       <th className="px-8 py-6">Code</th>
                       <th className="px-8 py-6">Benefit</th>
                       <th className="px-8 py-6">Min. Order</th>
                       <th className="px-8 py-6">Status</th>
                       <th className="px-8 py-6 text-right">Delete</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-stone-50">
                     {coupons.map(c => (
                       <tr key={c.id} className="hover:bg-stone-50/50 transition-colors group">
                         <td className="px-8 py-6">
                           <span className="font-mono text-sm font-bold text-slate-900 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
                             {c.code}
                           </span>
                         </td>
                         <td className="px-8 py-6">
                           <span className="text-sm font-bold text-[#D4AF37]">
                             {c.discount_type === 'percentage' ? `${c.discount_value}% Off` : `${formatPrice(c.discount_value)} Off`}
                           </span>
                         </td>
                         <td className="px-8 py-6">
                            <span className="text-xs text-stone-500 font-medium">
                              Above {formatPrice(c.min_order_amount)}
                            </span>
                         </td>
                         <td className="px-8 py-6">
                           <button 
                             onClick={() => onToggleCoupon(c.id, !c.active)}
                             className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${c.active ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-200 text-stone-500'}`}
                           >
                             {c.active ? 'Active' : 'Disabled'}
                           </button>
                         </td>
                         <td className="px-8 py-6 text-right">
                           <button 
                             type="button"
                             onClick={(e) => { 
                               e.preventDefault();
                               e.stopPropagation();
                               handleDeleteCoupon(c.id); 
                             }} 
                             className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border-none bg-transparent focus:outline-none focus:ring-0 appearance-none flex items-center justify-center ml-auto"
                           >
                             <Trash2 className="w-5 h-5" />
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {coupons.length === 0 && (
                   <div className="p-20 text-center">
                     <Tag className="w-16 h-16 text-stone-100 mx-auto mb-4" />
                     <p className="text-slate-400 italic">No coupons created yet.</p>
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}

        {/* Create Coupon Modal */}
        {isCouponModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#1C1917]/80 backdrop-blur-sm" onClick={() => setIsCouponModalOpen(false)} />
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-[#FAF9F6]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 text-[#D4AF37] rounded-xl flex items-center justify-center">
                    <Tag className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 serif">New Discount Code</h3>
                </div>
                <button onClick={() => setIsCouponModalOpen(false)} className="p-2.5 hover:bg-white border border-stone-200 rounded-xl transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleCouponSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Voucher Code</label>
                  <input required placeholder="VALENTINE25" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 uppercase outline-none focus:border-[#D4AF37] font-bold text-sm" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Reward Type</label>
                    <select className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 font-bold text-sm outline-none focus:border-[#D4AF37]" value={couponForm.discount_type} onChange={e => setCouponForm({...couponForm, discount_type: e.target.value as any})}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs.)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Value</label>
                    <input required type="number" placeholder="10" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 outline-none focus:border-[#D4AF37] font-bold text-sm" value={couponForm.discount_value} onChange={e => setCouponForm({...couponForm, discount_value: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Minimum Order Amount (Rs.)</label>
                  <input type="number" placeholder="2000" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 outline-none focus:border-[#D4AF37] font-bold text-sm" value={couponForm.min_order_amount} onChange={e => setCouponForm({...couponForm, min_order_amount: Number(e.target.value)})} />
                </div>
                <button type="submit" className="w-full py-5 bg-[#1C1917] text-white rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-[#D4AF37] transition-all shadow-xl">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Activate Coupon'}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Studio Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { label: 'Fulfilled Orders', value: stats.ordersCount, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Action Required', value: stats.pendingCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Low Stock', value: stats.lowStock, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all">
                  <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ... Rest of existing dashboard code ... */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-stone-50/50 text-[10px] uppercase font-bold text-stone-400 tracking-widest border-b border-stone-100">
                     <tr>
                       <th className="px-8 py-6">Creation</th>
                       <th className="px-8 py-6">Collection</th>
                       <th className="px-8 py-6">Value</th>
                       <th className="px-8 py-6">Warehouse</th>
                       <th className="px-8 py-6 text-right">Edit</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-stone-50">
                     {filteredProducts.map(p => (
                       <tr key={p.id} className="hover:bg-stone-50/50 transition-colors group">
                         <td className="px-8 py-6 flex items-center gap-5">
                           <div className="w-14 h-14 rounded-2xl overflow-hidden border border-stone-100 flex-shrink-0 bg-stone-50">
                             <img src={p.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                           </div>
                           <span className="text-sm font-bold text-slate-800 line-clamp-1">{p.name}</span>
                         </td>
                         <td className="px-8 py-6">
                           <span className="px-4 py-1.5 bg-stone-50 text-stone-500 rounded-full text-[9px] font-bold uppercase tracking-widest">
                             {p.category}
                           </span>
                         </td>
                         <td className="px-8 py-6 text-sm font-bold text-slate-900">{formatPrice(p.price)}</td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${p.stock < 5 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                               <span className={`text-[11px] font-bold ${p.stock < 5 ? 'text-rose-600' : 'text-slate-500'}`}>{p.stock} Units</span>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-right">
                           <button onClick={() => {setEditingProduct(p); setIsModalOpen(true);}} className="p-3 text-stone-300 hover:text-[#D4AF37] transition-all border-0 bg-transparent outline-none appearance-none"><Edit2 className="w-4 h-4" /></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          </div>
        )}
      </main>

      {/* Product Modal */}
      {isModalOpen && <ProductModal product={editingProduct} onClose={() => setIsModalOpen(false)} onSave={handleSaveProduct} onDelete={onDeleteProduct} />}
      
      {isSaving && (
        <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl flex flex-col items-center gap-6 animate-in zoom-in duration-200">
            <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37]" />
            <div className="text-center">
              <p className="font-bold text-slate-800 uppercase tracking-[0.2em] text-[10px]">Studio Sync in Progress</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
