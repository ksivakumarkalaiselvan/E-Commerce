import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Sync with backend on login
  useEffect(() => {
    const syncBackendCart = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.cart) {
          // If local items exist that aren't on server, sync them
          if (cartItems.length > 0 && (!data.cart.items || data.cart.items.length === 0)) {
            await fetch('/api/cart/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ items: cartItems }),
            });
          } else if (data.cart.items && data.cart.items.length > 0) {
            setCartItems(data.cart.items);
          }
        }
      } catch (err) {
        console.error('Error fetching backend cart:', err);
      }
    };

    syncBackendCart();
  }, [token]);

  // Persist guest cart locally
  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('aura_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('aura_coupon');
    }
  }, [coupon]);

  const addToCart = async (product, quantity = 1) => {
    quantity = Number(quantity) || 1;
    const productId = product._id || product.id;

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => (item.product || item._id) === productId);
      if (existing) {
        return prevItems.map((item) =>
          (item.product || item._id) === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            product: productId,
            _id: productId,
            name: product.name,
            price: product.price,
            image: product.images ? product.images[0] : product.image,
            quantity,
          },
        ];
      }
    });

    addToast({ message: `Added "${product.name}" to cart!`, type: 'success' });

    // Sync with backend if logged in
    if (token) {
      try {
        await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity }),
        });
      } catch (err) {
        console.error('Failed to sync item to backend cart:', err);
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    quantity = Math.max(0, Number(quantity));

    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        (item.product || item._id) === productId ? { ...item, quantity } : item
      )
    );

    if (token) {
      try {
        await fetch('/api/cart/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity }),
        });
      } catch (err) {
        console.error('Failed to update cart quantity on server:', err);
      }
    }
  };

  const removeFromCart = async (productId) => {
    setCartItems((prev) => prev.filter((item) => (item.product || item._id) !== productId));
    addToast({ message: 'Item removed from cart', type: 'info' });

    if (token) {
      try {
        await fetch(`/api/cart/remove/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Failed to remove item on server:', err);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    setCoupon(null);
    localStorage.removeItem('aura_cart');
    localStorage.removeItem('aura_coupon');

    if (token) {
      try {
        await fetch('/api/cart/clear', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Failed to clear cart on server:', err);
      }
    }
  };

  const applyCoupon = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'SAVE10') {
      const newCoupon = { code: 'SAVE10', discountPercent: 10, label: '10% OFF' };
      setCoupon(newCoupon);
      addToast({ message: 'Promo code SAVE10 applied! (10% discount)', type: 'success' });
      return { success: true };
    } else if (cleanCode === 'AURA20') {
      const newCoupon = { code: 'AURA20', discountPercent: 20, label: '20% VIP OFF' };
      setCoupon(newCoupon);
      addToast({ message: 'Promo code AURA20 applied! (20% discount)', type: 'success' });
      return { success: true };
    } else {
      addToast({ message: 'Invalid promo code. Try "SAVE10" or "AURA20".', type: 'error' });
      return { success: false, message: 'Invalid promo code' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    addToast({ message: 'Coupon removed', type: 'info' });
  };

  // Financial calculations
  const itemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Number(
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );

  const freeShippingThreshold = 150;
  const shipping = subtotal === 0 ? 0 : subtotal >= freeShippingThreshold ? 0 : 15;
  const tax = Number((subtotal * 0.08).toFixed(2)); // 8% estimated tax

  const discountAmount = coupon
    ? Number(((subtotal * coupon.discountPercent) / 100).toFixed(2))
    : 0;

  const total = Number(Math.max(0, subtotal - discountAmount + shipping + tax).toFixed(2));
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemsCount,
        subtotal,
        shipping,
        tax,
        coupon,
        discountAmount,
        total,
        freeShippingThreshold,
        progressToFreeShipping,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
