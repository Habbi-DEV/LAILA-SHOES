import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Save, ShoppingBag, AlertCircle, Link, ImagePlus, Loader2 } from 'lucide-react';

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
  const [fetchError, setFetchError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [imageInput, setImageInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProducts = async () => {
    try {
      setFetchError(null);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(`Erreur serveur: ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch products error:', err);
      setFetchError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch categories error:', err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({...emptyProduct, category_id: categories[0]?.id || ''});
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
      images: Array.isArray(product.images) ? product.images : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      stock: product.stock || 0,
      featured: product.featured || false,
      best_seller: product.best_seller || false
    });
    setImageInput('');
    setShowForm(true);
  };

  // ✅ Add image from URL
  const addImageFromUrl = () => {
    const url = imageInput.trim();
    if (!url) return;
    if (!url.startsWith('http')) {
      alert('Veuillez entrer une URL valide commençant par http:// ou https://');
      return;
    }
    setForm(prev => ({ ...prev, images: [...prev.images, url] }));
    setImageInput('');
  };

  // ✅ Upload image from device
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`Fichier "${file.name}" trop volumineux (max 5MB)`);
          continue;
        }

        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(file);
        });

        const base64 = await base64Promise;

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileBase64: base64,
            contentType: file.type
          })
        });

        if (!res.ok) throw new Error('Upload échoué');
        const { url } = await res.json();
        setForm(prev => ({ ...prev, images: [...prev.images, url] }));
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erreur lors du téléchargement: ' + err.message);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const toggleColor = (color) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.includes(color) ? prev.colors.filter(c => c !== color) : [...prev.colors, color]
    }));
  };

  const toggleSize = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { alert('Le nom du produit est requis'); return; }
    if (!form.price) { alert('Le prix est requis'); return; }
    if (!form.category_id) { alert('La catégorie est requise'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
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
    } catch (err) {
      console.error('Save error:', err);
      alert('Erreur lors de l\'enregistrement: ' + err.message);
    } finally {
      setSaving(false);
    }
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
    } catch (err) {
      console.error('Delete error:', err);
      alert('Erreur lors de la suppression');
    }
  };

  // Error state
  if (fetchError && !loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-red-300 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-2">Impossible de charger les produits</p>
          <p className="text-red-500 text-sm mb-4">{fetchError}</p>
          <button onClick={() => { setLoading(true); fetchProducts(); }} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-6 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Nom (FR) *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="Sac à Main..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">الاسم (عربي)</label>
                  <input type="text" value={form.name_ar} onChange={e => setForm({...form, name_ar: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" dir="rtl" placeholder="حقيبة يد..." />
                </div>
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Prix (DA) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="4500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Catégorie *</label>
                  <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                    <option value="">Sélectionner</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Stock</label>
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="10" />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description (FR)</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" rows={3} placeholder="Description du produit..." />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">الوصف (عربي)</label>
                <textarea value={form.description_ar} onChange={e => setForm({...form, description_ar: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" rows={3} dir="rtl" placeholder="وصف المنتج..." />
              </div>

              {/* ========== IMAGES ========== */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Images</label>

                {/* Method 1: Upload from device */}
                <div className="mb-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-rose-400 rounded-xl py-4 px-4 transition-colors text-gray-500 hover:text-rose-600 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-sm font-medium">Téléchargement en cours...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus size={20} />
                        <span className="text-sm font-medium">Choisir des images depuis votre appareil</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">ou ajouter par URL</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Method 2: URL input */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageInput}
                    onChange={e => setImageInput(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    placeholder="https://exemple.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={addImageFromUrl}
                    disabled={!imageInput.trim()}
                    className="px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Ajouter
                  </button>
                </div>

                {/* Preview added images */}
                {form.images.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500">{form.images.length} image(s) ajoutée(s)</p>
                    <div className="flex gap-2 flex-wrap">
                      {form.images.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group border border-gray-200">
                          <img
                            src={img}
                            alt={`Image ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={18} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
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

              {/* Save button */}
              <button onClick={handleSave} disabled={saving || uploading} className="w-full bg-rose-700 hover:bg-rose-800 disabled:bg-rose-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <Save size={16} />
                {saving ? 'Enregistrement...' : editing ? 'MODIFIER' : 'AJOUTER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Catégorie</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Statut</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <ShoppingBag size={40} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400">Aucun produit</p>
                      <button onClick={openAdd} className="mt-3 text-rose-600 hover:text-rose-700 text-sm font-medium">+ Ajouter un produit</button>
                    </td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag size={14} className="text-rose-200" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{p.name}</p>
                            {p.name_ar && <p className="text-xs text-gray-400 truncate max-w-[150px]" dir="rtl">{p.name_ar}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{p.categories?.name || '-'}</td>
                      <td className="px-4 py-3 text-sm font-medium">{Number(p.price).toLocaleString()} DA</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-sm font-medium ${p.stock <= 5 ? (p.stock === 0 ? 'text-red-600' : 'text-amber-600') : 'text-gray-900'}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
