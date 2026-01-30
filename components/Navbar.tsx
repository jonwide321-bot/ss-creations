
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Heart, Search, Menu, X, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import { Product } from '../types';
import { formatPrice } from '../lib/utils';

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
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, cartTotal, wishlistCount, onCartClick, onWishlistClick, onHomeClick, products, onAddToCart, onViewProduct }) => {
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

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl z-50 border-b border-[#D4AF37]/10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 cursor-pointer group flex-shrink-0" onClick={onHomeClick}>
            <Logo className="w-12 h-12 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-2xl font-bold tracking-tight serif text-slate-900 hidden sm:block">SS Creations</span>
          </div>

          <div className="hidden lg:flex items-center gap-10 text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleLinkClick(e, link.href)} className="hover:text-[#D4AF37] transition-all relative group">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D4AF37] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 flex-grow">
            <div className="relative flex-grow max-w-[200px] hidden md:block" ref={searchRef}>
              <div className={`flex items-center bg-[#FCFBF7]/80 border border-stone-200 rounded-full px-5 py-2.5 transition-all duration-500 ${isSearchOpen ? 'ring-2 ring-[#D4AF37]/30 shadow-lg bg-white border-transparent' : ''}`}>
                <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="The Search..."
                  className="bg-transparent text-xs w-full outline-none text-slate-800 placeholder-slate-300 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                />
              </div>
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-3 left-0 right-0 bg-white border border-stone-100 shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 p-2">
                  {searchResults.map(product => (
                    <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-[#FCFBF7] rounded-2xl cursor-pointer transition-colors group" onClick={() => { onViewProduct(product); setIsSearchOpen(false); setSearchQuery(''); }}>
                      <img src={product.image} className="w-10 h-10 object-cover rounded-xl" alt="" />
                      <div className="flex-grow">
                        <p className="text-xs font-bold text-slate-800 line-clamp-1">{product.name}</p>
                        <p className="text-[10px] text-[#D4AF37] font-bold">{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={onWishlistClick} className="p-2.5 text-slate-400 hover:text-rose-400 relative transition-all active:scale-90">
              <Heart className={`w-6 h-6 ${wishlistCount > 0 ? 'fill-rose-400 text-rose-400' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-2 right-2 bg-rose-400 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button onClick={onCartClick} className="group flex items-center gap-3 bg-[#1C1917] hover:bg-[#D4AF37] text-white pl-4 pr-5 py-3 rounded-full transition-all shadow-xl hover:shadow-[#D4AF37]/30 active:scale-95">
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#D4AF37] ring-2 ring-[#1C1917] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
              </div>
              <span className="text-[10px] font-bold border-l border-white/20 pl-3 hidden sm:block tracking-widest uppercase">{formatPrice(cartTotal)}</span>
            </button>

            <button className="lg:hidden p-2 text-slate-600 hover:text-[#D4AF37]" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-[#1C1917]/60 backdrop-blur-md transition-opacity" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-3/4 max-w-sm bg-[#FCFBF7] border-l border-stone-100 shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col p-8">
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <Logo className="w-12 h-12" />
                <span className="text-2xl font-bold serif text-slate-900">SS Creations</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 hover:bg-stone-100 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} onClick={(e) => handleLinkClick(e, link.href)} className="text-sm font-bold uppercase tracking-[0.3em] text-slate-500 hover:text-[#D4AF37] p-3 rounded-2xl hover:bg-white transition-all shadow-sm border border-transparent hover:border-[#D4AF37]/10">{link.name}</a>
              ))}
              <button onClick={() => { onWishlistClick(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.3em] text-slate-500 hover:text-rose-400 p-3 rounded-2xl hover:bg-white transition-all shadow-sm border border-transparent hover:border-rose-100">
                <Heart className="w-5 h-5" /> Wishlist ({wishlistCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
