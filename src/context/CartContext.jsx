import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, selectedSize = null) => {
    setCartItems(prev => {
      // Match by both ID and size (if size exists)
      const existingItem = prev.find(item =>
        item.id === product.id &&
        (selectedSize ? item.selectedSize === selectedSize : !item.selectedSize)
      );

      if (existingItem) {
        return prev.map(item =>
          (item.id === product.id &&
            (selectedSize ? item.selectedSize === selectedSize : !item.selectedSize))
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Add new item with selectedSize
      return [...prev, { ...product, quantity: 1, selectedSize }];
    });
  };

  const removeFromCart = (productId, selectedSize = null) => {
    setCartItems(prev => prev.filter(item =>
      !(item.id === productId &&
        (selectedSize ? item.selectedSize === selectedSize : !item.selectedSize))
    ));
  };

  const updateQuantity = (productId, quantity, selectedSize = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        (item.id === productId &&
          (selectedSize ? item.selectedSize === selectedSize : !item.selectedSize))
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
