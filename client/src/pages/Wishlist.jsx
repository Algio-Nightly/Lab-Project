import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, ShoppingBag, Trash2, ArrowRight, ArrowLeft, 
  Sparkles, Loader2, PackageOpen, CheckCircle, Tag, ShieldCheck,
  AlertCircle, RefreshCw, Check
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function WishlistPage() {
  const { wishlist, wishlistCount, loading, error, removeFromWishlist, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addedCartIds, setAddedCartIds] = useState([]);
  const [removingId, setRemovingId] = useState(null);

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const productId = product._id || product.id || product;
    await addToCart(product, 1);
    setAddedCartIds((prev) => [...prev, productId]);
    setTimeout(() => {
      setAddedCartIds((prev) => prev.filter((id) => id !== productId));
    }, 1500);
  };

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    await removeFromWishlist(productId);
    setRemovingId(null);
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Sign in to view your Wishlist</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Save your favorite items across devices and get notified about price drops and deals.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link 
              to="/login"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-600/20"
            >
              Sign In
            </Link>
            <Link 
              to="/register"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 text-red-500 rounded-2xl">
              <Heart className="w-6 h-6 fill-red-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                My Wishlist
                <span className="text-xs bg-red-100 text-red-700 font-bold px-2.5 py-0.5 rounded-full">
                  {wishlistCount} {wishlistCount === 1 ? 'product saved' : 'products saved'}
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Save products you love and find them here later.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 transition"
        >
          <Sparkles className="w-3.5 h-3.5" /> Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Loading State (Lab-04 Task 7 & Section 10) */}
      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600 font-semibold">Loading your wishlist...</p>
        </div>
      )}

      {/* Error State (Lab-04 Task 7 & Section 11) */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-red-800">Something went wrong.</h3>
            <p className="text-sm text-red-600">We couldn't load your wishlist.</p>
          </div>
          <button 
            onClick={refreshWishlist}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      )}

      {/* Empty State (Lab-04 Task 7 & Section 9) */}
      {!loading && !error && wishlist.length === 0 && (
        <div className="bg-white rounded-3xl p-12 sm:p-16 border border-gray-100 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="w-20 h-20 bg-red-50 text-red-400 rounded-3xl flex items-center justify-center mx-auto text-3xl">
            ❤️
          </div>
          <h3 className="text-2xl font-black text-gray-900">Your wishlist is empty</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            Save products you love and find them here later.
          </p>
          <div className="pt-2">
            <Link 
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition"
            >
              Browse Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Wishlist Grid (Lab-04 Task 6 & Section 7 Specification) */}
      {!loading && !error && wishlist.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const productId = product._id || product.id;
            const isAdded = addedCartIds.includes(productId);
            const isRemoving = removingId === productId;
            const inStock = product.stock !== undefined ? product.stock > 0 : true;

            return (
              <div 
                key={productId}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Remove button */}
                  <div className="relative h-48 bg-gray-50 overflow-hidden">
                    <img 
                      src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-gray-700 shadow-sm">
                      {product.category || 'General'}
                    </span>

                    <button 
                      onClick={() => handleRemove(productId)}
                      disabled={isRemoving}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/95 backdrop-blur-md text-red-500 hover:bg-red-50 transition shadow-sm border border-gray-100 disabled:opacity-50"
                      title="Remove from Wishlist"
                    >
                      {isRemoving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <Link to={`/products/${productId}`}>
                      <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                    </Link>

                    {/* Section 7 Required: Stock Status */}
                    <div className="text-xs">
                      {inStock ? (
                        <span className="text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {product.stock !== undefined ? `${product.stock} units left` : 'In Stock'}
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold text-[11px]">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Card Actions (Section 7 Specification: View Details + Remove/Cart) */}
                <div className="p-5 pt-0 border-t border-gray-50 mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Price</span>
                      <span className="text-lg font-black text-gray-900">
                        ₹{product.price}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleRemove(productId)}
                      className="text-xs text-red-500 hover:text-red-700 font-bold transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove ♥
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to={`/products/${productId}`}
                      className="py-2.5 px-3 rounded-xl text-center text-xs font-bold text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 transition"
                    >
                      View Details
                    </Link>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={!inStock}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                        isAdded 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {isAdded ? 'Added' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
