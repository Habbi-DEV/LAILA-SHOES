import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;
  const isStore = !location.pathname.startsWith('/admin');

  if (!isStore) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-700">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/icon-luxury.png" alt="LAILA SHOES" className="w-9 h-9 md:w-11 md:h-11 rounded-full shadow-sm" />
            <div className="flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-bold tracking-[0.3em] text-rose-900" style={{ fontFamily: 'serif' }}>LAILA</span>
              <span className="text-[10px] md:text-xs tracking-[0.5em] text-rose-600 -mt-1">SHOES</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm tracking-wider transition-colors ${isActive('/') ? 'text-rose-700 font-semibold' : 'text-gray-600 hover:text-rose-700'}`}>ACCUEIL</Link>
            <Link to="/shop" className={`text-sm tracking-wider transition-colors ${isActive('/shop') ? 'text-rose-700 font-semibold' : 'text-gray-600 hover:text-rose-700'}`}>BOUTIQUE</Link>
            <Link to="/shop?category=sacs" className="text-sm tracking-wider text-gray-600 hover:text-rose-700 transition-colors">SACS</Link>
            <Link to="/shop?category=sandales" className="text-sm tracking-wider text-gray-600 hover:text-rose-700 transition-colors">SANDALES</Link>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/admin" className="p-2 text-gray-600 hover:text-rose-700 transition-colors">
                <User size={20} />
              </Link>
            ) : (
              <Link to="/admin/login" className="p-2 text-gray-600 hover:text-rose-700 transition-colors">
                <User size={20} />
              </Link>
            )}
            <button onClick={() => setIsOpen(true)} className="relative p-2 text-gray-600 hover:text-rose-700 transition-colors">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-rose-100 py-4 px-4">
          <div className="flex flex-col gap-4">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm tracking-wider text-gray-600 hover:text-rose-700">ACCUEIL</Link>
            <Link to="/shop" onClick={() => setMobileOpen(false)} className="text-sm tracking-wider text-gray-600 hover:text-rose-700">BOUTIQUE</Link>
            <Link to="/shop?category=sacs" onClick={() => setMobileOpen(false)} className="text-sm tracking-wider text-gray-600 hover:text-rose-700">SACS</Link>
            <Link to="/shop?category=sandales" onClick={() => setMobileOpen(false)} className="text-sm tracking-wider text-gray-600 hover:text-rose-700">SANDALES</Link>
          </div>
        </div>
      )}
    </nav>
  );
}