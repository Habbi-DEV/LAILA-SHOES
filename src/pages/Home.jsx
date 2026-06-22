import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setProducts([]); setLoading(false); });
  }, []);

  const featured = products.filter(p => p.featured).slice(0, 4);
  const bestSellers = products.filter(p => p.best_seller).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <div className="absolute inset-0"><div className="absolute top-20 right-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" /><div className="absolute bottom-20 left-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" /></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img src="/icon-luxury.png" alt="LAILA SHOES" className="w-14 h-14 rounded-full shadow-lg" />
                <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium"><Sparkles size={14} />Nouvelle Collection 2025</div>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight" style={{ fontFamily: 'serif' }}>L'Élégance<span className="block text-rose-700">à vos Pieds</span></h1>
              <p className="mt-6 text-gray-600 text-lg max-w-md leading-relaxed">Découvrez notre collection exclusive de sacs et sandales. Style, confort et qualité à prix abordables.</p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link to="/shop" className="inline-flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white px-8 py-4 rounded-xl font-medium tracking-wider transition-all hover:shadow-lg">DÉCOUVRIR <ArrowRight size={18} /></Link>
                <Link to="/shop?category=sandales" className="inline-flex items-center gap-2 border-2 border-rose-700 text-rose-700 hover:bg-rose-700 hover:text-white px-8 py-4 rounded-xl font-medium tracking-wider transition-all">SANDALES</Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-b from-rose-100 to-rose-200 shadow-2xl shadow-rose-200">
                <img src="https://images.pexels.com/photos/9357344/pexels-photo-9357344.jpeg?auto=compress&cs=tinysrgb&w=800" alt="LAILA SHOES" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center"><ShoppingBag className="text-rose-700" size={24} /></div>
                <div><p className="text-sm font-semibold text-gray-900">Livraison</p><p className="text-xs text-gray-500">Partout en Algérie</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12"><h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>Nos Catégories</h2><p className="mt-3 text-gray-500">Trouvez votre style parfait</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/shop?category=sacs" className="group relative overflow-hidden rounded-2xl aspect-[16/9]"><img src="https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Sacs" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /><div className="absolute bottom-6 left-6"><h3 className="text-white text-2xl font-bold" style={{ fontFamily: 'serif' }}>Sacs</h3><p className="text-white/70 text-sm mt-1">Les sacs à main élégants</p></div></Link>
            <Link to="/shop?category=sandales" className="group relative overflow-hidden rounded-2xl aspect-[16/9]"><img src="https://images.pexels.com/photos/2934063/pexels-photo-2934063.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Sandales" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /><div className="absolute bottom-6 left-6"><h3 className="text-white text-2xl font-bold" style={{ fontFamily: 'serif' }}>Sandales</h3><p className="text-white/70 text-sm mt-1">Confort et style</p></div></Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="py-16 md:py-24 bg-rose-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-12"><div><h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>Nouveautés</h2><p className="mt-2 text-gray-500">Les dernières arrivées</p></div><Link to="/shop" className="hidden sm:flex items-center gap-2 text-rose-700 font-medium">Voir tout <ArrowRight size={16} /></Link></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{featured.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-12"><div><div className="inline-flex items-center gap-2 text-amber-600 mb-2"><TrendingUp size={18} /><span className="text-sm font-medium tracking-wider">POPULAIRE</span></div><h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>Meilleures Ventes</h2></div><Link to="/shop" className="hidden sm:flex items-center gap-2 text-rose-700 font-medium">Voir tout <ArrowRight size={16} /></Link></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{bestSellers.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 md:py-24 bg-rose-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center"><div className="w-16 h-16 bg-rose-800 rounded-2xl flex items-center justify-center mx-auto mb-4"><ShoppingBag size={28} /></div><h3 className="text-lg font-semibold mb-2">Paiement à la livraison</h3><p className="text-rose-300 text-sm">Payez uniquement à la réception</p></div>
            <div className="text-center"><div className="w-16 h-16 bg-rose-800 rounded-2xl flex items-center justify-center mx-auto mb-4"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg></div><h3 className="text-lg font-semibold mb-2">Livraison rapide</h3><p className="text-rose-300 text-sm">Partout en Algérie en 3-5 jours</p></div>
            <div className="text-center"><div className="w-16 h-16 bg-rose-800 rounded-2xl flex items-center justify-center mx-auto mb-4"><Sparkles size={28} /></div><h3 className="text-lg font-semibold mb-2">Qualité garantie</h3><p className="text-rose-300 text-sm">Produits sélectionnés avec soin</p></div>
          </div>
        </div>
      </section>
    </div>
  );
}
