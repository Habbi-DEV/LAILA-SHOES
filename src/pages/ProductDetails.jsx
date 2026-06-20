import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check, Minus, Plus, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);
  const [added, setAdded] = useState(false);
  const [imageTransition, setImageTransition] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        const p = data.find(item => item.id === parseInt(id));
        setProduct(p);
        if (p) {
          setSelectedSize(p.sizes?.[0] || '');
          setActiveVariantIdx(0);
          setMainImageIdx(0);
          const rel = data.filter(item => item.category_id === p.category_id && item.id !== p.id).slice(0, 4);
          setRelated(rel);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Get current variant data
  const variants = product?.variants || [];
  const activeVariant = variants[activeVariantIdx] || null;
  const currentImages = activeVariant?.images || [];
  const mainImage = currentImages[mainImageIdx] || '';

  // When color changes, reset to first image of that variant
  const handleColorChange = (idx) => {
    setImageTransition(true);
    setActiveVariantIdx(idx);
    setMainImageIdx(0);
    setTimeout(() => setImageTransition(false), 300);
  };

  // Navigate between images
  const nextImage = () => {
    setImageTransition(true);
    setMainImageIdx(prev => (prev + 1) % currentImages.length);
    setTimeout(() => setImageTransition(false), 300);
  };
  const prevImage = () => {
    setImageTransition(true);
    setMainImageIdx(prev => (prev - 1 + currentImages.length) % currentImages.length);
    setTimeout(() => setImageTransition(false), 300);
  };

  const handleAddToCart = () => {
    if (!product || !activeVariant) return;
    addItem(
      { ...product, images: activeVariant.images },
      activeVariant.color,
      selectedSize,
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4"><div className="h-8 bg-gray-200 rounded w-3/4" /><div className="h-6 bg-gray-200 rounded w-1/4" /></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Produit non trouvé</p>
          <Link to="/shop" className="mt-4 inline-block text-rose-600 font-medium">Retour à la boutique</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-rose-700 transition-colors mb-6">
          <ArrowLeft size={16} /> Retour
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* ===== LEFT: IMAGE GALLERY ===== */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-rose-50 group">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out ${imageTransition ? 'opacity-0' : 'opacity-100'}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={64} className="text-rose-200" />
                </div>
              )}
              {/* Nav arrows */}
              {currentImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors opacity-0 group-hover:opacity-100">
                    <ChevronLeft size={20} className="text-gray-700" />
                  </button>
                  <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors opacity-0 group-hover:opacity-100">
                    <ChevronRight size={20} className="text-gray-700" />
                  </button>
                </>
              )}
              {/* Image counter */}
              {currentImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                  {mainImageIdx + 1} / {currentImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {currentImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setMainImageIdx(idx); setImageTransition(true); setTimeout(() => setImageTransition(false), 300); }}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      mainImageIdx === idx ? 'border-rose-600 ring-2 ring-rose-200' : 'border-gray-200 hover:border-rose-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== RIGHT: PRODUCT OPTIONS ===== */}
          <div>
            <div className="mb-2">
              <span className="text-sm text-rose-600 font-medium tracking-wider">
                {product.categories?.name || 'Collection'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>{product.name}</h1>
            {product.name_ar && <p className="text-lg text-gray-500 mt-1" dir="rtl">{product.name_ar}</p>}
            <p className="text-3xl font-bold text-rose-700 mt-4">{product.price?.toLocaleString()} DA</p>

            <div className="mt-6 space-y-6">
              {/* ===== COLOR SELECTOR ===== */}
              {variants.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Couleur: <span className="text-rose-700 font-semibold">{activeVariant?.color}</span>
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {variants.map((v, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleColorChange(idx)}
                        className={`relative w-11 h-11 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                          activeVariantIdx === idx
                            ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-900 scale-110'
                            : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                        }`}
                        style={{ backgroundColor: v.colorCode }}
                        title={v.color}
                      >
                        {activeVariantIdx === idx && (
                          <Check size={16} className={`${
                            // Use white check on dark colors, dark on light colors
                            ['#FFFFFF', '#F5F5DC', '#FFD700', '#C0C0C0', '#FF69B4'].includes(v.colorCode) ? 'text-gray-800' : 'text-white'
                          } drop-shadow`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== SIZE SELECTOR ===== */}
              {product.sizes?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Pointure: <span className="text-rose-700 font-semibold">{selectedSize}</span>
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-xl text-sm border-2 transition-all duration-200 flex items-center justify-center ${
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
                <label className="text-sm font-medium text-gray-700 mb-3 block">Quantité</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 rounded-xl font-medium tracking-wider transition-all flex items-center justify-center gap-2 ${
                    added ? 'bg-green-600 text-white' : product.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-rose-700 hover:bg-rose-800 text-white hover:shadow-lg hover:shadow-rose-200'
                  }`}
                >
                  {added ? <><Check size={20} /> Ajouté !</> : <><ShoppingBag size={20} /> AJOUTER AU PANIER</>}
                </button>
                <button className="w-14 h-14 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-rose-50 hover:border-rose-300 transition-colors">
                  <Heart size={20} className="text-gray-400" />
                </button>
              </div>

              {product.stock <= 5 && product.stock > 0 && <p className="text-amber-600 text-sm font-medium">⚠ Plus que {product.stock} en stock</p>}
              {product.stock === 0 && <p className="text-red-600 text-sm font-medium">Rupture de stock</p>}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
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