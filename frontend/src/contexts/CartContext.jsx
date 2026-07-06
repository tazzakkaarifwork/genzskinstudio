import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item && item.product && item.product._id);
        }
        return [];
      } catch (err) {
        console.error('Error parsing cart from localStorage:', err);
        return [];
      }
    }
    return [];
  });
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));

    // Sync cart details to visitor session
    const syncCartSession = async () => {
      try {
        const items = cartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          price: getProductPrice(item.product),
          quantity: item.quantity,
          image: item.product.image || item.product.images?.[0] || '',
        }));
        const total = getCartTotal();

        const { trackSession } = await import('../services/analytics');
        trackSession({
          cartItems: items,
          cartTotal: total
        });
      } catch (err) {
        console.warn('Failed to sync cart session:', err);
      }
    };
    syncCartSession();
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product || !product._id) {
      console.warn('Invalid product added to cart:', product);
      return;
    }
    const qty = Number(quantity) || 1;
    setCartItems(prev => {
      const validPrev = prev.filter(item => item && item.product && item.product._id);
      const existing = validPrev.find(item => item.product._id === product._id);
      if (existing) {
        return validPrev.map(item =>
          item.product._id === product._id
            ? { ...item, quantity: (Number(item.quantity) || 0) + qty }
            : item
        );
      }
      return [...validPrev, { product, quantity: qty }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (productId) => {
    if (!productId) return;
    setCartItems(prev => prev.filter(item => item && item.product && item.product._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (!productId) return;
    const qty = Number(quantity) || 0;
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev
        .filter(item => item && item.product && item.product._id)
        .map(item =>
          item.product._id === productId ? { ...item, quantity: qty } : item
        )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getProductPrice = (product) => {
    if (!product) return 0;
    const price = Number(product.price) || 0;
    const discountPercent = Number(product.discountPercent) || 0;
    const hasDiscount = discountPercent > 0 && (!product.offerExpiresAt || new Date(product.offerExpiresAt) > new Date());
    return hasDiscount ? price - (price * discountPercent / 100) : price;
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = getProductPrice(item?.product);
      const qty = Number(item?.quantity) || 0;
      return total + (price * qty);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + (Number(item?.quantity) || 0), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartOpen,
      setCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      getProductPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
};