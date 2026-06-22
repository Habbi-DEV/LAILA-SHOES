import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Share2, Truck, Shield, RotateCcw, ChevronRight, Minus, Plus, Check } from 'lucide-react';

const MOCK_PRODUCT = {
  id: "prod_001",
  name: "Premium High Heel Shoes",
  price: 120,
  description: "Elegant and comfortable high heels, designed for modern fashion. Crafted with premium materials and attention to detail, these shoes offer both style and all-day comfort. Perfect for any occasion — from office meetings to evening events.",
  sizes: ["38", "39", "40", "41"],
  variants: [
    {
      colorName: "Red",
      colorCode: "#DC2626",
      images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80"
      ]
    },
    {
      colorName: "Yellow",
      colorCode: "#EAB308",
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80"
      ]
    },
    {
      colorName: "Black",
      colorCode: "#1C1917",
      images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
        "https://images.unsplash.com/photo-1491553895911-b00555eccce4?w=800&q=80"
      ]
    },
    {
      colorName: "White",
      colorCode: "#F5F5F4",
      images: [
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80"
      ]
    }
  ]
};

export default function ProductDetailDemo() {
  const product = MOCK_PRODUCT;

  const [selectedColor, setSelectedColor] = useState(product.variants[0].colorName);
  const [activeImage, setActiveImage] = useState(product.variants[0].images[0]);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageTransition, setImageTransition] = useState(false);

  // Get current variant based on selected color
  const currentVariant = product.variants.find(v => v.colorName === selectedColor);

  // Whenever selectedColor changes, reset activeImage to the FIRST image of that variant
  useEffect(() => {
    const variant = product.variants.find(v => v.colorName === selectedColor);
    if (variant && variant.images.length > 0) {
      setImageTransition(true);
      setTimeout(() => {
        setActiveImage(variant.images[0]);
        setTimeout(() => setImageTransition(false), 50);
      }, 150);
    }
  }, [selectedColor, product.variants]);

  const handleThumbnailClick = (img) => {
    setImageTransition(true);
    setTimeout(() => {
      setActiveImage(img);
      setTimeout(() => setImageTransition(false), 50);
    }, 150);
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white pt-20 md:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-400 mb-8">
          <span className="hover:text-stone-600 cursor-pointer">Home</span>
          <ChevronRight size={14} />
          <span className="hover:text-stone-600 cursor-pointer">Women</span>
          <ChevronRight size={14} />
          <span className="hover:text-stone-600 cursor-pointer">Heels</span>
          <ChevronRight size={14} />
          <span className="text-stone-800 font-medium">{product.name}</span>
        </nav>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">

          {/* ==================== LEFT COLUMN: Gallery ==================== */}
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Thumbnails — vertical sidebar on desktop, horizontal on mobile */}
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:max-h-[600px] pb-2 sm:pb-0 sm:pr-1">
              {currentVariant?.images.map((img, idx) => (
                <button
                  key={`${selectedColor}-${idx}`}
                  onClick={() => handleThumbnailClick(img)}
                  className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer group ${
                    activeImage === img
                      ? 'border-stone-900 shadow-md scale-[1.02]'
                      : 'border-transparent hover:border-stone-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} - ${selectedColor} - View ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {activeImage === img && (
                    <div className="absolute inset-0 border-2 border-stone-900 rounded-xl pointer-events-none" />
                  )}
                </button>
              ))}
            </div>

            {/* Main Image Display */}
            <div className="flex-1 relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 relative">
                <img
                  src={activeImage}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-300 ease-in-out ${
                    imageTransition ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
                  }`}
                />

                {/* Favorite button */}
                <button
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110"
                >
                  <Heart
                    size={20}
                    className={`transition-all duration-200 ${
                      isFavorited ? 'fill-red-500 text-red-500 scale-110' : 'text-stone-400'
                    }`}
                  />
                </button>

                {/* Share button */}
                <button className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200 hover:scale-110">
                  <Share2 size={18} className="text-stone-400" />
                </button>

                {/* Color badge */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
                  <span className="text-xs font-medium text-stone-700">{selectedColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== RIGHT COLUMN: Product Details ==================== */}
          <div className="flex flex-col">
            
            {/* Brand tag */}
            <span className="text-xs font-semibold tracking-[0.2em] text-rose-600 uppercase mb-2">LAILA SHOES</span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 leading-tight" style={{ fontFamily: 'serif' }}>
              {product.name}
            </h1>

            {/* Rating (decorative) */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(star => (
                  <svg key={star} className={`w-4 h-4 ${star <= 4 ? 'text-amber-400' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-stone-400">(128 reviews)</span>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-stone-900">${product.price}</span>
              <span className="text-lg text-stone-400 line-through">$180</span>
              <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">33% OFF</span>
            </div>

            {/* Description */}
            <p className="mt-5 text-stone-500 leading-relaxed">
              {product.description}
            </p>

            {/* Divider */}
            <div className="h-px bg-stone-200 my-6" />

            {/* ===== Color Selection ===== */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-stone-800">
                  Color
                </label>
                <span className="text-sm font-medium text-stone-600">{selectedColor}</span>
              </div>
              <div className="flex gap-3">
                {product.variants.map(variant => (
                  <button
                    key={variant.colorName}
                    onClick={() => setSelectedColor(variant.colorName)}
                    className={`relative w-10 h-10 rounded-full transition-all duration-200 hover:scale-110 ${
                      selectedColor === variant.colorName
                        ? 'ring-2 ring-offset-2 ring-stone-900 scale-110'
                        : 'ring-1 ring-stone-200 hover:ring-stone-400'
                    }`}
                    style={{ backgroundColor: variant.colorCode }}
                    title={variant.colorName}
                  >
                    {/* Check mark for white/light colors */}
                    {selectedColor === variant.colorName && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check
                          size={16}
                          className={`${
                            variant.colorName === 'White' || variant.colorName === 'Yellow'
                              ? 'text-stone-800'
                              : 'text-white'
                          }`}
                          strokeWidth={3}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ===== Size Selection ===== */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-stone-800">
                  Size (EU)
                </label>
                <button className="text-xs text-rose-600 hover:text-rose-700 font-medium underline underline-offset-2">
                  Size Guide
                </button>
              </div>
              <div className="flex gap-3">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-12 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                      selectedSize === size
                        ? 'bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-300 scale-[1.02]'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-xs text-amber-600 mt-2">Please select a size</p>
              )}
            </div>

            {/* ===== Quantity ===== */}
            <div className="mt-6">
              <label className="text-sm font-semibold text-stone-800 mb-3 block">Quantity</label>
              <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-white hover:bg-stone-50 flex items-center justify-center transition-colors shadow-sm"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-semibold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-white hover:bg-stone-50 flex items-center justify-center transition-colors shadow-sm"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* ===== Add to Cart ===== */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className={`flex-1 py-4 rounded-xl font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                  addedToCart
                    ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                    : selectedSize
                      ? 'bg-stone-900 hover:bg-stone-800 text-white shadow-lg shadow-stone-300 hover:shadow-xl hover:-translate-y-0.5'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
              >
                {addedToCart ? (
                  <><Check size={20} /> Added to Cart!</>
                ) : (
                  <><ShoppingBag size={20} /> Add to Cart — ${product.price * quantity}</>
                )}
              </button>
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                  isFavorited
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600'
                }`}
              >
                <Heart size={20} className={isFavorited ? 'fill-red-500' : ''} />
              </button>
            </div>

            {/* ===== Trust Badges ===== */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1.5 p-3 bg-stone-50 rounded-xl">
                <Truck size={18} className="text-stone-500" />
                <span className="text-[11px] font-medium text-stone-500 text-center">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 bg-stone-50 rounded-xl">
                <Shield size={18} className="text-stone-500" />
                <span className="text-[11px] font-medium text-stone-500 text-center">2 Year Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-3 bg-stone-50 rounded-xl">
                <RotateCcw size={18} className="text-stone-500" />
                <span className="text-[11px] font-medium text-stone-500 text-center">Easy Returns</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
