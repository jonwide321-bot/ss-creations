
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Product, CartItem, OrderDetails, OrderStatus, StoreSettings, Coupon } from './types';
import { Settings, Filter, AlertCircle, Heart } from 'lucide-react';
import { supabase, db } from './lib/supabase';
import { formatPrice } from './lib/utils';

type View = 'catalog' | 'detail' | 'checkout' | 'success' | 'admin_login' | 'admin_dashboard' | 'track-order' | 'returns' | 'delivery' | 'contact' | 'wishlist';
type SortOption = 'newest' | 'price-low' | 'price-high';

const App: React.FC = () => {
  const [productsState, setProductsState] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({ baseShippingFee: 500.00 });
  
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [fetchedProducts, fetchedSettings, fetchedOrders, fetchedCoupons, fetchedWishlist] = await Promise.all([
        db.products.getAll(),
        db.settings.get(),
        db.orders.getAll(),
        db.coupons.getAll(),
        db.wishlist.get(visitorId)
      ]);
      
      setProductsState(fetchedProducts);
      setSettings(fetchedSettings);
      setOrders(fetchedOrders);
      setCoupons(fetchedCoupons);
      setWishlist(fetchedWishlist);
      setError(null);
    } catch (err) {
      console.error("Data fetch error:", err);
      setError("Unable to connect to the store database.");
    } finally {
      if (!isSilent) {
        setLoading(false);
        if (isInitialMount) {
          setTimeout(() => {
            setShowSplash(false);
            setIsInitialMount(false);
          }, 5500);
        }
      }
    }
  };

  useEffect(() => {
    loadData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const loggedIn = !!session;
      setIsAdminLoggedIn(loggedIn);
      if (event === 'SIGNED_IN') setCurrentView('admin_dashboard');
      else if (event === 'SIGNED_OUT') setCurrentView('catalog');
    });
    return () => subscription.unsubscribe();
  }, []);

  const sortedProducts = useMemo(() => {
    let filtered = activeCategory === 'All' 
      ? productsState 
      : productsState.filter(p => p.category === activeCategory);
    switch (sortOrder) {
      case 'price-low': return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-high': return [...filtered].sort((a, b) => b.price - a.price);
      default: return filtered;
    }
  }, [productsState, activeCategory, sortOrder]);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
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

  const navigateToHome = () => {
    setSelectedProduct(null);
    setCurrentView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (error && currentView === 'catalog') {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Store Offline</h2>
          <p className="text-slate-500 text-center mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold">Try Again</button>
        </div>
      );
    }

    if (currentView === 'admin_login') return <AdminLogin onBack={navigateToHome} />;
    if (currentView === 'admin_dashboard') return <AdminDashboard products={productsState} orders={orders} coupons={coupons} settings={settings} onUpdateProduct={async (p) => { await db.products.upsert(p); await loadData(true); }} onAddProduct={async (p) => { await db.products.upsert(p); await loadData(true); }} onDeleteProduct={async (id) => { await db.products.delete(id); await loadData(true); }} onUpdateOrderStatus={async (id, s) => { await db.orders.updateStatus(id, s); await loadData(true); }} onUpdateSettings={async (s) => { await db.settings.update(s); setSettings(s); }} onAddCoupon={async (c) => { await db.coupons.create(c); await loadData(true); }} onDeleteCoupon={async (id) => { await db.coupons.delete(id); await loadData(true); }} onToggleCoupon={async (id, active) => { await db.coupons.toggleActive(id, active); await loadData(true); }} />;
    if (currentView === 'wishlist') return <Wishlist products={productsState} wishlist={wishlist} onToggleWishlist={toggleWishlist} onAddToCart={handleAddToCart} onBack={navigateToHome} />;
    if (currentView === 'track-order') return <OrderTracking orders={orders} onBack={navigateToHome} />;
    if (currentView === 'returns') return <PolicyPages.Returns onBack={navigateToHome} />;
    if (currentView === 'delivery') return <PolicyPages.Delivery onBack={navigateToHome} />;
    if (currentView === 'contact') return <PolicyPages.Contact onBack={navigateToHome} />;
    if (currentView === 'success' && lastOrder) return <OrderSuccess order={lastOrder} onContinue={navigateToHome} />;
    if (currentView === 'checkout') return <Checkout items={cartItems} coupons={coupons} settings={settings} onBack={() => setCurrentView(selectedProduct ? 'detail' : 'catalog')} onPlaceOrder={async (d) => { await db.orders.create(d, cartItems); setLastOrder(d); setCartItems([]); setCurrentView('success'); loadData(true); }} />;

    if (selectedProduct) return <ProductDetail product={productsState.find(p => p.id === selectedProduct.id) || selectedProduct} onBack={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} onBuyNow={(p) => { handleAddToCart(p); setCurrentView('checkout'); }} isWishlisted={wishlist.includes(selectedProduct.id)} onToggleWishlist={() => toggleWishlist(selectedProduct.id)} />;

    return (
      <div className="animate-in fade-in duration-1000">
        <Hero />
        
        {/* Artistic Watermark Section Background */}
        <div className="relative">
          <div className="absolute top-20 right-0 pointer-events-none opacity-[0.03] select-none hidden lg:block">
            <span className="text-[20rem] font-bold cinzel leading-none rotate-90 origin-right">SIGNATURE</span>
          </div>
          
          <CategoryShowcase onCategoryClick={(name) => setActiveCategory(name)} />
          
          <motion.section 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            id="featured-products" 
            className="py-24 bg-[#FAF9F6] scroll-mt-16 relative overflow-hidden"
          >
            {/* Soft decorative background elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-200/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                <div>
                  <div className="flex items-center gap-3 text-[#D4AF37] mb-4">
                    <div className="h-[1px] w-8 bg-[#D4AF37]" />
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Curated Treasures</span>
                  </div>
                  <h2 className="text-5xl md:text-6xl font-bold text-slate-800 serif mb-4">Our Creations</h2>
                  <p className="text-[#705E52] max-w-lg leading-relaxed text-lg">Hand-finished details, heart-poured craftsmanship.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border border-stone-200 shadow-sm">
                    <Filter className="w-4 h-4 text-[#D4AF37]" />
                    <select 
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as SortOption)}
                      className="bg-transparent text-sm font-bold text-slate-600 outline-none cursor-pointer"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="price-low">Sort: Low to High</option>
                      <option value="price-high">Sort: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {loading ? (
                <SkeletonGrid />
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[3rem] border border-stone-100 shadow-sm">
                  <p className="text-slate-400 font-medium italic text-xl">The workshop is quiet for now. Check back soon.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                  {sortedProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={handleAddToCart} 
                      onViewProduct={setSelectedProduct}
                      isWishlisted={wishlist.includes(product.id)}
                      onToggleWishlist={() => toggleWishlist(product.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.section>
        </div>

        <PromoBanners />
        
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }} 
          id="ai-finder" 
          className="scroll-mt-16"
        >
          <GiftFinder />
        </motion.div>
        
        <Testimonials testimonials={testimonials} />
      </div>
    );
  };

  const isManagementView = currentView === 'admin_dashboard' || currentView === 'admin_login';

  return (
    <div className="min-h-screen bg-[#FCFBF7] font-sans selection:bg-[#D4AF37]/30">
      <AnimatePresence>
        {showSplash && <Loader key="loader" />}
      </AnimatePresence>
      
      {!isManagementView && (
        <Navbar 
          cartCount={cartCount} 
          cartTotal={cartTotal} 
          wishlistCount={wishlist.length}
          onCartClick={() => setIsCartOpen(true)} 
          onWishlistClick={() => setCurrentView('wishlist')}
          onHomeClick={navigateToHome} 
          products={productsState} 
          onAddToCart={handleAddToCart} 
          onViewProduct={(p) => { setSelectedProduct(p); setCurrentView('catalog'); }} 
        />
      )}
      
      <main className={!isManagementView ? "pt-16" : ""}>{renderContent()}</main>
      
      {!isManagementView && (
        <footer id="footer" className="bg-[#1C1917] text-stone-300 py-24 border-t border-[#D4AF37]/10">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-16 text-sm">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <Logo className="w-14 h-14" />
                <span className="text-3xl font-bold text-white serif tracking-wide">SS Creations</span>
              </div>
              <p className="text-stone-400 mb-8 leading-relaxed max-w-md text-base italic font-light">"Crafting more than just objects; we create vessels for your most precious memories."</p>
              <div className="flex gap-4">
                <button onClick={() => setCurrentView('admin_login')} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all text-xs font-bold uppercase tracking-widest">
                   <Settings className="w-4 h-4" /> Management Portal
                </button>
              </div>
            </div>
            <div>
              <h5 className="text-[#D4AF37] font-bold mb-8 uppercase tracking-[0.3em] text-[10px]">The Boutique</h5>
              <ul className="space-y-5">
                <li><button onClick={() => setCurrentView('track-order')} className="hover:text-[#D4AF37] transition-all text-left font-medium">Order Concierge</button></li>
                <li><button onClick={() => setCurrentView('delivery')} className="hover:text-[#D4AF37] transition-all text-left font-medium">Courier Information</button></li>
                <li><button onClick={() => setCurrentView('returns')} className="hover:text-[#D4AF37] transition-all text-left font-medium">Return Policy</button></li>
                <li><button onClick={() => setCurrentView('contact')} className="hover:text-[#D4AF37] transition-all text-left font-medium">Studio Connection</button></li>
              </ul>
            </div>
            <div>
              <h5 className="text-[#D4AF37] font-bold mb-8 uppercase tracking-[0.3em] text-[10px]">Studio Signature</h5>
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center text-center">
                <Heart className="w-6 h-6 text-rose-400 mb-3" />
                <p className="text-[10px] text-stone-500 uppercase tracking-widest leading-relaxed">Handmade with Love <br/> In Sri Lanka</p>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-20 pt-10 border-t border-white/5 text-center text-[10px] text-stone-600 uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} SS Creations Artisanal Studio. All Rights Reserved.
          </div>
        </footer>
      )}
      {!isManagementView && (
        <>
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onUpdateQuantity={(id, delta) => setCartItems(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + delta)} : i))} onRemove={(id) => setCartItems(prev => prev.filter(i => i.id !== id))} onCheckout={() => { setIsCartOpen(false); setCurrentView('checkout'); }} />
          <WhatsAppButton />
        </>
      )}
    </div>
  );
};

export default App;
