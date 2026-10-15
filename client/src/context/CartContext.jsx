import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateTotals = (items) => {
    const validItems = (items || []).filter((item) => item && item.product);
    const count = validItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const price = validItems.reduce((sum, item) => {
      const p = Number(item.product?.price) || 0;
      const q = Number(item.quantity) || 0;
      return sum + p * q;
    }, 0);
    return { count, price: Number(price.toFixed(2)) };
  };

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart([]);
      setTotalItems(0);
      setTotalPrice(0);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/cart');
      const items = res.data.cart || res.data.items || [];
      setCart(items);
      const { count, price } = calculateTotals(items);
      setTotalItems(res.data.totalItems !== undefined ? res.data.totalItems : count);
      setTotalPrice(res.data.totalPrice !== undefined ? res.data.totalPrice : price);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.response?.data?.message || 'Unable to load your cart.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      return { requireAuth: true };
    }

    const productId = typeof product === 'object' && product !== null ? (product._id || product.id) : product;
    if (!productId) return { success: false, error: 'Product ID required' };

    const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);

    // Optimistic update
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => (item.product?._id || item.product?.id || item.product).toString() === productId.toString()
      );
      let updated;
      if (existingIdx > -1) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: (updated[existingIdx].quantity || 0) + qtyToAdd,
        };
      } else {
        const productObj = typeof product === 'object' ? product : { _id: productId, name: 'Product', price: 0 };
        updated = [...prev, { product: productObj, quantity: qtyToAdd, _id: Date.now().toString() }];
      }
      const { count, price } = calculateTotals(updated);
      setTotalItems(count);
      setTotalPrice(price);
      return updated;
    });

    try {
      // Standard Lab-05 endpoint: POST /cart/:productId
      const res = await axiosInstance.post(`/cart/${productId}`, {
        quantity: qtyToAdd,
      });

      const items = res.data.cart || res.data.items;
      if (items) {
        setCart(items);
      }
      if (res.data.totalItems !== undefined) {
        setTotalItems(res.data.totalItems);
      }
      if (res.data.totalPrice !== undefined) {
        setTotalPrice(res.data.totalPrice);
      }
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error('Error adding to cart:', err);
      // Revert optimistic update
      fetchCart();
      return {
        success: false,
        error: err.response?.data?.message || 'Unable to add item to cart. Please check available stock.',
      };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!user || !productId) return { success: false };

    const newQty = parseInt(quantity, 10);
    if (newQty < 1) {
      return { success: false, error: 'Quantity must be at least 1' };
    }

    // Optimistic update
    setCart((prev) => {
      const updated = prev.map((item) => {
        if ((item.product?._id || item.product?.id || item.product).toString() === productId.toString()) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
      const { count, price } = calculateTotals(updated);
      setTotalItems(count);
      setTotalPrice(price);
      return updated;
    });

    try {
      // Standard Lab-05 endpoint: PATCH /cart/:productId
      const res = await axiosInstance.patch(`/cart/${productId}`, { quantity: newQty });
      const items = res.data.cart || res.data.items;
      if (items) {
        setCart(items);
      }
      if (res.data.totalItems !== undefined) {
        setTotalItems(res.data.totalItems);
      }
      if (res.data.totalPrice !== undefined) {
        setTotalPrice(res.data.totalPrice);
      }
      return { success: true };
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      fetchCart();
      return {
        success: false,
        error: err.response?.data?.message || 'Could not update quantity.',
      };
    }
  };

  const removeFromCart = async (productId) => {
    if (!user || !productId) return;

    // Optimistic removal
    setCart((prev) => {
      const updated = prev.filter(
        (item) => (item.product?._id || item.product?.id || item.product).toString() !== productId.toString()
      );
      const { count, price } = calculateTotals(updated);
      setTotalItems(count);
      setTotalPrice(price);
      return updated;
    });

    try {
      const res = await axiosInstance.delete(`/cart/${productId}`);
      const items = res.data.cart || res.data.items;
      if (items) {
        setCart(items);
      }
      if (res.data.totalItems !== undefined) {
        setTotalItems(res.data.totalItems);
      }
      if (res.data.totalPrice !== undefined) {
        setTotalPrice(res.data.totalPrice);
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      fetchCart();
    }
  };

  const clearCart = async () => {
    if (!user) return;

    setCart([]);
    setTotalItems(0);
    setTotalPrice(0);

    try {
      await axiosInstance.delete('/cart');
    } catch (err) {
      console.error('Error clearing cart:', err);
      fetchCart();
    }
  };

  const isInCart = (productId) => {
    if (!productId) return false;
    return cart.some(
      (item) => (item.product?._id || item.product?.id || item.product).toString() === productId.toString()
    );
  };

  const getItemQuantity = (productId) => {
    if (!productId) return 0;
    const item = cart.find(
      (item) => (item.product?._id || item.product?.id || item.product).toString() === productId.toString()
    );
    return item ? item.quantity : 0;
  };

  const clearCartState = () => {
    setCart([]);
    setTotalItems(0);
    setTotalPrice(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart,
        cartCount: totalItems,
        totalItems,
        totalPrice,
        loading,
        error,
        cartError: error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        clearCartState,
        isInCart,
        getItemQuantity,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
