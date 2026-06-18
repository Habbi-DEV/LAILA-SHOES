import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, ShoppingBag, Package, AlertTriangle, LogOut, Menu, X, Home } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import supabase from '../lib/supabase';

const navItems = [
  { to: '/admin', icon: BarChart3, label: 'Tableau de bord', end: true },
  { to: '/admin/products', icon: Package, label: 'Produits' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Commandes' },
  { to: '/admin/inventory', icon: AlertTriangle, label: 'Stock' },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
      isActive ? 'bg-rose-700 text-white' : 'text-gray-600 hover:bg-rose-50 hover:text-rose-700'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-100 min-h-screen">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src="/icon-luxury.png" alt="LAILA SHOES" className="w-10 h-10 rounded-full shadow-sm" />
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold tracking-[0.2em] text-rose-900" style={{ fontFamily: 'serif' }}>LAILA</span>
              <span className="text-[10px] tracking-[0.4em] text-rose-600 -mt-0.5">SHOES ADMIN</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-2">
          <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-rose-50 hover:text-rose-700 transition-colors">
            <Home size={18} />
            Voir le magasin
          </a>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 h-16 flex items-center justify-between">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold tracking-[0.2em] text-rose-900" style={{ fontFamily: 'serif' }}>LAILA</span>
          <span className="text-[8px] tracking-[0.3em] text-rose-600 -mt-0.5">ADMIN</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img src="/icon-luxury.png" alt="LAILA SHOES" className="w-10 h-10 rounded-full shadow-sm" />
                <div className="flex flex-col items-start">
                  <span className="text-2xl font-bold tracking-[0.2em] text-rose-900" style={{ fontFamily: 'serif' }}>LAILA</span>
                  <span className="text-[10px] tracking-[0.4em] text-rose-600 -mt-0.5">SHOES ADMIN</span>
                </div>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map(item => (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setMobileOpen(false)}>
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-gray-100 space-y-2">
              <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-rose-50 hover:text-rose-700 transition-colors">
                <Home size={18} /> Voir le magasin
              </a>
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
                <LogOut size={18} /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:pt-0 pt-16">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}