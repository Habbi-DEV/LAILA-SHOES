import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[85vw] sm:w-full sm:max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-rose-700" />
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Mon Panier</h2>
              <span className="text-xs sm:text-sm text-gray-500">({totalItems})</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingBag size={48} className="mb-3 opacity-30" />
                <p className="text-base mb-1">Votre panier est vide</p>
                <p className="text-sm">Découvrez nos collections</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={`${item.product_id}-${item.color}-${item.size}-${idx}`} className="flex gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-rose-50">
                      {item.image ? (
                        <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-rose-300">
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.product_name}</h3>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        {item.color && <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] sm:text-xs">{item.color}</span>}
                        {item.size && <span className="bg-gray-200 px-1.5 py-0.5 rounded text-[10px] sm:text-xs">{item.size}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.color, item.size, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-xs sm:text-sm font-medium w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.color, item.size, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-rose-700">{item.price * item.quantity} DA</span>
                          <button
                            onClick={() => removeItem(item.product_id, item.color, item.size)}
                            className="p-1 text-gray-400 hover:text-red-500 active:text-red-600 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-rose-100 px-4 sm:px-6 py-3 sm:py-4 space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sous-total</span>
                <span className="text-base sm:text-lg font-bold text-gray-900">{totalPrice.toLocaleString()} DA</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400">Livraison calculée à l'étape suivante</p>
              <Link
                to="/checkout"
                onClick={() => setIsOpen(false)}
                className="block w-full bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white text-center py-3 rounded-xl font-medium tracking-wider transition-colors text-sm sm:text-base"
              >
                COMMANDER
              </Link>
              <button
                onClick={clearCart}
                className="block w-full text-center text-xs sm:text-sm text-gray-400 hover:text-red-500 transition-colors py-1"
              >
                Vider le panier
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}