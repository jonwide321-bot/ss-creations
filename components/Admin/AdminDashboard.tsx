import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, Package, ShoppingCart, Search, Filter, AlertCircle, Plus, 
  Edit2, LogOut, Loader2, Tag, Trash2, CheckCircle2, Layout, 
  Eye, Save, DollarSign, Calendar, TrendingUp, Clock, User, 
  MapPin, Phone, Mail, X, Info, Truck, ChevronRight, Globe, Percent, 
  ToggleLeft, ToggleRight, ArrowUpRight, ArrowDownRight, MoreVertical, Check, 
  ShoppingBag, RefreshCw, Layers
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import Logo from '../Logo';
import { Product, OrderDetails, OrderStatus, StoreSettings, Coupon, Promotion } from '../../types';
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
  onLogout: () => Promise<void>;
}

const COLORS = ['#D4AF37', '#f43f5e', '#3b82f6', '#10b981', '#a855f7', '#f59e0b'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, orders, coupons, promotions, settings, onUpdateProduct, onAddProduct, onDeleteProduct, onUpdateOrderStatus, onUpdateSettings, onAddCoupon, onDeleteCoupon, onToggleCoupon, onRefreshData, onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'coupons' | 'promotions' | 'settings'>('overview');
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } catch (err) {
      console.error("Logout failed", err);
      window.location.reload();
    }
  };

  const stats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'Cancelled');
    const totalSales = validOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    
    // Revenue trend (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayOrders = validOrders.filter(o => new Date(o.date).toDateString() === d.toDateString());
      return {
        name: dayStr,
        revenue: dayOrders.reduce((sum, o) => sum + Number(o.total), 0),
        orders: dayOrders.length
      };
    }).reverse();

    // Category distribution
    const catMap = validOrders.reduce((acc: Record<string, number>, order) => {
      order.items.forEach(item => {
        acc[item.category] = (acc[item.category] || 0) + (item.price * item.quantity);
      });
      return acc;
    }, {});
    const categoryData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    return { 
      revenue: totalSales, 
      ordersCount: orders.length, 
      lowStock: products.filter(p => p.stock < 5).length, 
      pendingCount,
      chartData: last7Days,
      categoryData: categoryData.length > 0 ? categoryData : [{ name: 'None', value: 1 }]
    };
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
    if (!couponForm.code?.trim()) return;
    setIsSaving(true);
    try {
      await onAddCoupon(couponForm);
      setIsCouponModalOpen(false);
      setCouponForm({ code: '', discount_type: 'percentage', discount_value: 10, min_order_amount: 0 });
    } catch (err: any) { alert(err.message); }
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
          <button 
            onClick={handleLogoutClick} 
            disabled={isLoggingOut}
            className="w-full px-5 py-4 text-stone-500 hover:text-rose-400 rounded-2xl flex items-center gap-4 text-sm font-bold transition-all group disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
            ) : (
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            )}
            {isLoggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
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
            <button onClick={() => onRefreshData()} className="p-4 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-all shadow-sm group" title="Refresh Data">
              <RefreshCw className="w-5 h-5 text-stone-400 group-hover:text-[#D4AF37] transition-colors" />
            </button>
            {activeTab === 'inventory' && (
              <button onClick={() => { setEditingProduct(undefined); setIsModalOpen(true); }} className="px-6 py-4 bg-[#1C1917] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#D4AF37] transition-all shadow-xl">
                <Plus className="w-4 h-4" /> Add Masterpiece
              </button>
            )}
            {activeTab === 'coupons' && (
              <button onClick={() => setIsCouponModalOpen(true)} className="px-6 py-4 bg-[#1C1917] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#D4AF37] transition-all shadow-xl">
                <Plus className="w-4 h-4" /> New Coupon
              </button>
            )}
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            {/* 1. Enhanced Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Revenue', value: formatPrice(stats.revenue), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '+12.5%', isUp: true },
                { label: 'Total Orders', value: stats.ordersCount, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50', trend: '+4.3%', isUp: true },
                { label: 'Pending', value: stats.pendingCount, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', trend: '-2.1%', isUp: false },
                { label: 'Low Stock', value: stats.lowStock, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50', trend: '0%', isUp: true },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm flex flex-col gap-6 group hover:shadow-xl transition-all cursor-pointer relative overflow-hidden">
                  <div className="flex items-center justify-between z-10">
                    <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-bold ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {stat.trend}
                    </div>
                  </div>
                  <div className="z-10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <h4 className="text-2xl font-bold text-slate-900">{stat.value}</h4>
                  </div>
                  {/* Subtle Background Pattern */}
                  <div className="absolute -bottom-4 -right-4 opacity-[0.03] text-slate-900 group-hover:scale-110 transition-transform duration-700">
                    <stat.icon className="w-24 h-24" />
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => { setActiveTab('inventory'); setEditingProduct(undefined); setIsModalOpen(true); }} className="bg-[#D4AF37] hover:bg-[#B8860B] text-white rounded-3xl p-6 flex items-center gap-4 transition-all shadow-lg active:scale-95">
                <Plus className="w-6 h-6" />
                <span className="font-bold text-[10px] uppercase tracking-widest">New Product</span>
              </button>
              <button onClick={() => setActiveTab('orders')} className="bg-white hover:bg-stone-50 border border-stone-100 text-slate-800 rounded-3xl p-6 flex items-center gap-4 transition-all shadow-sm active:scale-95">
                <Truck className="w-6 h-6 text-blue-500" />
                <span className="font-bold text-[10px] uppercase tracking-widest">Process Orders</span>
              </button>
              <button onClick={() => setActiveTab('coupons')} className="bg-white hover:bg-stone-50 border border-stone-100 text-slate-800 rounded-3xl p-6 flex items-center gap-4 transition-all shadow-sm active:scale-95">
                <Tag className="w-6 h-6 text-[#D4AF37]" />
                <span className="font-bold text-[10px] uppercase tracking-widest">Promotions</span>
              </button>
              <button onClick={() => setActiveTab('settings')} className="bg-white hover:bg-stone-50 border border-stone-100 text-slate-800 rounded-3xl p-6 flex items-center gap-4 transition-all shadow-sm active:scale-95">
                <Save className="w-6 h-6 text-emerald-500" />
                <span className="font-bold text-[10px] uppercase tracking-widest">Site Settings</span>
              </button>
            </div>

            {/* 3. Charts & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-bold text-slate-800 serif italic">Revenue Pulse</h3>
                  <div className="flex gap-2 bg-stone-50 p-1.5 rounded-2xl">
                    <button className="px-4 py-1.5 text-[10px] font-bold rounded-xl bg-white text-[#D4AF37] shadow-sm uppercase">7D</button>
                    <button className="px-4 py-1.5 text-[10px] font-bold rounded-xl text-stone-400 uppercase">30D</button>
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(v) => `Rs.${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1C1917', border: 'none', borderRadius: '16px', color: '#fff' }}
                        itemStyle={{ color: '#D4AF37', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 serif italic mb-10">Sales by Collection</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1C1917', border: 'none', borderRadius: '16px', color: '#fff' }}
                        itemStyle={{ fontSize: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4 mt-6">
                  {stats.categoryData.slice(0, 4).map((cat, i) => (
                    <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide group-hover:text-slate-800 transition-colors">{cat.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">{(cat.value / stats.revenue * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Recent Activity & Low Stock Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-[3rem] border border-stone-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-stone-50 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800 serif italic">Latest Transactions</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest hover:underline flex items-center gap-2">
                    View Ledger <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50/50 text-[9px] uppercase font-bold text-stone-400 tracking-widest border-b border-stone-100">
                      <tr>
                        <th className="px-8 py-4">Artifact ID</th>
                        <th className="px-8 py-4">Client</th>
                        <th className="px-8 py-4">Value</th>
                        <th className="px-8 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id} className="hover:bg-stone-50/50 transition-colors cursor-pointer" onClick={() => setSelectedOrder(o)}>
                          <td className="px-8 py-4 text-xs font-mono font-bold text-slate-800">{o.id}</td>
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 bg-stone-100 rounded-full flex items-center justify-center text-[10px] font-bold text-stone-500">
                                {o.shippingAddress.name.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-slate-700">{o.shippingAddress.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4 text-xs font-bold text-[#D4AF37]">{formatPrice(o.total)}</td>
                          <td className="px-8 py-4">
                            <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${getStatusColor(o.status)}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-[#1C1917] p-10 rounded-[3rem] shadow-xl text-white">
                  <h3 className="text-xl font-bold text-[#D4AF37] serif italic mb-8 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500" /> Studio Alerts
                  </h3>
                  <div className="space-y-6">
                    {products.filter(p => p.stock < 5).slice(0, 3).length > 0 ? (
                      products.filter(p => p.stock < 5).slice(0, 3).map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-4">
                            <img src={p.image} className="w-10 h-10 rounded-xl object-cover" alt="" />
                            <div>
                              <p className="text-[11px] font-bold text-stone-100 line-clamp-1">{p.name}</p>
                              <p className="text-[9px] text-stone-500 uppercase tracking-widest">{p.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-rose-500">{p.stock}</p>
                            <p className="text-[8px] text-stone-500 uppercase font-bold">Left</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center">
                        <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                        <p className="text-xs text-stone-400 italic">Inventory levels are optimal.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 serif italic mb-8">Activity Feed</h3>
                  <div className="space-y-8">
                    {orders.slice(0, 3).map((o, idx) => (
                      <div key={idx} className="flex gap-6 relative">
                        {idx !== 2 && <div className="absolute top-8 left-4 bottom-[-32px] w-[1px] bg-stone-100" />}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${idx === 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-stone-50 text-stone-400'}`}>
                          {idx === 0 ? <ShoppingBag className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Order Recieved</p>
                          <p className="text-[10px] text-stone-400 mt-1">{o.shippingAddress.name} placed {o.id}</p>
                          <p className="text-[9px] text-stone-300 font-bold uppercase tracking-widest mt-2">{new Date(o.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Orders Header with Search */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm">
               <div className="relative flex-grow">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                 <input 
                  type="text" 
                  placeholder="Find by ID or Client..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-stone-50 border-none outline-none text-sm font-medium focus:ring-2 focus:ring-[#D4AF37]/50"
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                 />
               </div>
               <select 
                className="px-6 py-3 rounded-2xl bg-stone-50 border-none outline-none text-sm font-bold uppercase tracking-widest text-slate-500"
                value={orderStatusFilter}
                onChange={e => setOrderStatusFilter(e.target.value)}
               >
                 <option value="All">All Stages</option>
                 <option value="Pending">Pending</option>
                 <option value="Shipped">Shipped</option>
                 <option value="Delivered">Delivered</option>
                 <option value="Cancelled">Cancelled</option>
               </select>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-stone-50/50 text-[10px] uppercase font-bold text-stone-400 tracking-widest border-b border-stone-100">
                     <tr>
                       <th className="px-8 py-6">Order Info</th>
                       <th className="px-8 py-6">Customer</th>
                       <th className="px-8 py-6">Total</th>
                       <th className="px-8 py-6">Status</th>
                       <th className="px-8 py-6 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-stone-50">
                     {filteredOrders.map(o => (
                       <tr key={o.id} className="hover:bg-stone-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(o)}>
                         <td className="px-8 py-6">
                           <p className="text-sm font-bold text-slate-900">{o.id}</p>
                           <p className="text-[10px] text-stone-400 font-medium">{new Date(o.date).toLocaleDateString()}</p>
                         </td>
                         <td className="px-8 py-6">
                           <p className="text-sm font-bold text-slate-800">{o.shippingAddress.name}</p>
                           <p className="text-[10px] text-stone-400">{o.shippingAddress.city}</p>
                         </td>
                         <td className="px-8 py-6 text-sm font-bold text-[#D4AF37]">{formatPrice(o.total)}</td>
                         <td className="px-8 py-6">
                            <select 
                              value={o.status} 
                              onClick={e => e.stopPropagation()}
                              onChange={e => onUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                              className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border-none outline-none appearance-none cursor-pointer ${getStatusColor(o.status)}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                         </td>
                         <td className="px-8 py-6 text-right">
                           <button className="p-3 text-stone-300 hover:text-[#D4AF37] transition-all"><Eye className="w-5 h-5" /></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {filteredOrders.length === 0 && (
                   <div className="p-20 text-center">
                     <ShoppingCart className="w-16 h-16 text-stone-100 mx-auto mb-4" />
                     <p className="text-slate-400 italic">No orders received yet.</p>
                   </div>
                 )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex flex-col sm:flex-row gap-4 bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm">
               <div className="relative flex-grow">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                 <input 
                  type="text" 
                  placeholder="Search masterpieces..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-stone-50 border-none outline-none text-sm font-medium focus:ring-2 focus:ring-[#D4AF37]/50"
                  value={inventorySearch}
                  onChange={e => setInventorySearch(e.target.value)}
                 />
               </div>
               <select 
                className="px-6 py-3 rounded-2xl bg-stone-50 border-none outline-none text-sm font-bold uppercase tracking-widest text-slate-500"
                value={inventoryCategory}
                onChange={e => setInventoryCategory(e.target.value)}
               >
                 <option value="All">All Collections</option>
                 {Array.from(new Set(products.map(p => p.category))).map(cat => (
                   <option key={cat} value={cat}>{cat}</option>
                 ))}
               </select>
            </div>

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
                           <button onClick={() => {setEditingProduct(p); setIsModalOpen(true);}} className="p-3 text-stone-300 hover:text-[#D4AF37] transition-all"><Edit2 className="w-4 h-4" /></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {coupons.map(c => (
              <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm relative group hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-stone-50 rounded-2xl text-[#D4AF37]">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onToggleCoupon(c.id, !c.active)} className={`p-2 rounded-xl transition-all ${c.active ? 'text-emerald-500 bg-emerald-50' : 'text-stone-300 bg-stone-50'}`}>
                      {c.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                    <button onClick={() => onDeleteCoupon(c.id)} className="p-2 text-stone-300 hover:text-rose-500 bg-stone-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
                <h4 className="text-xl font-mono font-bold text-slate-900 mb-2">{c.code}</h4>
                <p className="text-sm font-bold text-[#D4AF37] mb-4">
                  {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `${formatPrice(c.discount_value)} OFF`}
                </p>
                <div className="pt-4 border-t border-stone-50 flex justify-between items-center">
                  <span className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Min. {formatPrice(c.min_order_amount)}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${c.active ? 'text-emerald-500' : 'text-stone-400'}`}>{c.active ? 'Active' : 'Disabled'}</span>
                </div>
              </div>
            ))}
            {coupons.length === 0 && (
              <div className="col-span-full p-20 text-center bg-white rounded-[2.5rem] border border-dashed border-stone-200">
                <Tag className="w-12 h-12 text-stone-100 mx-auto mb-4" />
                <p className="text-slate-400 italic">No coupons found. Create your first discount offer.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
             {promotions.map(promo => (
               <div key={promo.id} className="bg-white rounded-[3rem] p-8 border border-stone-100 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-10 h-10 rounded-full" style={{ backgroundColor: promo.bg_color }} />
                    <div>
                      <h4 className="font-bold text-slate-800">{promo.title}</h4>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest">{promo.badge_text}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-6 relative z-10">{promo.description}</p>
                  <div className="flex justify-between items-center relative z-10">
                    <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${promo.active ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-50 text-stone-400'}`}>
                      {promo.active ? 'Visible' : 'Hidden'}
                    </span>
                    <button className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest hover:underline">Edit Banner</button>
                  </div>
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                    <Layout className="w-32 h-32" />
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl animate-in fade-in duration-500">
             <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4 border-b border-stone-50 pb-6">
                  <Truck className="w-6 h-6 text-[#D4AF37]" />
                  <h3 className="text-xl font-bold text-slate-800 serif italic">Logistics Config</h3>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Base Shipping Fee (Rs.)</label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-[#D4AF37] outline-none text-sm font-bold transition-all"
                    value={tempSettings.baseShippingFee}
                    onChange={e => setTempSettings({ ...tempSettings, baseShippingFee: Number(e.target.value) })}
                  />
                  <p className="text-[10px] text-stone-400 mt-2 italic px-1">Default fee applied when district-specific rate is not found.</p>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="w-full py-5 bg-[#1C1917] hover:bg-[#D4AF37] text-white rounded-2xl font-bold transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> <span className="uppercase tracking-[0.2em] text-[10px]">Deploy Configuration</span></>}
                  </button>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1C1917]/80 backdrop-blur-sm" onClick={() => setIsCouponModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-stone-100 bg-[#FAF9F6] flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 serif">New Discount Hook</h3>
              <button onClick={() => setIsCouponModalOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCouponSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Coupon Code</label>
                <input required type="text" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 focus:border-[#D4AF37] outline-none text-sm font-mono uppercase" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} placeholder="SAVE20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Type</label>
                  <select className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 outline-none text-sm" value={couponForm.discount_type} onChange={e => setCouponForm({...couponForm, discount_type: e.target.value as any})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (Rs.)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Value</label>
                  <input required type="number" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 outline-none text-sm font-bold" value={couponForm.discount_value} onChange={e => setCouponForm({...couponForm, discount_value: Number(e.target.value)})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Minimum Order Amount (Rs.)</label>
                <input type="number" className="w-full px-5 py-4 rounded-2xl bg-stone-50 border border-stone-200 outline-none text-sm font-bold" value={couponForm.min_order_amount} onChange={e => setCouponForm({...couponForm, min_order_amount: Number(e.target.value)})} />
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-5 bg-[#1C1917] text-white rounded-2xl font-bold hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Generate Coupon</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1C1917]/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-[#FAF9F6]">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 serif">Order Details</h3>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mt-1">{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2.5 hover:bg-white border border-stone-200 rounded-xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="p-8 overflow-y-auto max-h-[70vh] space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Customer Profile</h5>
                  <p className="text-sm font-bold text-slate-800">{selectedOrder.shippingAddress.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedOrder.shippingAddress.phone}</p>
                  <p className="text-xs text-slate-500">{selectedOrder.shippingAddress.email}</p>
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Delivery Destination</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}</p>
                </div>
              </div>

              <div>
                <h5 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Ordered Artifacts</h5>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                      <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-stone-100">
                        <img src={item.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-grow">
                        <p className="text-xs font-bold text-slate-800">{item.name}</p>
                        <p className="text-[10px] text-stone-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100 space-y-3">
                <div className="flex justify-between text-xs text-stone-500 uppercase font-bold tracking-widest"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between text-xs text-stone-500 uppercase font-bold tracking-widest"><span>Shipping</span><span>{formatPrice(selectedOrder.shippingFee)}</span></div>
                {selectedOrder.discount > 0 && <div className="flex justify-between text-xs text-[#D4AF37] uppercase font-bold tracking-widest"><span>Discount</span><span>-{formatPrice(selectedOrder.discount)}</span></div>}
                <div className="flex justify-between text-xl font-bold text-slate-900 pt-3 border-t border-stone-50 serif italic"><span>Total Value</span><span className="text-[#D4AF37]">{formatPrice(selectedOrder.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && <ProductModal product={editingProduct} onClose={() => setIsModalOpen(false)} onSave={handleSaveProduct} onDelete={onDeleteProduct} />}
      {isSaving && (
        <div className="fixed inset-0 z-[300] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37]" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;