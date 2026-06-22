import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Package, TrendingDown, Search, RefreshCw, Edit3, Save, X } from 'lucide-react';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, low, out
  const [editingVariant, setEditingVariant] = useState(null);
  const [editStock, setEditStock] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Inventory fetch error:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Calculate stats
  const allVariants = products.flatMap(p => (p.variants || []).map(v => ({ ...v, productName: p.name, productNameAr: p.name_ar, productImage: p.images?.[0], productId: p.id, categorySlug: p.categories?.slug || '' })));
  const totalVariants = allVariants.length;
  const outOfStock = allVariants.filter(v => v.stock === 0);
  const lowStock = allVariants.filter(v => v.stock > 0 && v.stock <= 3);
  const inStock = allVariants.filter(v => v.stock > 3);
  const totalStock = allVariants.reduce((s, v) => s + v.stock, 0);

  // Filter variants
  let filteredVariants = allVariants;
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredVariants = filteredVariants.filter(v => 
      v.productName.toLowerCase().includes(term) || 
      v.color.toLowerCase().includes(term) ||
      (v.pointure && v.pointure.includes(term))
    );
  }
  if (filter === 'out') filteredVariants = filteredVariants.filter(v => v.stock === 0);
  else if (filter === 'low') filteredVariants = filteredVariants.filter(v => v.stock > 0 && v.stock <= 3);
  else if (filter === 'ok') filteredVariants = filteredVariants.filter(v => v.stock > 3);

  // Sort: out of stock first, then low stock, then by product name
  filteredVariants.sort((a, b) => {
    if (a.stock === 0 && b.stock !== 0) return -1;
    if (a.stock !== 0 && b.stock === 0) return 1;
    if (a.stock <= 3 && b.stock > 3) return -1;
    if (a.stock > 3 && b.stock <= 3) return 1;
    return a.productName.localeCompare(b.productName);
  });

  const handleUpdateStock = async (variantId) => {
    try {
      await fetch('/api/variants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, stock: parseInt(editStock) || 0 })
      });
      setEditingVariant(null);
      setEditStock('');
      fetchProducts();
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion du stock</h1>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestion du stock</h1>
        <button onClick={fetchProducts} className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-700 transition-colors">
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Package size={18} className="text-blue-500" />
            <span className="text-xs text-gray-500">Total variantes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalVariants}</p>
          <p className="text-xs text-gray-400">{totalStock} unités</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} className="text-green-500" />
            <span className="text-xs text-green-600">En stock</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{inStock.length}</p>
          <p className="text-xs text-green-500">{inStock.reduce((s,v) => s + v.stock, 0)} unités</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <span className="text-xs text-amber-600">Stock faible</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{lowStock.length}</p>
          <p className="text-xs text-amber-500">≤ 3 unités</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={18} className="text-red-500" />
            <span className="text-xs text-red-600">Rupture</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{outOfStock.length}</p>
          <p className="text-xs text-red-500">0 unités</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher par produit, couleur ou pointure..."
            className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Toutes', count: totalVariants, active: 'bg-gray-900 text-white' },
            { key: 'out', label: 'Rupture', count: outOfStock.length, active: 'bg-red-600 text-white' },
            { key: 'low', label: 'Faible', count: lowStock.length, active: 'bg-amber-500 text-white' },
            { key: 'ok', label: 'OK', count: inStock.length, active: 'bg-green-600 text-white' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${filter === f.key ? f.active : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* ===== OUT OF STOCK ALERTS ===== */}
      {filter === 'all' && outOfStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
            <TrendingDown size={16} /> Alertes de rupture de stock
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {outOfStock.slice(0, 12).map(v => (
              <div key={v.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-red-100">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                  {v.productImage ? <img src={v.productImage} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} /> : <div className="w-full h-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{v.productName}</p>
                  <p className="text-xs text-gray-500">{v.color}{v.pointure ? ` • ${v.pointure}` : ''}</p>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">0</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== ALL VARIANTS TABLE ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">
            Détail du stock par variante
            <span className="text-gray-400 font-normal ml-2">({filteredVariants.length} variante{filteredVariants.length > 1 ? 's' : ''})</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Produit</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Couleur</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Pointure</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">État</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredVariants.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Aucune variante trouvée</td></tr>
              ) : filteredVariants.map(v => (
                <tr key={v.id} className={`hover:bg-gray-50 ${v.stock === 0 ? 'bg-red-50/50' : v.stock <= 3 ? 'bg-amber-50/30' : ''}`}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                        {v.productImage ? <img src={v.productImage} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} /> : <div className="w-full h-full" />}
                      </div>
                      <span className="text-sm text-gray-900 truncate max-w-[120px]">{v.productName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-700">{v.color}</td>
                  <td className="px-4 py-2.5 text-sm text-gray-500 hidden sm:table-cell">{v.pointure || '—'}</td>
                  <td className="px-4 py-2.5">
                    {editingVariant === v.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editStock}
                          onChange={e => setEditStock(e.target.value)}
                          className="w-16 border border-rose-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-rose-500"
                          min="0"
                          autoFocus
                        />
                        <button onClick={() => handleUpdateStock(v.id)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save size={14} /></button>
                        <button onClick={() => { setEditingVariant(null); setEditStock(''); }} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X size={14} /></button>
                      </div>
                    ) : (
                      <span className={`text-sm font-bold ${v.stock === 0 ? 'text-red-600' : v.stock <= 3 ? 'text-amber-600' : 'text-gray-900'}`}>{v.stock}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      v.stock === 0 ? 'bg-red-100 text-red-700' : v.stock <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {v.stock === 0 ? 'Rupture' : v.stock <= 3 ? 'Faible' : 'OK'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {editingVariant !== v.id && (
                      <button onClick={() => { setEditingVariant(v.id); setEditStock(String(v.stock)); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit3 size={13} className="text-gray-400" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== PRODUCTS OVERVIEW ===== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-sm">Aperçu par produit</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {products.map(p => {
            const pVariants = p.variants || [];
            const pTotalStock = pVariants.reduce((s, v) => s + (v.stock || 0), 0);
            const pOutOfStock = pVariants.filter(v => v.stock === 0).length;
            const pLowStock = pVariants.filter(v => v.stock > 0 && v.stock <= 3).length;
            const maxStock = Math.max(...pVariants.map(v => v.stock), 1);

            return (
              <div key={p.id} className="px-4 py-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} /> : <div className="w-full h-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.categories?.name} • {pVariants.length} variante{pVariants.length > 1 ? 's' : ''} • {pTotalStock} unités</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {pOutOfStock > 0 && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg font-medium">{pOutOfStock} rupture</span>}
                    {pLowStock > 0 && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg font-medium">{pLowStock} faible</span>}
                  </div>
                </div>
                {/* Mini variant bars */}
                {pVariants.length > 0 && (
                  <div className="flex gap-1 ml-13">
                    {pVariants.map(v => (
                      <div key={v.id} className="flex-1 min-w-0" title={`${v.color}${v.pointure ? ` ${v.pointure}` : ''}: ${v.stock}`}>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${v.stock === 0 ? 'bg-red-400' : v.stock <= 3 ? 'bg-amber-400' : 'bg-green-400'}`}
                            style={{ width: `${Math.max(5, (v.stock / maxStock) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
