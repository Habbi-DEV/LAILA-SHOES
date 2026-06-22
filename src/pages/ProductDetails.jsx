import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Check, Minus, Plus, Heart, Share2, X, ZoomIn, ChevronLeft, ChevronRight, Home, Copy, MessageCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../contexts/CartContext';
import { normalizeColors, getColorImages } from '../lib/colorUtils';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);
  const [added, setAdded] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [showMobileBar, setShowMobileBar] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setLoading(true);
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        const p = data.find(item => item.id === parseInt(id));
        setProduct(p);
        if (p) {
          const colors = normalizeColors(p);
          setSelectedColor(colors[0]?.name || '');
          setSelectedSize(p.sizes?.[0] || '');
          const rel = data.filter(item => item.category_id === p.category_id && item.id !== p.id).slice(0, 4);
          setRelated(rel);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Scroll detection for sticky mobile bar
  useEffect(() => {
    const handleScroll = () => setShowMobileBar(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get current images based on selected color
  const currentImages = product ? getColorImages(product, selectedColor) : [];
  const colors = product ? normalizeColors(product) : [];

  // Reset image index when color changes
  useEffect(() => { setSelectedImageIdx(0); }, [selectedColor]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, selectedColor, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${product.name} - ${product.price} DA | LAILA SHOES`;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text, url }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      } catch {}
    }
  };

  const handleWhatsApp = () => {
    const url = window.location.href;
    const text = encodeURIComponent(`✨ ${product.name} - ${product.price?.toLocaleString()} DA\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const openLightbox = (idx) => {
    setLightboxIdx(idx);
    setLightbox(true);
    setZoomed(false);
  };

  const closeLightbox = () => {
    setLightbox(false);
    setZoomed(false);
  };

  const nextLightbox = () => {
    setLightboxIdx((lightboxIdx + 1) % currentImages.length);
    setZoomed(false);
  };

  const prevLightbox = () => {
    setLightboxIdx((lightboxIdx - 1 + currentImages.length) % currentImages.length);
    setZoomed(false);
  };

  // Stock urgency
  const getStockAlert = () => {
    if (!product) return null;
    const s = product.stock;
    if (s === 0) return { text: 'غير متوفر حالياً', subtext: 'Rupture de stock', type: 'out' };
    if (s <= 3) return { text: `إنتاج محدود - متبقي ${s} قطع فقط!`, subtext: `Plus que ${s} en stock!`, type: 'critical' };
    if (s <= 5) return { text: `متبقي ${s} قطع فقط`, subtext: `Stock limité - ${s} restants`, type: 'low' };
    if (s <= 15) return { text: 'الكمية محدودة', subtext: 'Quantité limitée', type: 'medium' };
    return { text: 'متوفر في المخزون', subtext: 'En stock', type: 'healthy' };
  };

  const stockAlert = getStockAlert();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid md:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
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
          <Link to="/shop" className="mt-4 inline-block text-rose-600 hover:text-rose-700 font-medium">Retour à la boutique</Link>
        </div>
      </div>
    );
  }

  const categorySlug = product.categories?.slug || '';
  const categoryName = product.categories?.name || 'Collection';

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
          <Link to="/" className="hover:text-rose-600 transition-colors flex items-center gap-1">
            <Home size={13} /> Accueil
          </Link>
          <span>/</span>
          <Link to={`/shop?category=${categorySlug}`} className="hover:text-rose-600 transition-colors">{categoryName}</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

          {/* ===== IMAGE GALLERY ===== */}
          <div>
            {/* Main Image */}
            <div
              className="aspect-square rounded-2xl overflow-hidden bg-rose-50 mb-4 relative cursor-zoom-in group"
              onClick={() => openLightbox(selectedImageIdx)}
            >
              {currentImages[selectedImageIdx] ? (
                <img
                  src={currentImages[selectedImageIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={64} className="text-rose-200" />
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={18} className="text-gray-700" />
              </div>
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold">Rupture de stock</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {currentImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                      selectedImageIdx === idx ? 'border-rose-600 shadow-md' : 'border-transparent hover:border-rose-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== PRODUCT INFO ===== */}
          <div className="flex flex-col">
            {/* Category badge */}
            <span className="text-sm text-rose-600 font-medium tracking-wider mb-2">{categoryName}</span>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>{product.name}</h1>
            {product.name_ar && <p className="text-lg text-gray-500 mt-1" dir="rtl">{product.name_ar}</p>}

            {/* Price */}
            <p className="text-3xl font-bold text-rose-700 mt-4">{product.price?.toLocaleString()} DA</p>

            {/* Stock Alert */}
            {stockAlert && (
              <div className={`mt-4 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
                stockAlert.type === 'out' ? 'bg-red-50 text-red-700 border border-red-100' :
                stockAlert.type === 'critical' ? 'bg-red-50 text-red-700 border border-red-100 animate-pulse' :
                stockAlert.type === 'low' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                stockAlert.type === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                'bg-green-50 text-green-700 border border-green-100'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  stockAlert.type === 'out' || stockAlert.type === 'critical' ? 'bg-red-500' :
                  stockAlert.type === 'low' || stockAlert.type === 'medium' ? 'bg-amber-500' :
                  'bg-green-500'
                }`} />
                <span dir="rtl">{stockAlert.text}</span>
                <span className="text-xs opacity-70">• {stockAlert.subtext}</span>
              </div>
            )}

            <div className="mt-6 space-y-6 flex-1">

              {/* ===== COLOR SWATCHES ===== */}
              {colors.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Couleur: <span className="text-rose-700 font-semibold">{selectedColor}</span>
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {colors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className="group/swatch flex flex-col items-center gap-1.5"
                        title={color.name}
                      >
                        <div className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor === color.name
                            ? 'border-rose-600 scale-110 shadow-lg'
                            : 'border-gray-200 hover:border-rose-400 hover:scale-105'
                        }`} style={{ backgroundColor: color.hex }}>
                          {selectedColor === color.name && (
                            <Check size={16} className={color.hex === '#1a1a1a' || color.hex === '#6b3a2a' || color.hex === '#c0392b' ? 'text-white' : 'text-gray-800'} strokeWidth={3} />
                          )}
                        </div>
                        <span className={`text-[10px] transition-colors ${selectedColor === color.name ? 'text-rose-700 font-semibold' : 'text-gray-400'}`}>
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== SIZES ===== */}
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
                        className={`w-12 h-12 rounded-xl text-sm border-2 transition-all flex items-center justify-center font-medium ${
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

              {/* ===== QUANTITY ===== */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Quantité</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* ===== ACTION BUTTONS ===== */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 rounded-xl font-medium tracking-wider transition-all flex items-center justify-center gap-2 ${
                    added
                      ? 'bg-green-600 text-white'
                      : product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-rose-700 hover:bg-rose-800 text-white hover:shadow-lg hover:shadow-rose-200'
                  }`}
                >
                  {added ? <><Check size={20} /> Ajouté !</> : <><ShoppingBag size={20} /> AJOUTER AU PANIER</>}
                </button>
                <button className="w-14 h-14 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-rose-50 hover:border-rose-300 transition-colors">
                  <Heart size={20} className="text-gray-400" />
                </button>
              </div>

              {/* ===== SHARE ===== */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-gray-400">Partager:</span>
                <button onClick={handleWhatsApp} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium transition-colors">
                  <MessageCircle size={14} /> WhatsApp
                </button>
                <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium transition-colors">
                  <Share2 size={14} /> Copier le lien
                </button>
              </div>
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

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'serif' }}>Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* ===== MOBILE STICKY BAR ===== */}
      {showMobileBar && product.stock > 0 && !added && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-4 shadow-2xl">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
            <p className="text-rose-700 font-bold">{product.price?.toLocaleString()} DA</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-rose-700 hover:bg-rose-800 text-white px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 flex-shrink-0"
          >
            <ShoppingBag size={16} /> Ajouter
          </button>
        </div>
      )}

      {/* ===== LIGHTBOX ===== */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={closeLightbox}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm text-white/60">{lightboxIdx + 1} / {currentImages.length}</span>
            <button onClick={closeLightbox} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center px-4 relative" onClick={e => e.stopPropagation()}>
            {currentImages[lightboxIdx] && (
              <img
                src={currentImages[lightboxIdx]}
                alt=""
                className={`max-w-full max-h-[70vh] object-contain transition-transform duration-300 cursor-zoom-in ${zoomed ? 'scale-[2.5] cursor-zoom-out' : ''}`}
                onClick={e => { e.stopPropagation(); setZoomed(!zoomed); }}
              />
            )}

            {/* Nav arrows */}
            {currentImages.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); prevLightbox(); }} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={e => { e.stopPropagation(); nextLightbox(); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {currentImages.length > 1 && (
            <div className="flex gap-2 justify-center px-4 py-4 overflow-x-auto" onClick={e => e.stopPropagation()}>
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setLightboxIdx(idx); setZoomed(false); }}
                  className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                    lightboxIdx === idx ? 'border-white' : 'border-white/20 opacity-50 hover:opacity-80'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share Toast */}
      {shareToast && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm animate-fade-in">
          <CheckCircle size={16} className="text-green-400" /> Lien copié!
        </div>
      )}
    </div>
  );
}
