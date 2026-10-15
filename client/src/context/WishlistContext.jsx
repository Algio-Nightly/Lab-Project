import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      setWishlistIds([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/wishlist');
      const items = res.data.wishlist || res.data.products || [];
      const ids = res.data.productIds || items.map((p) => (p._id ? p._id.toString() : p.toString()));
      setWishlist(items);
      setWishlistIds(ids);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err.response?.data?.message || 'Unable to load your wishlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const addToWishlist = async (product) => {
    if (!user) return { requireAuth: true };

    const productId = typeof product === 'object' && product !== null ? (product._id || product.id) : product;
    if (!productId) return { success: false };

    try {
      const res = await axiosInstance.post(`/wishlist/${productId}`);
      const items = res.data.wishlist || res.data.products || [];
      setWishlist(items);
      setWishlistIds(items.map((p) => (p._id ? p._id.toString() : p.toString())));
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      return {
        success: false,
        status: err.response?.status,
        error: err.response?.data?.message || err.message,
      };
    }
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      return { requireAuth: true };
    }

    const productId = typeof product === 'object' && product !== null ? (product._id || product.id) : product;
    if (!productId) return { success: false };

    // Optimistic UI update
    const isCurrentlyWishlisted = wishlistIds.includes(productId.toString());

    if (isCurrentlyWishlisted) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId.toString()));
      setWishlist((prev) => prev.filter((p) => (p._id || p.id).toString() !== productId.toString()));
    } else {
      setWishlistIds((prev) => [...prev, productId.toString()]);
      if (typeof product === 'object') {
        setWishlist((prev) => [product, ...prev]);
      }
    }

    try {
      const res = await axiosInstance.post(`/wishlist/toggle/${productId}`);
      const items = res.data.wishlist || res.data.products;
      if (items) {
        setWishlist(items);
        setWishlistIds(items.map((p) => (p._id ? p._id.toString() : p.toString())));
      }
      return { success: true, inWishlist: res.data.inWishlist };
    } catch (err) {
      console.error('Error toggling wishlist:', err);
      // Revert optimistic update on error
      fetchWishlist();
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user || !productId) return;

    // Optimistic removal
    setWishlistIds((prev) => prev.filter((id) => id !== productId.toString()));
    setWishlist((prev) => prev.filter((p) => (p._id || p.id).toString() !== productId.toString()));

    try {
      const res = await axiosInstance.delete(`/wishlist/${productId}`);
      const items = res.data.wishlist || res.data.products;
      if (items) {
        setWishlist(items);
        setWishlistIds(items.map((p) => (p._id ? p._id.toString() : p.toString())));
      }
      return { success: true };
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      fetchWishlist();
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const isWishlisted = (productId) => {
    if (!productId) return false;
    return wishlistIds.includes(productId.toString());
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        wishlistCount: wishlistIds.length,
        loading,
        error,
        addToWishlist,
        toggleWishlist,
        removeFromWishlist,
        isWishlisted,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
