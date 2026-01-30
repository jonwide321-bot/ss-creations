
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import GiftFinder from './components/GiftFinder';
import CartDrawer from './components/CartDrawer';
import CategoryShowcase from './components/CategoryShowcase';
import PromoBanners from './components/PromoBanners';
import Testimonials from './components/Testimonials';
import Checkout from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import WhatsAppButton from './components/WhatsAppButton';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminLogin from './components/Admin/AdminLogin';
import OrderTracking from './components/OrderTracking';
import PolicyPages from './components/PolicyPages';
import Wishlist from './components/Wishlist';
import Loader from './components/Loader';
import { SkeletonGrid } from './components/ProductSkeleton';
import Logo from './components/Logo';
import { testimonials } from './data';
import { Product, CartItem, OrderDetails, StoreSettings, Coupon, Promotion } from './types';
import { Filter, Heart, AlertCircle, Facebook, Instagram, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { supabase, db } from './lib/supabase';

type View = 'catalog' | 'detail' | 'checkout' | 'success' | 'admin_login' | 'admin_dashboard' | 'track-order' | 'returns' | 'delivery' | 'contact' | 'wishlist';
type SortOption = 'newest' | 'price-low' | 'price-high';

const App: React.FC = () => {
  const [productsState, setProductsState] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({ baseShippingFee: 500.00 });
  
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<SortOption>('newest');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentView, setCurrentView] = useState<View>('catalog');
  const [lastOrder, setLastOrder] = useState<OrderDetails | null>(null);

  const visitorId = useMemo(() => {
    let id = localStorage.getItem('ss_visitor_id');
    if (!id) {
      id = 'v-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ss_visitor_id', id);
    }
    return id;
  }, []);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    console.log("🔄 Syncing with SS Studio Database...");
    
    try {
      const results = await Promise.allSettled([
        db.products.getAll(),
        db.settings.get(),
        db.orders.getAll(),
        db.coupons.getAll(),
        db.wishlist.get(visitorId),
        db.promotions.getAll()
      ]);

      const [p, s, o, c, w, pr] = results.map((r, idx) => {
        if (r.status === 'fulfilled') return r.value;
        console.error(`❌ Load Error in category ${idx}:`, (r as PromiseRejectedResult).reason);
        return null;
      });

      if (p) {
        console.log(`✅ Loaded ${p.length} products`);
        setProductsState(p);
      } else {
        setProductsState([]);
      }

      if (s) setSettings(s);
      
      // Crucial: Set orders even if result is null to avoid stale empty state
      console.log(`📦 Order Sync: ${o ? o.length : 0} records fetched`);
      setOrders(o || []);
      
      if (c) setCoupons(c);
      if (w) setWishlist(w);
      if (pr) setPromotions(pr);
      
      setLoadError(null);
    } catch (err: any) {
      console.error("🚨 Critical Sync Error:", err);
      if (!isSilent) setLoadError("Unable to connect to the studio. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }, [visitorId]);

  useEffect(() => {
    const startTime = Date.now();
    const MIN_LOAD_TIME = 5500; 

    const init = async () => {
      await loadData();
      
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_LOAD_TIME - elapsedTime);
      
      setTimeout(() => setShowSplash(false), remainingTime);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdminLoggedIn(!!session);
      if (event === 'SIGNED_IN') {
        setCurrentView('admin_dashboard');
        loadData(true); // Re-sync data on login
      }
      if (event === 'SIGNED_OUT') {
        setCurrentView('catalog');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadData]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Force UI reset regardless of listener delay
      setCurrentView('catalog');
      setIsAdminLoggedIn(false);
    } catch (err) {
      console.error("Logout error", err);
      // Even if error, try to clear UI
      setCurrentView('catalog');
    }
  };

  const toggleWishlist = async (id: string) => {
    const isAdded = wishlist.includes(id);
    if (isAdded) {
      setWishlist(prev => prev.filter(item => item !== id));
      await db.wishlist.remove(visitorId, id);
    } else {
      setWishlist(prev => [...prev, id]);
      await db.wishlist.add(visitorId, id);
    }
  };

  const sortedProducts = useMemo(() => {
    let filtered = activeCategory === 'All' ? productsState : productsState.filter(p => p.category === activeCategory);
    if (sortOrder === 'price-low') return [...filtered].sort((a, b) => a.price - b.price);
    if (sortOrder === 'price-high') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [productsState, activeCategory, sortOrder]);

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const navigateToHome = () => { setSelectedProduct(null); setCurrentView('catalog'); window.scrollTo(0, 0); };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const renderContent = () => {
    if (loadError && productsState.length === 0) return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-stone-100 max-w-md">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4 serif">Connection Error</h2>
          <p className="text-slate-500 mb-8">{loadError}</p>
          <button onClick={() => { setLoadError(null); loadData(); }} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold">Try Re-sync</button>
        </div>
      </div>
    );

    if (currentView === 'admin_login') return <AdminLogin onBack={navigateToHome} />;
    if (currentView === 'admin_dashboard') return (
      <AdminDashboard 
        products={productsState} orders={orders} coupons={coupons} promotions={promotions} settings={settings}
        onUpdateProduct={async p => { await db.products.upsert(p); await loadData(true); }}
        onAddProduct={async p => { await db.products.upsert(p); await loadData(true); }}
        onDeleteProduct={async id => { await db.products.delete(id); await loadData(true); }}
        onUpdateOrderStatus={async (id, s) => { await db.orders.updateStatus(id, s); await loadData(true); }}
        onUpdateSettings={async s => { await db.settings.update(s); setSettings(s); }}
        onAddCoupon={async c => { await db.coupons.create(c); await loadData(true); }}
        onDeleteCoupon={async id => { await db.coupons.delete(id); await loadData(true); }}
        onToggleCoupon={async (id, active) => { await db.coupons.toggleActive(id, active); await loadData(true); }}
        onRefreshData={() => loadData(true)}
        onLogout={handleLogout}
      />
    );

    if (currentView === 'wishlist') return <Wishlist products={productsState} wishlist={wishlist} onToggleWishlist={toggleWishlist} onAddToCart={handleAddToCart} onBack={navigateToHome} />;
    if (currentView === 'track-order') return <OrderTracking orders={orders} onBack={navigateToHome} />;
    if (currentView === 'returns') return <PolicyPages.Returns onBack={navigateToHome} />;
    if (currentView === 'delivery') return <PolicyPages.Delivery onBack={navigateToHome} />;
    if (currentView === 'contact') return <PolicyPages.Contact onBack={navigateToHome} />;
    if (currentView === 'success' && lastOrder) return <OrderSuccess order={lastOrder} onContinue={navigateToHome} />;
    if (currentView === 'checkout') return <Checkout items={cartItems} coupons={coupons} settings={settings} onBack={() => setCurrentView(selectedProduct ? 'detail' : 'catalog')} onPlaceOrder={async d => { await db.orders.create(d, cartItems); setLastOrder(d); setCartItems([]); setCurrentView('success'); loadData(true); }} />;

    if (selectedProduct) return (
      <ProductDetail 
        product={productsState.find(p => p.id === selectedProduct.id) || selectedProduct} 
        onBack={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} 
        onBuyNow={p => { handleAddToCart(p); setCurrentView('checkout'); }} 
        isWishlisted={wishlist.includes(selectedProduct.id)} 
        onToggleWishlist={() => toggleWishlist(selectedProduct.id)}
      />
    );

    return (
      <div className="animate-in fade-in duration-1000">
        <Hero />
        <CategoryShowcase onCategoryClick={n => { setActiveCategory(n); document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' }); }} />
        <section id="featured-products" className="py-24 bg-[#FAF9F6] scroll-mt-16 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div>
                <h2 className="text-5xl font-bold text-slate-800 serif">Our Creations</h2>
              </div>
              <div className="flex gap-4">
                <select value={sortOrder} onChange={e => setSortOrder(e.target.value as SortOption)} className="px-6 py-3 rounded-full border border-stone-200 outline-none font-bold text-xs bg-white shadow-sm">
                  <option value="newest">Sort: Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
            {loading && productsState.length === 0 ? <SkeletonGrid /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {sortedProducts.map(p => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    onAddToCart={handleAddToCart} 
                    onViewProduct={setSelectedProduct} 
                    isWishlisted={wishlist.includes(p.id)} 
                    onToggleWishlist={() => toggleWishlist(p.id)} 
                  />
                ))}
              </div>
            )}
            {!loading && sortedProducts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-stone-50">
                <p className="text-slate-400 italic">No products found in this category.</p>
              </div>
            )}
          </div>
        </section>
        <PromoBanners items={promotions} />
        <div id="ai-finder" className="scroll-mt-16"><GiftFinder /></div>
        <Testimonials testimonials={testimonials} />
      </div>
    );
  };

  const isMgmt = currentView === 'admin_dashboard' || currentView === 'admin_login';

  return (
    <div className="min-h-screen bg-[#FCFBF7] selection:bg-[#D4AF37]/30">
      <AnimatePresence>{showSplash && <Loader key="loader" />}</AnimatePresence>
      {!isMgmt && <Navbar cartCount={cartCount} cartTotal={cartTotal} wishlistCount={wishlist.length} onCartClick={() => setIsCartOpen(true)} onWishlistClick={() => setCurrentView('wishlist')} onHomeClick={navigateToHome} products={productsState} onAddToCart={handleAddToCart} onViewProduct={p => { setSelectedProduct(p); setCurrentView('catalog'); }} />}
      <main className={!isMgmt ? "pt-16" : ""}>{renderContent()}</main>
      {!isMgmt && (
        <footer id="footer" className="bg-[#1C1917] text-stone-300 py-24">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-4 mb-6">
                <Logo className="w-14 h-14" />
                <span className="text-3xl font-bold text-white serif">SS Creations</span>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed mb-8 max-w-xs">
                Handcrafting magic in every gift. We create unique treasures that speak the language of the heart.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-[#D4AF37] hover:text-white transition-all"><Facebook className="w-4 h-4" /></a>
                <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-[#D4AF37] hover:text-white transition-all"><Instagram className="w-4 h-4" /></a>
                <a href="https://wa.me/9470596039" className="p-3 bg-white/5 rounded-full hover:bg-emerald-500 hover:text-white transition-all"><MessageCircle className="w-4 h-4" /></a>
              </div>
            </div>
            
            <div>
              <h5 className="text-[#D4AF37] font-bold mb-8 uppercase text-[10px] tracking-widest">Studio Info</h5>
              <ul className="space-y-4 text-sm">
                <li><button onClick={() => setCurrentView('track-order')} className="hover:text-white transition-colors">Track Order</button></li>
                <li><button onClick={() => setCurrentView('contact')} className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button onClick={() => setCurrentView('returns')} className="hover:text-white transition-colors">Return Policy</button></li>
                <li><button onClick={() => setCurrentView('delivery')} className="hover:text-white transition-colors">Delivery Info</button></li>
              </ul>
            </div>

            <div>
              <h5 className="text-[#D4AF37] font-bold mb-8 uppercase text-[10px] tracking-widest">Connect</h5>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-[#D4AF37] mt-1" /><span className="text-stone-400">123 Artisan Lane, Colombo 07, Sri Lanka</span></li>
                <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-[#D4AF37]" /><span className="text-stone-400">+94 70 596 039</span></li>
                <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-[#D4AF37]" /><span className="text-stone-400">hello@sscreations.com</span></li>
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <h5 className="text-[#D4AF37] font-bold mb-8 uppercase text-[10px] tracking-widest self-center md:self-end">Handmade Pride</h5>
              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-center w-full">
                <Heart className="w-8 h-8 text-rose-400 mx-auto mb-4" />
                <p className="text-[10px] text-stone-300 uppercase tracking-[0.3em] leading-relaxed font-bold">
                  Made with Love <br/><span className="text-[#D4AF37]">In Sri Lanka</span>
                </p>
              </div>
              <button onClick={() => setCurrentView('admin_login')} className="mt-8 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest hover:text-[#D4AF37] transition-all">Management Portal</button>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-[10px] text-stone-600 uppercase tracking-widest">© {new Date().getFullYear()} SS Creations Boutique. All Rights Reserved.</p>
              <p className="text-[9px] text-stone-700 uppercase tracking-[0.4em] font-medium">Developed by <span className="text-[#D4AF37] font-bold">Yohan</span></p>
            </div>
            <div className="flex gap-6 text-[10px] text-stone-600 uppercase tracking-widest">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
            </div>
          </div>
        </footer>
      )}
      {!isMgmt && <><CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={(id, d) => setCartItems(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} onRemove={id => setCartItems(prev => prev.filter(i => i.id !== id))} onCheckout={() => { setIsCartOpen(false); setCurrentView('checkout'); }} /><WhatsAppButton /></>}
    </div>
  );
};

export default App;
