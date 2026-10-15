import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, 
  Tag, Star, CheckCircle, AlertCircle, Loader2, Plus, Minus, Share2 
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { axiosInstance } from '../services/api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        setProduct(res.data.product || res.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const isWish = isWishlisted(product?._id || product?.id);

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSavingWishlist(true);
    await toggleWishlist(product);
    setSavingWishlist(false);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setIsAddingToCart(true);
    const result = await addToCart(product, quantity);
    setIsAddingToCart(false);
    if (result?.requireAuth) {
      navigate('/login');
      return;
    }
    if (result?.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await addToCart(product, quantity);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Product Not Found</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {error || "The product you are looking for might have been removed or doesn't exist."}
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition"
            >
              Go Back
            </button>
            <Link 
              to="/search"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </button>

        <nav className="hidden sm:flex items-center space-x-2 text-xs text-gray-400 font-medium">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span>/</span>
          <Link to={`/search?category=${encodeURIComponent(product.category)}`} className="hover:text-gray-700">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[180px]">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Layout */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        
        {/* Left: Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden group">
            <img 
              src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm border border-gray-100">
              {product.category}
            </span>

            <button 
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-gray-100 text-gray-400 hover:text-red-500 transition"
              aria-label="Wishlist"
              title={isWishlisted(product._id || id) ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-5 h-5 ${isWishlisted(product._id || id) ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Product Details & Purchase Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category & Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                {product.category}
              </span>
              {product.tags && product.tags.map((t) => (
                <Link
                  key={t}
                  to={`/search?tag=${encodeURIComponent(t)}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 px-2.5 py-1 rounded-lg transition"
                >
                  <Tag className="w-3 h-3" /> #{t}
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating & Stock */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>4.8</span>
                <span className="text-gray-400 font-normal">(124 reviews)</span>
              </div>
              <span className="text-gray-300">•</span>
              <div>
                {product.stock > 0 ? (
                  <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> In Stock ({product.stock} units)
                  </span>
                ) : (
                  <span className="text-red-600 font-bold inline-flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-gray-900">
                ₹{product.price}
              </span>
              <span className="text-sm text-gray-400 line-through font-medium">
                ₹{Math.round(product.price * 1.25)}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2 py-0.5 rounded-md">
                Save 20%
              </span>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">About Product</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Quantity & Action Buttons */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Quantity:</span>
              <div className="inline-flex items-center border border-gray-200 rounded-xl bg-gray-50">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 text-gray-500 hover:text-blue-600 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-gray-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="p-2.5 text-gray-500 hover:text-blue-600 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || isAddingToCart}
                className={`w-full py-3.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 shadow-lg ${
                  addedToCart 
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                    : isAddingToCart
                    ? 'bg-blue-400 text-white cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {isAddingToCart ? 'Adding...' : addedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </button>
              <button 
                onClick={handleWishlistToggle}
                disabled={savingWishlist}
                className={`w-full py-3.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 border ${
                  savingWishlist
                    ? 'bg-gray-100 text-gray-400 border-gray-200'
                    : isWish
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    : 'bg-white text-gray-700 border-gray-200 hover:text-red-600 hover:border-red-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWish ? 'fill-red-500 text-red-500' : ''}`} />
                {savingWishlist ? 'Saving...' : isWish ? 'Saved in Wishlist' : 'Add to Wishlist'}
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full py-3.5 rounded-xl text-xs font-extrabold bg-gray-900 hover:bg-gray-800 text-white transition disabled:bg-gray-200 disabled:text-gray-400"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Perks Bar */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-center">
            <div className="flex flex-col items-center gap-1 text-[11px] text-gray-500">
              <Truck className="w-4 h-4 text-blue-600" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[11px] text-gray-500">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span>30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-[11px] text-gray-500">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>100% Genuine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
