import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Package } from 'lucide-react';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0);
  const outOfStock = products.filter(p => p.stock === 0);
  const inStock = products.filter(p => p.stock > 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion du stock</h1>
        {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Gestion du stock</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-700">{inStock.length}</p>
              <p className="text-sm text-green-600">En stock</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-amber-700">{lowStock.length}</p>
              <p className="text-sm text-amber-600">Stock faible</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-700">{outOfStock.length}</p>
              <p className="text-sm text-red-600">Rupture</p>
            </div>
          </div>
        </div>
      </div>

      {/* Out of Stock */}
      {outOfStock.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
          <h2 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
            <Package size={20} /> Produits en rupture
          </h2>
          <div className="space-y-3">
            {outOfStock.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-rose-50">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.categories?.name}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold">Rupture</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
          <h2 className="text-lg font-semibold text-amber-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={20} /> Stock faible (≤ 5)
          </h2>
          <div className="space-y-3">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-rose-50">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.categories?.name}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">{p.stock} restants</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Stock List */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tous les produits</h2>
        <div className="space-y-2">
          {products.sort((a, b) => a.stock - b.stock).map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-rose-50">
                  {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.categories?.name} • {parseInt(p.price).toLocaleString()} DA</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${p.stock === 0 ? 'bg-red-500' : p.stock <= 5 ? 'bg-amber-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }}
                  />
                </div>
                <span className={`text-sm font-bold min-w-[3rem] text-right ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-amber-600' : 'text-gray-900'}`}>
                  {p.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}