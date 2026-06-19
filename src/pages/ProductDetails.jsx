import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check, Minus, Plus, Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';

const COLOR_MAP = {
  'Noir': '#1a1a1a',
  'Blanc': '#f5f5f5',
  'Beige': '#d4b896',
  'Rose': '#e8a0b4',
  'Rouge': '#c0392b',
  'Marron': '#6d4c2e',
  'Or': '#d4a843',
  'Argent': '#b0b0b8',
};

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    setSelectedImage(0);
    fetch(`/api/products`)
      .then(r => r.json())
      .then(data => {
        const p = data.find(item => item.id === parseInt(id));
        setProduct(p);
        if (p) {
          setSelectedColor(p.colors?.[0] || '');
          setSelectedSize(p.sizes?.[0] || '');
          const rel = data.filter(item => item.category_id === p.category_id && item.id !== p.id).slice(0, 4);
          setRelated(rel);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, selectedColor, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 md:pt-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 animate-pulse">
            <div className="aspect-square bg-gray-100 rounded-2xl" />
            <div className="space-y-4 pt-4">
              <div className="h-4 bg-gray-100 rounded w-1/4" />
              <div className="h-8 bg-gray-100 rounded w-3/4" />
              <div className="h-6 bg-gray-100 rounded w-1/3" />
              <div className="h-12 bg-gray-100 rounded w-1/4 mt-4" />
              <div className="flex gap-3 mt-6"><div className="w-11 h-11 bg-gray-100 rounded-xl" /><div className="w-11 h-11 bg-gray-100 rounded-xl" /><div className="w-11 h-11 bg-gray-100 rounded-xl" /></div>
              <div className="h-14 bg-gray-100 rounded-xl mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-24 md:pt-28 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Produit non trouvé</p>
          <Link to="/shop" className="mt-4 inline-block text-rose-600 hover:text-rose-700 font-medium">Retour à la boutique</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* Breadcrumb */}
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-400 hover:text-rose-700 transition-colors mb-6 text-sm">
          <ArrowLeft size={14} />
          Retour à la boutique
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* === Images Section === */}
          <div>
            {/* Main Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-rose-50/50 mb-4">
              {product.images?.[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={64} className="text-rose-200" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImage === idx ? 'border-rose-600 shadow-md' : 'border-gray-100 hover:border-rose-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* === Details Section === */}
          <div className="pb-8 md:pb-0">
            {/* Category */}
            <span className="text-xs text-rose-600 font-semibold tracking-widest uppercase">
              {product.categories?.name || 'Collection'}
            </span>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2" style={{ fontFamily: 'serif' }}>
              {product.name}
            </h1>
            {product.name_ar && (
              <p className="text-base text-gray-400 mt-1" dir="rtl">{product.name_ar}</p>
            )}

            {/* Price */}
            <p className="text-3xl font-bold text-rose-700 mt-4">
              {product.price?.toLocaleString()} DA
            </p>

            {/* Stock badge */}
            {product.stock === 0 ? (
              <span className="inline-block mt-2 px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-full">Rupture de stock</span>
            ) : product.stock <= 5 ? (
              <span className="inline-block mt-2 px-3 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full">Plus que {product.stock} en stock</span>
            ) : null}

            {/* Divider */}
            <div className="border-t border-gray-100 mt-6 pt-6 space-y-6">

              {/* Colors */}
              {product.colors?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Couleur: <span className="text-rose-700 font-semibold">{selectedColor}</span>
                  </label>
                  <div className="flex gap-2.5 flex-wrap">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? 'border-rose-600 ring-2 ring-rose-200 scale-110'
                            : 'border-gray-200 hover:border-rose-300'
                        }`}
                        title={color}
                      >
                        <div
                          className="w-full h-full rounded-full"
                          style={{ backgroundColor: COLOR_MAP[color] || '#ccc' }}
                        />
                        {selectedColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color === 'Blanc' || color === 'Beige' || color === 'Argent' ? '#333' : '#fff'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Pointure: <span className="text-rose-700 font-semibold">{selectedSize}</span>
                  </label>
                  <div className="flex gap-2.5 flex-wrap">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-xl text-sm border-2 transition-all flex items-center justify-center font-medium ${
                          selectedSize === size
                            ? 'border-rose-600 bg-rose-50 text-rose-700 font-bold'
                            : 'border-gray-200 hover:border-rose-300 text-gray-600'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Quantité</label>
                <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-semibold text-base border-x border-gray-200 h-11 flex items-center justify-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to cart + Wishlist */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 rounded-xl font-medium tracking-wider transition-all flex items-center justify-center gap-2 text-sm ${
                    added
                      ? 'bg-green-600 text-white'
                      : product.stock === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-rose-700 hover:bg-rose-800 text-white hover:shadow-lg hover:shadow-rose-200 active:scale-[0.98]'
                  }`}
                >
                  {added ? <><Check size={18} /> Ajouté au panier !</> : <><ShoppingBag size={18} /> AJOUTER AU PANIER</>}
                </button>
                <button className="w-14 h-14 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-rose-50 hover:border-rose-300 transition-colors flex-shrink-0">
                  <Heart size={20} className="text-gray-300" />
                </button>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">Description</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'serif' }}>Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
