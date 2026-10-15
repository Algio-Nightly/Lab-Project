import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ArrowRight, Heart, Star, ShoppingBag, Truck, 
  ShieldCheck, RotateCcw, Zap, Filter, SlidersHorizontal, Check, CheckCircle, 
  User, Mail, Phone, Loader2, Tag, Compass, AlertCircle, PackageOpen 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { axiosInstance } from '../services/api';

const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: '✨' },
  { id: 'Electronics', name: 'Electronics', icon: '📱' },
  { id: 'Fashion', name: 'Fashion', icon: '👕' },
  { id: 'Home Appliances', name: 'Home Appliances', icon: '🏠' },
  { id: 'Health & Beauty', name: 'Health & Beauty', icon: '💄' },
  { id: 'Grocery', name: 'Grocery', icon: '🛒' },
];

export default function Home() {
  const { user } = useAuth();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart: addItemToCart } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [addedCartId, setAddedCartId] = useState(null);
  const [addingCartId, setAddingCartId] = useState(null);
  const [savingWishlistId, setSavingWishlistId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/products');
      let items = res.data.products || res.data || [];

      // If DB is empty, auto-seed with initial products
      if (items.length === 0) {
        const seedRes = await axiosInstance.get('/products/seed');
        items = seedRes.data.products || [];
      }

      setProducts(items);
    } catch (err) {
      console.error('Error loading products for home:', err);
      setError(err.response?.data?.message || 'Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleWishlistToggle = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const productId = product._id || product.id || product;
    setSavingWishlistId(productId);
    setActionNotice(null);
    try {
      const result = await toggleWishlist(product);
      if (result?.error) {
        setActionNotice({ type: 'error', text: result.error });
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err) {
      setActionNotice({ type: 'error', text: 'Unable to save product. Please try again.' });
      setTimeout(() => setActionNotice(null), 3000);
    } finally {
      setSavingWishlistId(null);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const productId = product._id || product.id || product;
    setAddingCartId(productId);
    setActionNotice(null);

    const result = await addItemToCart(product, 1);
    setAddingCartId(null);

    if (result?.success) {
      setAddedCartId(productId);
      setTimeout(() => setAddedCartId(null), 1200);
    } else if (result?.error) {
      setActionNotice({ type: 'error', text: result.error });
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'all') return true;
    return p.category?.toLowerCase() === selectedCategory.toLowerCase();
  }).sort((a, b) => {
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Task 3 Protected Customer Info Welcome Banner */}
      {user && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-black ring-4 ring-white/10 uppercase shrink-0">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-md text-blue-100">
                  Customer Dashboard
                </span>
                <span className="text-xs text-blue-200">Session Verified</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
                Welcome back, {user.fullName}!
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-blue-100">
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </span>
                {user.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
            <Link 
              to="/search"
              className="px-5 py-2.5 bg-white text-blue-700 font-bold rounded-xl text-xs shadow-md hover:bg-blue-50 transition flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" /> Explore Catalog
            </Link>
          </div>
        </div>
      )}

      {/* Hero Showcase */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden min-h-[320px] md:min-h-[360px] shadow-xl shadow-blue-900/10">
          <div className="z-10 max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold backdrop-blur-sm mb-4 border border-blue-400/20">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" /> Weekend Flash Specials
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 leading-tight">
              Samsung Galaxy S24 Ultra
            </h2>
            <p className="text-gray-200 text-sm sm:text-base mb-6 leading-relaxed">
              Titanium design. Snapdragon 8 Gen 3 with Galaxy AI. <br />
              <span className="text-white font-bold text-xl sm:text-2xl mt-1 inline-block">Starting from ₹1,199</span>
            </p>
            <Link 
              to="/search?q=Samsung"
              className="bg-white text-blue-900 px-6 py-3 rounded-full font-bold text-sm shadow-md hover:bg-gray-100 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              Claim Deal Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="absolute -right-10 -bottom-10 md:right-0 md:bottom-0 w-3/5 sm:w-1/2 h-full flex items-end justify-end pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=600&q=80" 
              alt="Flagship Phone" 
              className="h-4/5 object-contain drop-shadow-2xl transform md:scale-110 md:-translate-y-4" 
            />
          </div>
        </div>

        {/* Side Promo Banner */}
        <div className="bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden min-h-[320px] md:min-h-[360px] shadow-xl shadow-cyan-900/10">
          <div className="z-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm mb-3">
              FLASH PROMO
            </span>
            <h3 className="text-3xl sm:text-4xl font-black leading-tight">
              EXCLUSIVE <br />
              <span className="text-yellow-300 text-5xl sm:text-6xl font-black tracking-tight">50%</span> <br />
              MEMBER OFF
            </h3>
            <p className="text-white/90 text-sm mt-2 font-medium">Footwear & Audio gear</p>
          </div>
          <div className="z-10">
            <Link 
              to="/search?tag=deal"
              className="bg-yellow-400 text-gray-950 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-yellow-300 shadow-md transition inline-block"
            >
              View Deals
            </Link>
          </div>
        </div>
      </section>

      {/* Category Pills & Sorting Bar */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Live Products & Catalog</h3>
            <p className="text-xs text-gray-500">Fetched directly from your MongoDB backend database</p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-gray-500">Sort by:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer shadow-sm"
            >
              <option value="popular">Newest / Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-2 shadow-sm ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-blue-600/25 ring-2 ring-blue-600/20'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600 font-semibold">Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h4 className="text-base font-bold text-red-700">Something went wrong while loading products.</h4>
          <p className="text-xs text-red-500">{error}</p>
          <button 
            onClick={fetchProducts} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProducts.length === 0 && (
        <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center space-y-3 shadow-sm">
          <PackageOpen className="w-12 h-12 text-gray-400 mx-auto" />
          <h4 className="text-base font-bold text-gray-800">No products found.</h4>
          <p className="text-xs text-gray-500">There are no products available matching your selection.</p>
          {selectedCategory !== 'all' && (
            <button 
              onClick={() => setSelectedCategory('all')} 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
            >
              View All Categories
            </button>
          )}
        </div>
      )}

      {/* User Action Feedback Banner */}
      {actionNotice && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-fadeIn ${
          actionNotice.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          <span>{actionNotice.text}</span>
          <button onClick={() => setActionNotice(null)} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
      )}

      {/* Product Grid */}
      {!loading && !error && filteredProducts.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const productId = product._id || product.id;
            const isWish = isWishlisted(productId);
            const isSavingWish = savingWishlistId === productId;
            const isAdded = addedCartId === productId;
            const isAddingCart = addingCartId === productId;
            const inStock = product.stock !== undefined ? product.stock > 0 : true;

            return (
              <div 
                key={productId}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="relative h-48 bg-gray-50 overflow-hidden">
                    <img 
                      src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    
                    <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-gray-700 shadow-sm">
                      {product.category}
                    </span>

                    {/* Wishlist Icon Button with saving spinner */}
                    <button 
                      onClick={() => handleWishlistToggle(product)}
                      disabled={isSavingWish}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 transition shadow-sm disabled:opacity-50"
                      aria-label="Wishlist"
                      title={isWish ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      {isSavingWish ? (
                        <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                      ) : (
                        <Heart className={`w-4 h-4 ${isWish ? 'fill-red-500 text-red-500' : ''}`} />
                      )}
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-2">
                    <Link to={`/products/${productId}`}>
                      <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                    </Link>

                    {/* Stock status indicator */}
                    <div className="text-xs">
                      {inStock ? (
                        <span className="text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          {product.stock !== undefined ? `${product.stock} units left` : 'In Stock'}
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold text-[11px]">
                          Out of stock
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Wishlist button state + Add to Cart state */}
                <div className="p-5 pt-0 border-t border-gray-50 mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">Price</span>
                      <span className="text-lg font-black text-gray-900">
                        ₹{product.price}
                      </span>
                    </div>

                    {/* Explicit Wishlist action button (Lab-04 Section 4 & 5) */}
                    <button
                      onClick={() => handleWishlistToggle(product)}
                      disabled={isSavingWish}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 border ${
                        isSavingWish
                          ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                          : isWish
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : 'bg-white text-gray-600 border-gray-200 hover:text-red-500 hover:border-red-200'
                      }`}
                    >
                      {isSavingWish ? (
                        <>⏳ Saving...</>
                      ) : isWish ? (
                        <>♥ Saved</>
                      ) : (
                        <>♡ Wishlist</>
                      )}
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
                      onClick={() => addToCart(product)}
                      disabled={!inStock || isAddingCart}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                        isAdded 
                          ? 'bg-emerald-600 text-white' 
                          : isAddingCart
                          ? 'bg-blue-400 text-white cursor-wait'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {isAddingCart ? 'Adding...' : isAdded ? 'Added' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Feature Highlights Footer */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h5 className="font-bold text-sm text-gray-900">Express Free Shipping</h5>
            <p className="text-xs text-gray-500">On all member orders over ₹499</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h5 className="font-bold text-sm text-gray-900">Authenticity Guarantee</h5>
            <p className="text-xs text-gray-500">100% genuine certified brands</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h5 className="font-bold text-sm text-gray-900">Easy 30-Day Returns</h5>
            <p className="text-xs text-gray-500">Hassle-free instant refunds</p>
          </div>
        </div>
      </section>
    </div>
  );
}
