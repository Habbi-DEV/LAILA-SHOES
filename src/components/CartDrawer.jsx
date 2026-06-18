import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-rose-700" />
              <h2 className="text-lg font-semibold text-gray-900">Mon Panier</h2>
              <span className="text-sm text-gray-500">({totalItems})</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <ShoppingBag size={64} className="mb-4 opacity-30" />
                <p className="text-lg mb-2">Votre panier est vide</p>
                <p className="text-sm">Découvrez nos collections</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={`${item.product_id}-${item.color}-${item.size}-${idx}`} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-rose-50">
                      {item.image ? (
                        <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-rose-300">
                          <ShoppingBag size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.product_name}</h3>
                      <div className="flex gap-2 mt-1 text-xs text-gray-500">
                        {item.color && <span className="bg-gray-200 px-2 py-0.5 rounded">{item.color}</span>}
                        {item.size && <span className="bg-gray-200 px-2 py-0.5 rounded">{item.size}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.color, item.size, item.quantity - 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.color, item.size, item.quantity + 1)}
                            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-rose-700">{item.price * item.quantity} DA</span>
                          <button
                            onClick={() => removeItem(item.product_id, item.color, item.size)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
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
            <div className="border-t border-rose-100 px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span className="text-lg font-bold text-gray-900">{totalPrice.toLocaleString()} DA</span>
              </div>
              <p className="text-xs text-gray-400">Livraison calculée à l'étape suivante</p>
              <Link
                to="/checkout"
                onClick={() => setIsOpen(false)}
                className="block w-full bg-rose-700 hover:bg-rose-800 text-white text-center py-3 rounded-xl font-medium tracking-wider transition-colors"
              >
                COMMANDER
              </Link>
              <button
                onClick={clearCart}
                className="block w-full text-center text-sm text-gray-400 hover:text-red-500 transition-colors"
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