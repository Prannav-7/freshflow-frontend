import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

const parseWeight = (sizeStr) => {
  if (!sizeStr) return 0;
  const match = sizeStr.match(/^([\d.]+)\s*(kg|gm|g|l|ml)$/i);
  if (!match) return 0;
  let val = parseFloat(match[1]);
  let unit = match[2].toLowerCase();
  if (unit === 'kg' || unit === 'l') return val * 1000;
  return val;
};

const formatWeight = (grams, unitHint = 'kg') => {
  const isVolume = /ml|l/i.test(unitHint);
  if (grams >= 1000) {
    const val = grams / 1000;
    const formattedVal = val % 1 === 0 ? val : parseFloat(val.toFixed(2));
    return `${formattedVal}${isVolume ? 'L' : 'kg'}`;
  }
  return `${Math.round(grams)}${isVolume ? 'ml' : 'g'}`;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, selectedSize = null) => {
    setCartItems(prev => {
      const productId = String(product.id);
      const existingItemIndex = prev.findIndex(item => String(item.id) === productId);

      if (existingItemIndex !== -1) {
        const existingItem = prev[existingItemIndex];
        const newCartItems = [...prev];

        // If both have sizes, merge them into a single weight entry
        if (existingItem.selectedSize && selectedSize) {
          const existingWeight = parseWeight(existingItem.selectedSize);
          const newWeight = parseWeight(selectedSize);

          const totalWeightBase = (existingWeight * existingItem.quantity) + (newWeight * quantity);
          const totalPrice = (existingItem.price * existingItem.quantity) + (product.price * quantity);

          newCartItems[existingItemIndex] = {
            ...existingItem,
            selectedSize: formatWeight(totalWeightBase, selectedSize),
            price: totalPrice,
            quantity: 1 // Reset to 1 as we've merged the totals into the unit price/size
          };
        } else {
          // Fallback for items without sizes or missing size info
          newCartItems[existingItemIndex] = {
            ...existingItem,
            quantity: existingItem.quantity + quantity
          };
        }
        return newCartItems;
      }

      // Add new item
      return [...prev, { ...product, quantity, selectedSize }];
    });
  };

  const removeFromCart = (productId) => {
    const pId = String(productId);
    setCartItems(prev => prev.filter(item => String(item.id) !== pId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const pId = String(productId);
    setCartItems(prev =>
      prev.map(item =>
        (String(item.id) === pId)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
