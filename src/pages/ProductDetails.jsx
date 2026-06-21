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
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        const p = data.find(item => item.id === parseInt(id));
        setProduct(p);
        if (p) {
          // 1. تحديد اللون الافتراضي الأول عند تحميل الصفحة
          const initialColor = p.variants?.[0]?.color || p.colors?.[0] || '';
          setSelectedColor(initialColor);
          
          setSelectedSize(p.sizes?.[0] || '');
          setSelectedImage(0);
          
          const rel = data.filter(item => item.category_id === p.category_id && item.id !== p.id).slice(0, 4);
          setRelated(rel);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // 2. تحديث زوايا وصور المعرض تلقائياً عند تغيير اللون المختار
  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, selectedColor, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid md:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
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

  // 3. المنطق السحري لفرز الصور:
  // إذا كان المنتج يحتوي على نظام variants المتقدم، سنأخذ صور اللون المختار حالياً فقط.
  // وإذا لم يكن يحتوي عليها (منتج قديم مثلاً)، سيعود تلقائياً للمصفوفة العامة القديمة `product.images` لضمان عدم تعطل الموقع.
  const currentVariant = product.variants?.find(v => v.color === selectedColor);
  const images = currentVariant && Array.isArray(currentVariant.images) && currentVariant.images.length > 0
    ? currentVariant.images 
    : (Array.isArray(product.images) ? product.images : []);

  const colors = Array.isArray(product.colors) ? product.colors : [];
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-rose-700 transition-colors mb-6">
          <ArrowLeft size={16} /> Retour à la boutique
        </Link>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* قسم معرض الصور المتطور */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-rose-50 mb-4 border border-gray-100 shadow-sm relative">
              {images[selectedImage] ? (
                <img 
                  src={images[selectedImage]} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-all duration-500 ease-in-out"
                  key={images[selectedImage]} // الـ key هنا يجبر الصورة على عمل تأثير تلاشي (fade-in) ناعم عند التغيير
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={64} className="text-rose-200" /></div>
              )}
            </div>
            
            {/* عرض زوايا التصوير المتعددة للون المحدد فقط */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-rose-200">
                {images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(idx)} 
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${selectedImage === idx ? 'border-rose-600 ring-2 ring-rose-600/20 scale-95' : 'border-gray-200 hover:border-rose-300'}`}
                  >
                    <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* قسم تفاصيل المنتج والخيارات */}
          <div>
            <div className="mb-2"><span className="text-sm text-rose-600 font-medium tracking-wider">{product.categories?.name || 'Collection'}</span></div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: 'serif' }}>{product.name}</h1>
            {product.name_ar && <p className="text-lg text-gray-500 mt-1" dir="rtl">{product.name_ar}</p>}
            <p className="text-3xl font-bold text-rose-700 mt-4">{Number(product.price).toLocaleString()} DA</p>

            <div className="mt-6 space-y-6">
              {/* خيارات الألوان المتطورة */}
              {colors.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Couleur: <span className="text-rose-700 font-bold">{selectedColor}</span></label>
                  <div className="flex flex-wrap gap-3">
                    {colors.map(color => {
                      // محاولة البحث عن كود اللون (Hex) المرفوع من لوحة التحكم لتلوين الخلفية بشكل احترافي، وإلا يظهر كزر نصي أنيق
                      const variantData = product.variants?.find(v => v.color === color);
                      const hasColorCode = variantData && variantData.colorCode;

                      return (
                        <button 
                          key={color} 
                          onClick={() => setSelectedColor(color)} 
                          className={`px-4 py-2 rounded-xl text-sm border-2 transition-all duration-200 flex items-center gap-2 ${selectedColor === color ? 'border-rose-600 bg-rose-50 text-rose-700 font-medium shadow-sm ring-2 ring-rose-600/10' : 'border-gray-200 hover:border-rose-300 text-gray-700 bg-white'}`}
                        >
                          {hasColorCode && (
                            <span 
                              className="w-4 h-4 rounded-full border border-black/10 inline-block" 
                              style={{ backgroundColor: variantData.colorCode }} 
                            />
                          )}
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* خيارات المقاسات */}
              {sizes.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Pointure: <span className="text-rose-700 font-bold">{selectedSize}</span></label>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map(size => <button key={size} onClick={() => setSelectedSize(size)} className={`w-12 h-12 rounded-xl text-sm border-2 transition-all flex items-center justify-center ${selectedSize === size ? 'border-rose-600 bg-rose-50 text-rose-700 font-bold shadow-sm' : 'border-gray-200 hover:border-rose-300 text-gray-700 bg-white'}`}>{size}</button>)}
                  </div>
                </div>
              )}

              {/* كمية المنتج */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Quantité</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 bg-white"><Minus size={16} /></button>
                  <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-50 bg-white"><Plus size={16} /></button>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-3">
                <button onClick={handleAddToCart} disabled={product.stock === 0} className={`flex-1 py-4 rounded-xl font-medium tracking-wider transition-all flex items-center justify-center gap-2 ${added ? 'bg-green-600 text-white' : product.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-rose-700 hover:bg-rose-800 text-white hover:shadow-lg hover:shadow-rose-200'}`}>
                  {added ? <><Check size={20} /> Ajouté !</> : <><ShoppingBag size={20} /> AJOUTER AU PANIER</>}
                </button>
                <button className="w-14 h-14 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-rose-50 hover:border-rose-300 transition-colors bg-white"><Heart size={20} className="text-gray-400" /></button>
              </div>

              {product.stock <= 5 && product.stock > 0 && <p className="text-amber-600 text-sm font-medium">⚠ Plus que {product.stock} en stock</p>}
              {product.stock === 0 && <p className="text-red-600 text-sm font-medium">Rupture de stock</p>}
            </div>

            {product.description && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'serif' }}>Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">{related.map(p => <ProductCard key={p.id} product={p} />)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
