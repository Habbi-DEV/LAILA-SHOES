import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { normalizeColors } from '../lib/colorUtils';

const SIZES = ['36', '37', '38', '39', '40', '41'];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const isSandales = selectedCategory === 'sandales';

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(setCategories).catch(() => {}); }, []);

  useEffect(() => { if (!isSandales) setSelectedSize(''); }, [isSandales]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) {
      const cat = categories.find(c => c.slug === selectedCategory);
      if (cat) params.set('category', cat.id);
    }
    if (selectedSize) params.set('size', selectedSize);
    if (minPrice !== '' && !isNaN(Number(minPrice))) params.set('min_price', minPrice);
    if (maxPrice !== '' && !isNaN(Number(maxPrice))) params.set('max_price', maxPrice);

    fetch(`/api/products?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        let sorted = [...(Array.isArray(data) ? data : [])];
        // Filter by color on client side (supports new color format)
        if (selectedColor) {
          sorted = sorted.filter(p => {
            const colors = normalizeColors(p);
            return colors.some(c => c.name === selectedColor);
          });
        }
        if (sortBy === 'price_asc') sorted.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price_desc') sorted.sort((a, b) => b.price - a.price);
        else if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
        setProducts(sorted);
        setLoading(false);
      })
      .catch(() => { setProducts([]); setLoading(false); });
  }, [selectedCategory, selectedColor, selectedSize, minPrice, maxPrice, sortBy, categories]);

  const clearFilters = () => { setSelectedCategory(''); setSelectedColor(''); setSelectedSize(''); setMinPrice(''); setMaxPrice(''); };
  const hasFilters = selectedCategory || selectedColor || selectedSize || minPrice !== '' || maxPrice !== '';

  // Get all unique color names from products
  const allColors = [...new Set(products.flatMap(p => normalizeColors(p).map(c => c.name)))].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>Boutique</h1>
          <p className="text-gray-500 mt-1">{products.length} produit{products.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex items-center justify-between mb-6 gap-4">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            <SlidersHorizontal size={16} /> Filtres {hasFilters && <span className="w-2 h-2 bg-rose-600 rounded-full" />}
          </button>
          <div className="relative">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
              <option value="newest">Plus récent</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="name">Nom A-Z</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filtres</h3>
              {hasFilters && <button onClick={clearFilters} className="text-sm text-rose-600 hover:text-rose-700 flex items-center gap-1"><X size={14} /> Réinitialiser</button>}
            </div>
            <div className={`grid gap-6 ${isSandales ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Catégorie</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="category" checked={!selectedCategory} onChange={() => setSelectedCategory('')} className="text-rose-600 focus:ring-rose-500" /><span className="text-sm">Toutes</span></label>
                  {categories.map(cat => <label key={cat.id} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="category" checked={selectedCategory === cat.slug} onChange={() => setSelectedCategory(cat.slug)} className="text-rose-600 focus:ring-rose-500" /><span className="text-sm">{cat.name}</span></label>)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Couleur</label>
                <select value={selectedColor} onChange={e => setSelectedColor(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                  <option value="">Toutes les couleurs</option>
                  {allColors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {isSandales && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Pointure</label>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelectedSize('')} className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${!selectedSize ? 'bg-rose-700 text-white border-rose-700' : 'border-gray-300 hover:border-rose-300'}`}>Tout</button>
                    {SIZES.map(s => <button key={s} onClick={() => setSelectedSize(selectedSize === s ? '' : s)} className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${selectedSize === s ? 'bg-rose-700 text-white border-rose-700' : 'border-gray-300 hover:border-rose-300'}`}>{s}</button>)}
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Prix (DA)</label>
                <div className="flex gap-2 items-center">
                  <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="Min" min="0" />
                  <span className="text-gray-400">-</span>
                  <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="Max" min="0" />
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-12">{[1,2,3,4,5,6,7,8].map(i => <div key={i} className="animate-pulse"><div className="aspect-[3/4] bg-gray-200 rounded-2xl" /><div className="mt-3 h-4 bg-gray-200 rounded w-3/4" /><div className="mt-2 h-4 bg-gray-200 rounded w-1/2" /></div>)}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20"><p className="text-gray-400 text-lg">Aucun produit trouvé</p><button onClick={clearFilters} className="mt-4 text-rose-600 hover:text-rose-700 font-medium">Réinitialiser les filtres</button></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-12">{products.map(p => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </div>
    </div>
  );
}
