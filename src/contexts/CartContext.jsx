import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext({
  items: [], isOpen: false, setIsOpen: () => {},
  addItem: () => {}, removeItem: () => {}, updateQuantity: () => {}, clearCart: () => {},
  totalItems: 0, totalPrice: 0
});

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('laila_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('laila_cart', JSON.stringify(items));
    } catch {
      // localStorage might be full or unavailable
    }
  }, [items]);

  const addItem = (product, color, size, quantity = 1) => {
    try {
      setItems(prev => {
        const existing = prev.find(
          i => i.product_id === product.id && i.color === color && i.size === size
        );
        if (existing) {
          return prev.map(i =>
            i.product_id === product.id && i.color === color && i.size === size
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, {
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          image: product.images?.[0] || '',
          color,
          size,
          quantity
        }];
      });
      setIsOpen(true);
    } catch (err) {
      console.error('Cart add error:', err);
    }
  };

  const removeItem = (productId, color, size) => {
    setItems(prev => prev.filter(
      i => !(i.product_id === productId && i.color === color && i.size === size)
    ));
  };

  const updateQuantity = (productId, color, size, quantity) => {
    if (quantity <= 0) {
      removeItem(productId, color, size);
      return;
    }
    setItems(prev => prev.map(i =>
      i.product_id === productId && i.color === color && i.size === size
        ? { ...i, quantity }
        : i
    ));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const totalPrice = items.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 0)), 0);

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen,
      addItem, removeItem, updateQuantity, clearCart,
      totalItems, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
