import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Save } from 'lucide-react';

const COLORS = ['Noir', 'Blanc', 'Beige', 'Rose', 'Rouge', 'Marron', 'Or', 'Argent'];
const SIZES = ['36', '37', '38', '39', '40', '41'];

const emptyProduct = {
  name: '', name_ar: '', description: '', description_ar: '',
  price: '', category_id: '', images: [], colors: [], sizes: [], stock: 10, featured: false, best_seller: false
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [imageInput, setImageInput] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProducts();
    fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyProduct);
    setImageInput('');
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditing(product.id);
    setForm({
      name: product.name || '',
      name_ar: product.name_ar || '',
      description: product.description || '',
      description_ar: product.description_ar || '',
      price: product.price || '',
      category_id: product.category_id || '',
      images: product.images || [],
      colors: product.colors || [],
      sizes: product.sizes || [],
      stock: product.stock || 0,
      featured: product.featured || false,
      best_seller: product.best_seller || false
    });
    setImageInput('');
    setShowForm(true);
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setForm({ ...form, images: [...form.images, imageInput.trim()] });
      setImageInput('');
    }
  };

  const removeImage = (idx) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const toggleColor = (color) => {
    setForm({
      ...form,
      colors: form.colors.includes(color) ? form.colors.filter(c => c !== color) : [...form.colors, color]
    });
  };

  const toggleSize = (size) => {
    setForm({
      ...form,
      sizes: form.sizes.includes(size) ? form.sizes.filter(s => s !== size) : [...form.sizes, size]
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        category_id: parseInt(form.category_id)
      };
      if (editing) {
        payload.id = editing;
        await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchProducts();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-rose-700 hover:bg-rose-800 text-white px-4 py-2.5 rounded-xl font-medium transition-colors text-sm">
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Nom (FR) *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">الاسم (عربي)</label>
                  <input type="text" value={form.name_ar} onChange={e => setForm({...form, name_ar: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" dir="rtl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Prix (DA) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Catégorie *</label>
                  <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                    <option value="">Sélectionner</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Stock</label>
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description (FR)</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">الوصف (عربي)</label>
                <textarea value={form.description_ar} onChange={e => setForm({...form, description_ar: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" rows={3} dir="rtl" />
              </div>

              {/* Images */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Images (URLs)</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={imageInput} onChange={e => setImageInput(e.target.value)} className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="https://..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())} />
                  <button type="button" onClick={addImage} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm transition-colors"><Upload size={16} /></button>
                </div>
                {form.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={14} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Colors */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Couleurs</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => toggleColor(c)} className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${form.colors.includes(c) ? 'bg-rose-700 text-white border-rose-700' : 'border-gray-300 hover:border-rose-300'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Pointures</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(s => (
                    <button key={s} type="button" onClick={() => toggleSize(s)} className={`w-10 h-10 rounded-lg text-xs border transition-colors flex items-center justify-center ${form.sizes.includes(s) ? 'bg-rose-700 text-white border-rose-700' : 'border-gray-300 hover:border-rose-300'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500" />
                  <span className="text-sm text-gray-700">Nouveauté</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.best_seller} onChange={e => setForm({...form, best_seller: e.target.checked})} className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500" />
                  <span className="text-sm text-gray-700">Meilleure vente</span>
                </label>
              </div>

              <button onClick={handleSave} disabled={saving} className="w-full bg-rose-700 hover:bg-rose-800 disabled:bg-rose-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <Save size={16} />
                {saving ? 'Enregistrement...' : editing ? 'MODIFIER' : 'AJOUTER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                          {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.name}</p>
                          {p.name_ar && <p className="text-xs text-gray-400" dir="rtl">{p.name_ar}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.categories?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium">{parseInt(p.price).toLocaleString()} DA</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${p.stock <= 5 ? (p.stock === 0 ? 'text-red-600' : 'text-amber-600') : 'text-gray-900'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {p.featured && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Nouveau</span>}
                        {p.best_seller && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Top</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Pencil size={14} className="text-gray-500" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} className="text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}