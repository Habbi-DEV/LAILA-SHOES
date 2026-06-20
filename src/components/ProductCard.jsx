import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export default function ProductCard({ product }) {
  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-rose-50 aspect-[3/4] mb-2 sm:mb-3">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={36} className="text-rose-200" />
          </div>
        )}
        {product.featured && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-rose-600 text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-medium">Nouveau</span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-amber-500 text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-medium">Stock limité</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium text-xs sm:text-sm">Rupture</span>
          </div>
        )}
      </div>
      <div className="px-0.5 sm:px-1">
        <h3 className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-rose-700 transition-colors truncate">{product.name}</h3>
        {product.name_ar && (
          <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5" dir="rtl">{product.name_ar}</p>
        )}
        <p className="text-rose-700 font-bold text-sm sm:text-base mt-0.5 sm:mt-1">{product.price?.toLocaleString()} DA</p>
      </div>
    </Link>
  );
}