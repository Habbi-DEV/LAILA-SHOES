import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { normalizeColors } from '../lib/colorUtils';

export default function ProductCard({ product }) {
  const colors = normalizeColors(product);

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-rose-50 aspect-[3/4] mb-3">
        {product.images && product.images[0] ? (
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={48} className="text-rose-200" /></div>
        )}
        {product.featured && <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs px-3 py-1 rounded-full font-medium">Nouveau</span>}
        {product.stock <= 5 && product.stock > 0 && <span className="absolute top-3 right-3 bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-medium">Stock limité</span>}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium text-sm">Rupture de stock</span></div>
        )}
      </div>
      <div className="px-1">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-rose-700 transition-colors truncate">{product.name}</h3>
        {product.name_ar && <p className="text-xs text-gray-500 mt-0.5" dir="rtl">{product.name_ar}</p>}
        <p className="text-rose-700 font-bold mt-1">{product.price?.toLocaleString()} DA</p>
        {/* Color swatches */}
        {colors.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {colors.slice(0, 5).map((c, i) => (
              <div key={i} className="w-4 h-4 rounded-full border border-gray-200 transition-transform hover:scale-125" style={{ backgroundColor: c.hex }} title={c.name} />
            ))}
            {colors.length > 5 && <span className="text-xs text-gray-400 ml-1">+{colors.length - 5}</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
