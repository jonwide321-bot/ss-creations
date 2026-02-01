import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Heart, Search, Menu, X, ArrowRight, Sun, Moon, Monitor } from 'lucide-react';
import Logo from './Logo';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';
import { ThemeMode } from '../App';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  wishlistCount: number;
  onCartClick: () => void;
  onWishlistClick: () => void;
  onHomeClick: () => void;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, cartTotal, wishlistCount, onCartClick, onWishlistClick, 
  onHomeClick, products, onAddToCart, onViewProduct,
  theme, onThemeChange
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: 'Occasions', href: '#featured-products' },
    { name: 'Personalized', href: '#featured-products' },
    { name: 'Best Sellers', href: '#featured-products' },
    { name: 'Gift Finder AI', href: '#ai-finder' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % modes.length;
    onThemeChange(modes[nextIndex]);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-5 h-5" />;
      case 'dark': return <Moon className="w-5 h-5" />;
      case 'system': return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-[#0F0E0D]/80 backdrop-blur-2xl z-50 border-b border-[#D4AF37]/10 transition-all duration-300 h-20" aria-label="Main Navigation">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-6">
          <button className="flex items-center gap-4 cursor-pointer group flex-shrink-0 min-h-[48px]" onClick={onHomeClick} aria-label="Go to Home Page">
            <Logo className="w-12 h-12 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-2xl font-bold tracking-tight serif text-slate-900 dark:text-stone-200 hidden sm:block group-hover:text-gold transition-colors">SS Creations</span>
          </button>

          <div className="hidden lg:flex items-center gap-10 text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 dark:text-stone-500">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleLinkClick(e, link.href)} className="hover:text-gold dark:hover:text-gold transition-all relative group py-4 px-1">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-gold group-hover:w-full transition-all duration-300" aria-hidden="true" />
              </a>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 flex-grow">
            <div className="relative flex-grow max-w-[200px] hidden md:block" ref={searchRef}>
              <div className={`flex items-center bg-[#FCFBF7] dark:bg-[#1C1917] border border-stone-200 dark:border-white/10 rounded-full px-5 py-2.5 transition-all duration-500 ${isSearchOpen ? 'ring-2 ring-gold/50 shadow-xl bg-white dark:bg-[#1C1917] border-transparent' : 'hover:border-gold/30'}`}>
                <Search className={`w-3.5 h-3.5 mr-2 transition-colors ${isSearchOpen ? 'text-gold' : 'text-slate-400'}`} aria-hidden="true" />
                <input 
                  id="navbar-search"
                  type="text" 
                  autoComplete="off"
                  aria-label="Search items"
                  placeholder="The Search..."
                  className="bg-transparent text-xs w-full outline-none text-slate-800 dark:text-stone-200 placeholder-slate-600 dark:placeholder-stone-400 font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                />
              </div>
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-3 left-0 right-0 bg-white dark:bg-[#1C1917] border border-stone-100 dark:border-white/5 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 p-2">
                  {searchResults.map(product => (
                    <button 
                      key={product.id} 
                      className="flex items-center gap-4 w-full text-left p-4 hover:bg-[#FCFBF7] dark:hover:bg-white/5 rounded-2xl cursor-pointer transition-colors group min-h-[48px]" 
                      onClick={() => { onViewProduct(product); setIsSearchOpen(false); setSearchQuery(''); }}
                      aria-label={`View ${product.name}`}
                    >
                      <img src={`${product.image}&w=80&q=80&fm=webp`} className="w-10 h-10 object-cover rounded-xl" alt="" width="40" height="40" loading="lazy" />
                      <div className="flex-grow">
                        <p className="text-xs font-bold text-slate-800 dark:text-stone-200 line-clamp-1 group-hover:text-gold transition-colors">{product.name}</p>
                        <p className="text-[10px] text-gold font-bold">{formatPrice(product.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button 
              onClick={cycleTheme}
              className="w-11 h-11 flex items-center justify-center text-slate-500 dark:text-stone-400 hover:text-gold hover:bg-gold/10 dark:hover:bg-gold/10 transition-all active:scale-90 bg-stone-50 dark:bg-white/5 rounded-full"
              aria-label={`Cycle Theme. Current: ${theme}`}
              title={`Theme: ${theme}`}
            >
              {getThemeIcon()}
            </button>

            <button onClick={onWishlistClick} aria-label={`Open Wishlist. Currently ${wishlistCount} items`} className="w-11 h-11 flex items-center justify-center text-slate-500 dark:text-stone-400 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 relative transition-all active:scale-90 rounded-full">
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-rose-400 text-rose-400' : ''}`} aria-hidden="true" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-400 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0F0E0D]">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button onClick={onCartClick} aria-label={`Open Cart. Currently ${cartCount} items totaling ${formatPrice(cartTotal)}`} className="group flex items-center gap-3 bg-[#1C1917] dark:bg-gold hover:bg-gold dark:hover:bg-white text-white dark:text-slate-900 pl-4 pr-5 h-11 rounded-full transition-all shadow-xl hover:shadow-gold/30 active:scale-95">
              <div className="relative">
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-gold dark:bg-slate-900 ring-2 ring-[#1C1917] dark:ring-gold text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
              </div>
              <span className="text-[10px] font-bold border-l border-white/20 dark:border-slate-900/20 pl-3 hidden sm:block tracking-widest uppercase">{formatPrice(cartTotal)}</span>
            </button>

            <button className="lg:hidden w-11 h-11 flex items-center justify-center text-slate-600 dark:text-stone-400 hover:text-gold hover:bg-gold/10 rounded-full" aria-label="Open Navigation Menu" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-[#1C1917]/60 dark:bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-[#FCFBF7] dark:bg-[#0F0E0D] border-l border-stone-100 dark:border-white/5 shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col p-8">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <Logo className="w-12 h-12" />
                <span className="text-2xl font-bold serif text-slate-900 dark:text-stone-200">SS Creations</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close Navigation Menu" className="w-12 h-12 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-white/5 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} onClick={(e) => handleLinkClick(e, link.href)} className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-stone-400 hover:text-gold p-4 rounded-2xl hover:bg-white dark:hover:bg-white/5 transition-all shadow-sm border border-transparent hover:border-gold/20 min-h-[48px] flex items-center">{link.name}</a>
              ))}
              <button onClick={() => { onWishlistClick(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-stone-400 hover:text-rose-400 p-4 rounded-2xl hover:bg-white dark:hover:bg-white/5 transition-all shadow-sm border border-transparent hover:border-rose-100 min-h-[48px]">
                <Heart className="w-5 h-5" aria-hidden="true" /> Wishlist ({wishlistCount})
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;