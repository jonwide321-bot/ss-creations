import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import GiftFinder from './components/GiftFinder';
import CartDrawer from './components/CartDrawer';
import CategoryShowcase from './components/CategoryShowcase';
import PromoBanners from './components/PromoBanners';
import Checkout from './components/Checkout';
import OrderSuccess from './components/OrderSuccess';
import WhatsAppButton from './components/WhatsAppButton';
import Wishlist from './components/Wishlist';
import Loader from './components/Loader';
import { SkeletonGrid } from './components/ProductSkeleton';
import Logo from './components/Logo';
import { testimonials } from './data';
import { Product, CartItem, OrderDetails, StoreSettings, Coupon, Promotion } from './types';
import { Filter, Heart, AlertCircle, Facebook, Instagram, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { supabase, db } from './lib/supabase';

// PERFORMANCE: Code Splitting for non-critical features
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const AdminLogin = lazy(() => import('./components/Admin/AdminLogin'));
const OrderTracking = lazy(() => import('./components/OrderTracking'));
const PolicyPages = lazy(() => import('./components/PolicyPages'));
const Testimonials = lazy(() => import('./components/Testimonials'));

type View = 'catalog' | 'detail' | 'checkout' | 'success' | 'admin_login' | 'admin_dashboard' | 'track-order' | 'returns' | 'delivery' | 'contact' | 'wishlist';
type SortOption = 'newest' | 'price-low' | 'price-high';
export type ThemeMode = 'light' | 'dark' | 'system';

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

  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('ss_theme') as ThemeMode) || 'system');

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };
    applyTheme();
    localStorage.setItem('ss_theme', theme);
  }, [theme]);

  const visitorId = useMemo(() => {
    let id = localStorage.getItem('ss_visitor_id');
    if (!id) {
      id = 'v-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('ss_visitor_id', id);
    }
    return id;
  }, []);

  const loadData = useCallback(async (isSilent = false, forceRefresh = false) => {
    if (!isSilent) setLoading(true);
    try {
      const results = await Promise.allSettled([
        db.products.getAll(),
        db.settings.get(),
        db.orders.getAll(forceRefresh),
        db.coupons.getAll(),
        db.wishlist.get(visitorId),
        db.promotions.getAll()
      ]);
      const [p, s, o, c, w, pr] = results.map(r => r.status === 'fulfilled' ? r.value : null);
      if (p) setProductsState(p);
      if (s) setSettings(s);
      if (o) setOrders(o);
      if (c) setCoupons(c);
      if (w) setWishlist(w);
      if (pr) setPromotions(pr);
      setLoadError(null);
    } catch (err: any) {
      if (!isSilent) setLoadError("Connection error. Retrying...");
    } finally {
      setLoading(false);
    }
  }, [visitorId]);

  useEffect(() => {
    const init = async () => {
      const dataPromise = loadData();
      const splashTimeout = new Promise(resolve => setTimeout(resolve, 800));
      await Promise.all([dataPromise, splashTimeout]);
      setShowSplash(false);
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdminLoggedIn(!!session);
      if (event === 'SIGNED_IN') {
        setCurrentView('admin_dashboard');
        loadData(true, true); // Force refresh when entering admin
      }
    });
    return () => { subscription.unsubscribe(); };
  }, [loadData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('catalog');
    setIsAdminLoggedIn(false);
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

  const renderContent = () => {
    if (loadError && productsState.length === 0) return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-[#1C1917] p-12 rounded-[3rem] shadow-xl max-w-md">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4 serif">Connection Error</h2>
          <button onClick={() => { setLoadError(null); loadData(); }} className="px-8 py-4 bg-slate-900 dark:bg-gold text-white dark:text-slate-900 rounded-2xl font-bold">Try Re-sync</button>
        </div>
      </div>
    );

    if (currentView === 'admin_login') return <Suspense fallback={<Loader />}><AdminLogin onBack={navigateToHome} /></Suspense>;
    if (currentView === 'admin_dashboard') return <Suspense fallback={<Loader />}><AdminDashboard products={productsState} orders={orders} coupons={coupons} promotions={promotions} settings={settings} onUpdateProduct={async p => { await db.products.upsert(p); loadData(true); }} onAddProduct={async p => { await db.products.upsert(p); loadData(true); }} onDeleteProduct={async id => { await db.products.delete(id); loadData(true); }} onUpdateOrderStatus={async (id, s) => { await db.orders.updateStatus(id, s); loadData(true); }} onUpdateSettings={async s => { await db.settings.update(s); setSettings(s); }} onAddCoupon={async c => { await db.coupons.create(c); loadData(true); }} onDeleteCoupon={async id => { await db.coupons.delete(id); loadData(true); }} onToggleCoupon={async (id, active) => { await db.coupons.toggleActive(id, active); loadData(true); }} onRefreshData={() => loadData(true, true)} onLogout={handleLogout} /></Suspense>;
    if (currentView === 'wishlist') return <Wishlist products={productsState} wishlist={wishlist} onToggleWishlist={toggleWishlist} onAddToCart={handleAddToCart} onBack={navigateToHome} />;
    if (currentView === 'track-order') return <Suspense fallback={<Loader />}><OrderTracking orders={orders} onBack={navigateToHome} /></Suspense>;
    if (currentView === 'returns') return <Suspense fallback={<Loader />}><PolicyPages.Returns onBack={navigateToHome} /></Suspense>;
    if (currentView === 'delivery') return <Suspense fallback={<Loader />}><PolicyPages.Delivery onBack={navigateToHome} /></Suspense>;
    if (currentView === 'contact') return <Suspense fallback={<Loader />}><PolicyPages.Contact onBack={navigateToHome} /></Suspense>;
    if (currentView === 'success' && lastOrder) return <OrderSuccess order={lastOrder} onContinue={navigateToHome} />;
    if (currentView === 'checkout') return <Checkout items={cartItems} coupons={coupons} settings={settings} onBack={() => setCurrentView(selectedProduct ? 'detail' : 'catalog')} onPlaceOrder={async d => { await db.orders.create(d, cartItems); setLastOrder(d); setCartItems([]); setCurrentView('success'); loadData(true, true); }} />;

    if (selectedProduct) return <ProductDetail product={productsState.find(p => p.id === selectedProduct.id) || selectedProduct} onBack={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} onBuyNow={p => { handleAddToCart(p); setCurrentView('checkout'); }} isWishlisted={wishlist.includes(selectedProduct.id)} onToggleWishlist={() => toggleWishlist(selectedProduct.id)} />;

    return (
      <div className="animate-in fade-in duration-700">
        <Hero />
        <CategoryShowcase onCategoryClick={n => { setActiveCategory(n); document.getElementById('featured-products')?.scrollIntoView({ behavior: 'smooth' }); }} />
        <section id="featured-products" className="py-24 bg-[#FAF9F6] dark:bg-[#121110] scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-5xl font-bold text-slate-800 dark:text-stone-200 serif mb-16">Our Creations</h2>
            {loading && productsState.length === 0 ? <SkeletonGrid /> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {sortedProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} onViewProduct={setSelectedProduct} isWishlisted={wishlist.includes(p.id)} onToggleWishlist={() => toggleWishlist(p.id)} />)}
              </div>
            )}
          </div>
        </section>
        <PromoBanners items={promotions} />
        <div id="ai-finder" className="scroll-mt-16"><GiftFinder /></div>
        <Suspense fallback={<SkeletonGrid />}>
           <Testimonials testimonials={testimonials} />
        </Suspense>
      </div>
    );
  };

  const isMgmt = currentView === 'admin_dashboard' || currentView === 'admin_login';

  return (
    <div className="min-h-screen bg-[#FCFBF7] dark:bg-[#0F0E0D]">
      <AnimatePresence>{showSplash && <Loader key="loader" />}</AnimatePresence>
      {!isMgmt && <Navbar cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)} cartTotal={cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)} wishlistCount={wishlist.length} onCartClick={() => setIsCartOpen(true)} onWishlistClick={() => setCurrentView('wishlist')} onHomeClick={navigateToHome} products={productsState} onAddToCart={handleAddToCart} onViewProduct={p => { setSelectedProduct(p); setCurrentView('catalog'); }} theme={theme} onThemeChange={setTheme} />}
      <main className={!isMgmt ? "pt-16" : ""}>{renderContent()}</main>
      {!isMgmt && (
        <footer id="footer" className="bg-[#1C1917] text-white py-24 pb-32 md:pb-24" aria-labelledby="footer-heading">
          <h2 id="footer-heading" className="sr-only">Footer</h2>
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16">
            <div className="col-span-1">
              <div className="flex items-center gap-4 mb-6">
                <Logo className="w-14 h-14" />
                <span className="text-3xl font-bold text-white serif">SS Creations</span>
              </div>
              <p className="text-stone-100 text-sm leading-relaxed mb-8 max-w-xs">
                Handcrafting magic in every gift. We create unique treasures that speak the language of the heart.
              </p>
              <nav className="flex gap-4">
                <a href="#" aria-label="Follow SS Creations on Facebook" className="w-12 h-12 bg-white/10 rounded-full hover:bg-gold hover:text-white transition-all flex items-center justify-center"><Facebook className="w-5 h-5" /></a>
                <a href="#" aria-label="Follow SS Creations on Instagram" className="w-12 h-12 bg-white/10 rounded-full hover:bg-gold hover:text-white transition-all flex items-center justify-center"><Instagram className="w-5 h-5" /></a>
                <a href="https://wa.me/9470596039" aria-label="Chat with SS Creations on WhatsApp" className="w-12 h-12 bg-white/10 rounded-full hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center"><MessageCircle className="w-5 h-5" /></a>
              </nav>
            </div>
            
            <nav aria-label="Support Links">
              <h3 className="text-gold font-bold mb-8 uppercase text-[10px] tracking-widest">Studio Info</h3>
              <ul className="space-y-4 text-sm">
                <li><button onClick={() => setCurrentView('track-order')} className="hover:text-gold transition-colors text-left py-2 px-1 min-h-[44px]">Track Order</button></li>
                <li><button onClick={() => setCurrentView('contact')} className="hover:text-gold transition-colors text-left py-2 px-1 min-h-[44px]">Contact Us</button></li>
                <li><button onClick={() => setCurrentView('returns')} className="hover:text-gold transition-colors text-left py-2 px-1 min-h-[44px]">Return Policy</button></li>
                <li><button onClick={() => setCurrentView('delivery')} className="hover:text-gold transition-colors text-left py-2 px-1 min-h-[44px]">Delivery Info</button></li>
              </ul>
            </nav>

            <div>
              <h3 className="text-gold font-bold mb-8 uppercase text-[10px] tracking-widest">Connect</h3>
              <address className="space-y-4 text-sm not-italic">
                <div className="flex items-start gap-3 py-1"><MapPin className="w-5 h-5 text-gold mt-1 flex-shrink-0" aria-hidden="true" /><span className="text-stone-100">123 Artisan Lane, Colombo 07, Sri Lanka</span></div>
                <div className="flex items-center gap-3 py-1"><Phone className="w-5 h-5 text-gold flex-shrink-0" aria-hidden="true" /><span className="text-stone-100">+94 70 596 039</span></div>
                <div className="flex items-center gap-3 py-1"><Mail className="w-5 h-5 text-gold flex-shrink-0" aria-hidden="true" /><span className="text-stone-100">hello@sscreations.com</span></div>
              </address>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <h3 className="text-gold font-bold mb-8 uppercase text-[10px] tracking-widest self-center md:self-end">Handmade Pride</h3>
              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 text-center w-full">
                <Heart className="w-8 h-8 text-rose-400 mx-auto mb-4" aria-hidden="true" />
                <p className="text-[10px] text-stone-100 uppercase tracking-[0.3em] leading-relaxed font-bold">
                  Made with Love <br/><span className="text-gold">In Sri Lanka</span>
                </p>
              </div>
              <button onClick={() => setCurrentView('admin_login')} className="mt-8 px-8 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:text-gold transition-all min-h-[48px]" aria-label="Login to Management Portal">Management Portal</button>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-[10px] text-stone-100 uppercase tracking-widest">© {new Date().getFullYear()} SS Creations Boutique. All Rights Reserved.</p>
              <p className="text-[9px] text-stone-200 uppercase tracking-[0.4em] font-medium">Developed by <span className="text-gold font-bold">Yohan</span></p>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 md:gap-8 text-[10px] text-stone-100 uppercase tracking-widest font-bold" aria-label="Policy Links">
              <a href="#" className="hover:text-white transition-colors py-2 min-h-[44px] flex items-center" aria-label="Read our Privacy Policy">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors py-2 min-h-[44px] flex items-center" aria-label="Read our Terms of Service">Terms of Service</a>
            </nav>
          </div>
        </footer>
      )}
      {!isMgmt && <><CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={(id, d) => setCartItems(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} onRemove={id => setCartItems(prev => prev.filter(i => i.id !== id))} onCheckout={() => { setIsCartOpen(false); setCurrentView('checkout'); }} /><WhatsAppButton /></>}
    </div>
  );
};

export default App;