import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check, Minus, Plus, Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';

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
      <div className="min-h-screen bg-gray-50 pt-14 sm:pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-xl sm:rounded-2xl" />
            <div className="space-y-3 sm:space-y-4">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-16 sm:h-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-14 sm:pt-20 md:pt-24 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-gray-400 text-base sm:text-lg">Produit non trouvé</p>
          <Link to="/shop" className="mt-3 sm:mt-4 inline-block text-rose-600 hover:text-rose-700 font-medium text-sm">Retour à la boutique</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-14 sm:pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Breadcrumb */}
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-rose-700 transition-colors mb-4 sm:mb-6 text-xs sm:text-sm">
          <ArrowLeft size={14} />
          Retour à la boutique
        </Link>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-rose-50 mb-3 sm:mb-4">
              {product.images?.[selectedImage] ? (
                <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={48} className="text-rose-200" />
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImage === idx ? 'border-rose-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-1.5 sm:mb-2">
              <span className="text-xs sm:text-sm text-rose-600 font-medium tracking-wider">
                {product.categories?.name || 'Collection'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>{product.name}</h1>
            {product.name_ar && <p className="text-base sm:text-lg text-gray-500 mt-0.5 sm:mt-1" dir="rtl">{product.name_ar}</p>}
            <p className="text-2xl sm:text-3xl font-bold text-rose-700 mt-3 sm:mt-4">{product.price?.toLocaleString()} DA</p>

            <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
              {/* Colors */}
              {product.colors?.length > 0 && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 block">
                    Couleur: <span className="text-rose-700">{selectedColor}</span>
                  </label>
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm border-2 transition-all ${
                          selectedColor === color
                            ? 'border-rose-600 bg-rose-50 text-rose-700 font-medium'
                            : 'border-gray-200 hover:border-rose-300 text-gray-700'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 block">
                    Pointure: <span className="text-rose-700">{selectedSize}</span>
                  </label>
                  <div className="flex gap-2 sm:gap-3 flex-wrap">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl text-xs sm:text-sm border-2 transition-all flex items-center justify-center ${
                          selectedSize === size
                            ? 'border-rose-600 bg-rose-50 text-rose-700 font-bold'
                            : 'border-gray-200 hover:border-rose-300 text-gray-700'
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
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 block">Quantité</label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100">
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-semibold text-base sm:text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Add to cart */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium tracking-wider transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                    added
                      ? 'bg-green-600 text-white'
                      : product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white'
                  }`}
                >
                  {added ? <><Check size={18} /> Ajouté !</> : <><ShoppingBag size={18} /> AJOUTER AU PANIER</>}
                </button>
                <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl border border-gray-300 flex items-center justify-center hover:bg-rose-50 active:bg-rose-100 hover:border-rose-300 transition-colors">
                  <Heart size={18} className="text-gray-400" />
                </button>
              </div>

              {product.stock <= 5 && product.stock > 0 && (
                <p className="text-amber-600 text-xs sm:text-sm font-medium">⚠ Plus que {product.stock} en stock</p>
              )}
              {product.stock === 0 && (
                <p className="text-red-600 text-xs sm:text-sm font-medium">Rupture de stock</p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-10 sm:mt-16">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-8" style={{ fontFamily: 'serif' }}>Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
