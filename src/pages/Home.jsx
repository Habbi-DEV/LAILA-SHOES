import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setIsOpen } = useCart();

  useEffect(() => {
    fetch('/api/products')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load products');
        return r.json();
      })
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Products fetch error:', err);
        setError(err.message);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const featured = products.filter(p => p.featured).slice(0, 4);
  const bestSellers = products.filter(p => p.best_seller).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-rose-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-amber-200/20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <img src="/icon-luxury.png" alt="LAILA SHOES" className="w-10 h-10 sm:w-14 sm:h-14 rounded-full shadow-lg" />
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-rose-100 text-rose-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                  <Sparkles size={12} />
                  Nouvelle Collection 2025
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'serif' }}>
                L'Élégance
                <span className="block text-rose-700">à vos Pieds</span>
              </h1>
              <p className="mt-4 sm:mt-6 text-gray-600 text-sm sm:text-base md:text-lg max-w-md leading-relaxed">
                Découvrez notre collection exclusive de sacs et sandales. Style, confort et qualité à prix abordables.
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-6 sm:mt-8">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-medium tracking-wider transition-all text-sm sm:text-base"
                >
                  DÉCOUVRIR
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/shop?category=sandales"
                  className="inline-flex items-center gap-2 border-2 border-rose-700 text-rose-700 hover:bg-rose-700 hover:text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-medium tracking-wider transition-all text-sm sm:text-base"
                >
                  SANDALES
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-b from-rose-100 to-rose-200 shadow-2xl shadow-rose-200">
                <img
                  src="https://images.pexels.com/photos/9357344/pexels-photo-9357344.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="LAILA SHOES Collection"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="text-rose-700" size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Livraison</p>
                  <p className="text-xs text-gray-500">Partout en Algérie</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 sm:py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>Nos Catégories</h2>
            <p className="mt-2 sm:mt-3 text-gray-500 text-sm sm:text-base">Trouvez votre style parfait</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Link to="/shop?category=sacs" className="group relative overflow-hidden rounded-xl sm:rounded-2xl aspect-[16/10] sm:aspect-[16/9]">
              <img
                src="https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Sacs"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
                <h3 className="text-white text-xl sm:text-2xl font-bold" style={{ fontFamily: 'serif' }}>Sacs</h3>
                <p className="text-white/70 text-xs sm:text-sm mt-0.5 sm:mt-1">Les sacs à main élégants</p>
              </div>
            </Link>
            <Link to="/shop?category=sandales" className="group relative overflow-hidden rounded-xl sm:rounded-2xl aspect-[16/10] sm:aspect-[16/9]">
              <img
                src="https://images.pexels.com/photos/2934063/pexels-photo-2934063.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Sandales"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
                <h3 className="text-white text-xl sm:text-2xl font-bold" style={{ fontFamily: 'serif' }}>Sandales</h3>
                <p className="text-white/70 text-xs sm:text-sm mt-0.5 sm:mt-1">Confort et style</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-10 sm:py-16 md:py-24 bg-rose-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6 sm:mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>Nouveautés</h2>
                <p className="mt-1 sm:mt-2 text-gray-500 text-sm sm:text-base">Les dernières arrivées</p>
              </div>
              <Link to="/shop" className="hidden sm:flex items-center gap-2 text-rose-700 font-medium hover:gap-3 transition-all text-sm">
                Voir tout <ArrowRight size={16} />
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-rose-100 rounded-xl sm:rounded-2xl" />
                    <div className="mt-2 sm:mt-3 h-3 sm:h-4 bg-rose-100 rounded w-3/4" />
                    <div className="mt-1.5 sm:mt-2 h-3 sm:h-4 bg-rose-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                {featured.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-10 sm:py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6 sm:mb-12">
              <div>
                <div className="inline-flex items-center gap-2 text-amber-600 mb-1 sm:mb-2">
                  <TrendingUp size={16} />
                  <span className="text-xs sm:text-sm font-medium tracking-wider">POPULAIRE</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>Meilleures Ventes</h2>
              </div>
              <Link to="/shop" className="hidden sm:flex items-center gap-2 text-rose-700 font-medium hover:gap-3 transition-all text-sm">
                Voir tout <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Error state */}
      {error && !loading && products.length === 0 && (
        <section className="py-10 bg-rose-50/50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-400 text-base sm:text-lg mb-3">Impossible de charger les produits</p>
            <button onClick={() => window.location.reload()} className="text-rose-600 hover:text-rose-700 font-medium text-sm">Réessayer</button>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-10 sm:py-16 md:py-24 bg-rose-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-800 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <ShoppingBag size={24} className="sm:hidden" />
                <ShoppingBag size={28} className="hidden sm:block" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">Paiement à la livraison</h3>
              <p className="text-rose-300 text-xs sm:text-sm">Payez uniquement à la réception de votre commande</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-800 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">Livraison rapide</h3>
              <p className="text-rose-300 text-xs sm:text-sm">Livraison partout en Algérie en 3-5 jours</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-800 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Sparkles size={24} className="sm:hidden" />
                <Sparkles size={28} className="hidden sm:block" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">Qualité garantie</h3>
              <p className="text-rose-300 text-xs sm:text-sm">Produits sélectionnés avec soin pour votre satisfaction</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
