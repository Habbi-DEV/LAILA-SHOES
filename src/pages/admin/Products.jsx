import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Save, ShoppingBag, AlertCircle, ImagePlus, Loader2, Palette } from 'lucide-react';

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
  const [uploading, setUploading] = useState(false);
  const [uploadingForColor, setUploadingForColor] = useState(null);
  const fileInputRef = useRef(null);
  const colorFileInputRef = useRef(null);

  const fetchProducts = async () => {
    try {
      setFetchError(null);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(`Erreur serveur: ${res.status}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message);
      setProducts([]);
    } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch { setCategories([]); }
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({...emptyProduct, category_id: categories[0]?.id || ''});
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditing(product.id);
    // Normalize colors to new format
    let normalizedColors = [];
    if (Array.isArray(product.colors)) {
      normalizedColors = product.colors.map(c => {
        if (typeof c === 'object' && c !== null) {
          return { name: c.name || '', hex: c.hex || '#888888', images: Array.isArray(c.images) ? c.images : [] };
        }
        return { name: c, hex: '#888888', images: [] };
      });
    }
    setForm({
      name: product.name || '',
      name_ar: product.name_ar || '',
      description: product.description || '',
      description_ar: product.description_ar || '',
      price: product.price || '',
      category_id: product.category_id || '',
      images: Array.isArray(product.images) ? product.images : [],
      colors: normalizedColors,
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      stock: product.stock || 0,
      featured: product.featured || false,
      best_seller: product.best_seller || false
    });
    setShowForm(true);
  };

  // ===== COLOR VARIANT MANAGEMENT =====
  const addColorVariant = () => {
    setForm(prev => ({
      ...prev,
      colors: [...prev.colors, { name: '', hex: '#1a1a1a', images: [] }]
    }));
  };

  const removeColorVariant = (idx) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== idx)
    }));
  };

  const updateColorVariant = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === idx ? { ...c, [field]: value } : c)
    }));
  };

  const addImageToColor = (idx, url) => {
    if (!url.trim()) return;
    setForm(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === idx ? { ...c, images: [...c.images, url.trim()] } : c)
    }));
  };

  const removeImageFromColor = (colorIdx, imgIdx) => {
    setForm(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === colorIdx ? { ...c, images: c.images.filter((_, j) => j !== imgIdx) } : c)
    }));
  };

  // ===== FILE UPLOAD =====
  const handleFileUpload = async (e, colorIdx = null) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (colorIdx !== null) setUploadingForColor(colorIdx);
    else setUploading(true);

    try {
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) { alert(`Fichier "${file.name}" trop volumineux (max 5MB)`); continue; }
        const reader = new FileReader();
        const base64 = await new Promise(resolve => { reader.onload = () => resolve(reader.result.split(',')[1]); reader.readAsDataURL(file); });
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileBase64: base64, contentType: file.type })
        });
        if (!res.ok) throw new Error('Upload échoué');
        const { url } = await res.json();
        if (colorIdx !== null) {
          setForm(prev => ({
            ...prev,
            colors: prev.colors.map((c, i) => i === colorIdx ? { ...c, images: [...c.images, url] } : c)
          }));
        } else {
          setForm(prev => ({ ...prev, images: [...prev.images, url] }));
        }
      }
    } catch (err) { alert('Erreur upload: ' + err.message); }
    finally {
      setUploading(false);
      setUploadingForColor(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (colorFileInputRef.current) colorFileInputRef.current.value = '';
    }
  };

  // ===== MAIN IMAGE MANAGEMENT =====
  const addMainImage = (url) => {
    if (!url.trim() || !url.startsWith('http')) return;
    setForm(prev => ({ ...prev, images: [...prev.images, url.trim()] }));
  };

  const removeMainImage = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  // ===== SIZE MANAGEMENT =====
  const toggleSize = (size) => {
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
    }));
  };

  // ===== SAVE / DELETE =====
  const handleSave = async () => {
    if (!form.name.trim()) { alert('Le nom est requis'); return; }
    if (!form.price) { alert('Le prix est requis'); return; }
    if (!form.category_id) { alert('La catégorie est requise'); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock) || 0, category_id: parseInt(form.category_id) };
      if (editing) {
        payload.id = editing;
        await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else {
        await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) { alert('Erreur: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      fetchProducts();
    } catch { alert('Erreur lors de la suppression'); }
  };

  if (fetchError && !loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle size={48} className="text-red-300 mx-auto mb-4" />
          <p className="text-red-700 font-medium mb-2">Impossible de charger les produits</p>
          <p className="text-red-500 text-sm mb-4">{fetchError}</p>
          <button onClick={() => { setLoading(true); fetchProducts(); }} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl text-sm font-medium">Réessayer</button>
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

      {/* ===== PRODUCT FORM MODAL ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-4 px-3 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-5 mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Nom (FR) *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">الاسم (عربي)</label>
                  <input type="text" value={form.name_ar} onChange={e => setForm({...form, name_ar: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" dir="rtl" />
                </div>
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Prix (DA) *</label>
                  <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
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
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description (FR)</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">الوصف (عربي)</label>
                <textarea value={form.description_ar} onChange={e => setForm({...form, description_ar: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" rows={2} dir="rtl" />
              </div>

              {/* ===== COLOR VARIANTS ===== */}
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Palette size={16} className="text-rose-600" />
                    <label className="text-sm font-semibold text-gray-900">Variantes de couleur</label>
                  </div>
                  <button type="button" onClick={addColorVariant} className="flex items-center gap-1 text-xs bg-rose-100 hover:bg-rose-200 text-rose-700 px-3 py-1.5 rounded-lg font-medium transition-colors">
                    <Plus size={12} /> Ajouter couleur
                  </button>
                </div>

                {form.colors.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">Aucune variante de couleur ajoutée</p>
                )}

                <div className="space-y-3">
                  {form.colors.map((color, cIdx) => (
                    <div key={cIdx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Color Picker */}
                        <div className="relative">
                          <input
                            type="color"
                            value={color.hex}
                            onChange={e => updateColorVariant(cIdx, 'hex', e.target.value)}
                            className="w-10 h-10 rounded-lg border-2 border-gray-200 cursor-pointer appearance-none p-0.5"
                            style={{ backgroundColor: color.hex }}
                          />
                        </div>
                        {/* Color Name */}
                        <input
                          type="text"
                          value={color.name}
                          onChange={e => updateColorVariant(cIdx, 'name', e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                          placeholder="Nom de la couleur (ex: Noir)"
                        />
                        {/* Hex Display */}
                        <span className="text-xs text-gray-400 font-mono">{color.hex}</span>
                        {/* Remove */}
                        <button type="button" onClick={() => removeColorVariant(cIdx)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <X size={14} className="text-red-400" />
                        </button>
                      </div>

                      {/* Per-color images */}
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1.5">Images pour "{color.name || 'cette couleur'}"</p>
                        <div className="flex gap-2 flex-wrap mb-2">
                          {color.images.map((img, iIdx) => (
                            <div key={iIdx} className="relative w-14 h-14 rounded-lg overflow-hidden group border border-gray-200">
                              <img src={img} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                              <button type="button" onClick={() => removeImageFromColor(cIdx, iIdx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={12} className="text-white" />
                              </button>
                            </div>
                          ))}
                          {/* Upload button for this color */}
                          <button
                            type="button"
                            onClick={() => {
                              setUploadingForColor(cIdx);
                              colorFileInputRef.current?.click();
                            }}
                            disabled={uploadingForColor === cIdx}
                            className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 hover:border-rose-400 flex items-center justify-center text-gray-400 hover:text-rose-500 transition-colors disabled:opacity-50"
                          >
                            {uploadingForColor === cIdx ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                          </button>
                        </div>
                        {/* URL input for this color */}
                        <ColorImageInput colorIdx={cIdx} onAdd={addImageToColor} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hidden file input for color images */}
                <input
                  type="file"
                  ref={colorFileInputRef}
                  onChange={e => {
                    const cIdx = uploadingForColor;
                    if (cIdx !== null) handleFileUpload(e, cIdx);
                  }}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>

              {/* ===== MAIN IMAGES (fallback) ===== */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Images principales (par défaut)</label>
                <div className="mb-2">
                  <input type="file" ref={fileInputRef} onChange={e => handleFileUpload(e)} accept="image/*" multiple className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-rose-400 rounded-xl py-3 px-4 transition-colors text-gray-500 hover:text-rose-600 text-sm disabled:opacity-50">
                    {uploading ? <><Loader2 size={16} className="animate-spin" /> Téléchargement...</> : <><ImagePlus size={16} /> Choisir des images</>}
                  </button>
                </div>
                {form.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden group border border-gray-200">
                        <img src={img} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                        <button type="button" onClick={() => removeMainImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={14} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ===== SIZES ===== */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Pointures</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(s => (
                    <button key={s} type="button" onClick={() => toggleSize(s)} className={`w-10 h-10 rounded-lg text-xs border transition-colors flex items-center justify-center ${form.sizes.includes(s) ? 'bg-rose-700 text-white border-rose-700' : 'border-gray-300 hover:border-rose-300'}`}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500" /><span className="text-sm text-gray-700">Nouveauté</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.best_seller} onChange={e => setForm({...form, best_seller: e.target.checked})} className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500" /><span className="text-sm text-gray-700">Meilleure vente</span></label>
              </div>

              {/* Save */}
              <button onClick={handleSave} disabled={saving || uploading} className="w-full bg-rose-700 hover:bg-rose-800 disabled:bg-rose-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <Save size={16} />{saving ? 'Enregistrement...' : editing ? 'MODIFIER' : 'AJOUTER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PRODUCTS TABLE ===== */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Couleurs</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center"><ShoppingBag size={40} className="text-gray-200 mx-auto mb-3" /><p className="text-gray-400">Aucun produit</p><button onClick={openAdd} className="mt-3 text-rose-600 hover:text-rose-700 text-sm font-medium">+ Ajouter un produit</button></td></tr>
                ) : products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                          {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={14} className="text-rose-200" /></div>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{p.name}</p>
                          {p.name_ar && <p className="text-xs text-gray-400 truncate max-w-[150px]" dir="rtl">{p.name_ar}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{p.categories?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium">{Number(p.price).toLocaleString()} DA</td>
                    <td className="px-4 py-3 hidden sm:table-cell"><span className={`text-sm font-medium ${p.stock <= 5 ? (p.stock === 0 ? 'text-red-600' : 'text-amber-600') : 'text-gray-900'}`}>{p.stock}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex gap-1">
                        {(Array.isArray(p.colors) ? p.colors : []).map((c, i) => {
                          const hex = typeof c === 'object' ? c.hex : '#888';
                          return <div key={i} className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: hex }} title={typeof c === 'object' ? c.name : c} />;
                        })}
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

// Sub-component for color image URL input
function ColorImageInput({ colorIdx, onAdd }) {
  const [url, setUrl] = useState('');
  return (
    <div className="flex gap-1.5">
      <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500" placeholder="https://..." onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(colorIdx, url); setUrl(''); } }} />
      <button type="button" onClick={() => { onAdd(colorIdx, url); setUrl(''); }} disabled={!url.trim()} className="px-2 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-medium disabled:opacity-40">+</button>
    </div>
  );
}
