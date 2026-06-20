import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, X, Save, ShoppingBag, AlertCircle, ImagePlus, Loader2, Palette, Trash } from 'lucide-react';

const SIZES = ['36', '37', '38', '39', '40', '41'];

const emptyVariant = () => ({ color: '', colorCode: '#000000', images: [] });

const emptyProduct = {
  name: '', name_ar: '', description: '', description_ar: '',
  price: '', category_id: '', variants: [emptyVariant()], sizes: [], stock: 10, featured: false, best_seller: false
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
  const [uploadingVariantIdx, setUploadingVariantIdx] = useState(-1);
  const fileInputRefs = useRef({});

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

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({...emptyProduct, category_id: categories[0]?.id || '', variants: [emptyVariant()]});
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditing(product.id);
    const variants = (product.variants && product.variants.length > 0)
      ? product.variants
      : [emptyVariant()];
    setForm({
      name: product.name || '',
      name_ar: product.name_ar || '',
      description: product.description || '',
      description_ar: product.description_ar || '',
      price: product.price || '',
      category_id: product.category_id || '',
      variants,
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      stock: product.stock || 0,
      featured: product.featured || false,
      best_seller: product.best_seller || false
    });
    setShowForm(true);
  };

  // ===== VARIANT MANAGEMENT =====
  const addVariant = () => {
    setForm(prev => ({ ...prev, variants: [...prev.variants, emptyVariant()] }));
  };

  const removeVariant = (idx) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== idx)
    }));
  };

  const updateVariant = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => i === idx ? { ...v, [field]: value } : v)
    }));
  };

  // ===== IMAGE UPLOAD PER VARIANT =====
  const handleVariantUpload = async (idx, files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadingVariantIdx(idx);
    try {
      const newImages = [];
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          alert(`Fichier "${file.name}" trop volumineux (max 5MB)`);
          continue;
        }
        const reader = new FileReader();
        const base64 = await new Promise(resolve => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(file);
        });
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileBase64: base64, contentType: file.type })
        });
        if (!res.ok) throw new Error('Upload échoué');
        const { url } = await res.json();
        newImages.push(url);
      }
      setForm(prev => ({
        ...prev,
        variants: prev.variants.map((v, i) =>
          i === idx ? { ...v, images: [...v.images, ...newImages] } : v
        )
      }));
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erreur: ' + err.message);
    } finally {
      setUploading(false);
      setUploadingVariantIdx(-1);
      if (fileInputRefs.current[idx]) fileInputRefs.current[idx].value = '';
    }
  };

  const addVariantImageUrl = (idx, url) => {
    if (!url.trim() || !url.startsWith('http')) return;
    setForm(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === idx ? { ...v, images: [...v.images, url.trim()] } : v
      )
    }));
  };

  const removeVariantImage = (variantIdx, imageIdx) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === variantIdx ? { ...v, images: v.images.filter((_, j) => j !== imageIdx) } : v
      )
    }));
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
    // Validate variants
    for (const v of form.variants) {
      if (!v.color.trim()) { alert('Chaque variante doit avoir un nom de couleur'); return; }
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        name_ar: form.name_ar,
        description: form.description,
        description_ar: form.description_ar,
        price: parseFloat(form.price),
        category_id: parseInt(form.category_id),
        variants: form.variants,
        sizes: form.sizes,
        stock: parseInt(form.stock) || 0,
        featured: form.featured,
        best_seller: form.best_seller
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
      alert('Erreur: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      fetchProducts();
    } catch (err) { alert('Erreur lors de la suppression'); }
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-4 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>
            <div className="space-y-5">
              {/* Basic Info */}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description (FR)</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" rows={2} />
              </div>

              {/* ===== COLOR VARIANTS SECTION ===== */}
              <div className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Palette size={18} className="text-rose-600" />
                    Variantes de couleur
                  </h3>
                  <button type="button" onClick={addVariant} className="flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700 font-medium">
                    <Plus size={14} /> Ajouter couleur
                  </button>
                </div>

                <div className="space-y-4">
                  {form.variants.map((variant, vIdx) => (
                    <div key={vIdx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      {/* Variant Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <input
                              type="color"
                              value={variant.colorCode}
                              onChange={e => updateVariant(vIdx, 'colorCode', e.target.value)}
                              className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                            />
                          </div>
                          <input
                            type="text"
                            value={variant.color}
                            onChange={e => updateVariant(vIdx, 'color', e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 w-40"
                            placeholder="Nom couleur (ex: Noir)"
                          />
                        </div>
                        {form.variants.length > 1 && (
                          <button type="button" onClick={() => removeVariant(vIdx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash size={16} />
                          </button>
                        )}
                      </div>

                      {/* Image Upload for this variant */}
                      <div className="mt-3">
                        <input
                          type="file"
                          ref={el => fileInputRefs.current[vIdx] = el}
                          onChange={e => handleVariantUpload(vIdx, e.target.files)}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[vIdx]?.click()}
                          disabled={uploading && uploadingVariantIdx === vIdx}
                          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-rose-400 rounded-xl py-3 px-4 transition-colors text-gray-400 hover:text-rose-500 disabled:opacity-50"
                        >
                          {uploading && uploadingVariantIdx === vIdx ? (
                            <><Loader2 size={16} className="animate-spin" /><span className="text-xs">Envoi...</span></>
                          ) : (
                            <><ImagePlus size={16} /><span className="text-xs">Images pour "{variant.color || 'cette couleur'}"</span></>
                          )}
                        </button>

                        {/* Thumbnail Previews */}
                        {variant.images.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-2">
                            {variant.images.map((img, iIdx) => (
                              <div key={iIdx} className="relative w-16 h-16 rounded-lg overflow-hidden group border border-gray-200">
                                <img src={img} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                                <button
                                  type="button"
                                  onClick={() => removeVariantImage(vIdx, iIdx)}
                                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X size={12} className="text-white" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* URL input for this variant */}
                        <div className="flex gap-1 mt-2">
                          <input
                            type="url"
                            placeholder="Ajouter URL d'image"
                            className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addVariantImageUrl(vIdx, e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Pointures (pour sandales)</label>
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

              {/* Save */}
              <button onClick={handleSave} disabled={saving || uploading} className="w-full bg-rose-700 hover:bg-rose-800 disabled:bg-rose-400 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                <Save size={16} />
                {saving ? 'Enregistrement...' : editing ? 'MODIFIER' : 'AJOUTER'}
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Catégorie</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Prix</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Variantes</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Stock</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center">
                    <ShoppingBag size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">Aucun produit</p>
                    <button onClick={openAdd} className="mt-3 text-rose-600 text-sm font-medium">+ Ajouter</button>
                  </td></tr>
                ) : products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-rose-50 flex-shrink-0">
                          {p.variants?.[0]?.images?.[0] ? <img src={p.variants[0].images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={14} className="text-rose-200" /></div>}
                        </div>
                        <div><p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{p.name}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{p.categories?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium">{Number(p.price).toLocaleString()} DA</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex gap-1">
                        {(p.variants || []).slice(0, 5).map((v, i) => (
                          <div key={i} className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: v.colorCode }} title={v.color} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-sm font-medium ${p.stock <= 5 ? (p.stock === 0 ? 'text-red-600' : 'text-amber-600') : 'text-gray-900'}`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 hover:bg-gray-100 rounded-lg"><Pencil size={14} className="text-gray-500" /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red-400" /></button>
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