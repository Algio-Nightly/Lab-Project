import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon, Filter, X, Tag, SlidersHorizontal, 
  ShoppingBag, Star, ArrowRight, Loader2, RefreshCw, Layers, Heart 
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { axiosInstance } from '../services/api';

const DEFAULT_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home Appliances',
  'Health & Beauty',
  'Grocery',
  'Toys & Games'
];

const DEFAULT_TAGS = [
  'deal',
  'trending',
  'bestseller',
  'flagship',
  'wireless',
  'gaming',
  'organic',
  'audio'
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const queryParam = searchParams.get('q') || searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const tagParam = searchParams.get('tag') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [tags, setTags] = useState(DEFAULT_TAGS);
  
  const [searchInput, setSearchInput] = useState(queryParam);
  const [sortBy, setSortBy] = useState('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedCartId, setAddedCartId] = useState(null);

  // Sync search input if URL changes
  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  // Fetch Categories & Tags dynamically
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, tagRes] = await Promise.allSettled([
          axiosInstance.get('/products/categories'),
          axiosInstance.get('/products/tags')
        ]);

        if (catRes.status === 'fulfilled' && catRes.value.data?.categories?.length > 0) {
          setCategories(catRes.value.data.categories);
        }
        if (tagRes.status === 'fulfilled' && tagRes.value.data?.tags?.length > 0) {
          setTags(tagRes.value.data.tags);
        }
      } catch (e) {
        console.error('Failed to load categories/tags metadata:', e);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Products based on URL Search Params
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (queryParam) params.append('search', queryParam);
        if (categoryParam) params.append('category', categoryParam);
        if (tagParam) params.append('tag', tagParam);

        const res = await axiosInstance.get(`/products?${params.toString()}`);
        setProducts(res.data.products || res.data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [queryParam, categoryParam, tagParam]);

  const updateFilters = (newParams) => {
    const current = new URLSearchParams(searchParams);
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    setSearchParams(current);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ q: searchInput.trim() });
  };

  const handleCategorySelect = (cat) => {
    updateFilters({ category: categoryParam === cat ? '' : cat });
  };

  const handleTagSelect = (t) => {
    updateFilters({ tag: tagParam === t ? '' : t });
  };

  const handleClearAll = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const productId = product._id || product.id || product;
    await addToCart(product, 1);
    setAddedCartId(productId);
    setTimeout(() => {
      setAddedCartId(null);
    }, 1200);
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const hasActiveFilters = Boolean(queryParam || categoryParam || tagParam);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Layers className="w-7 h-7 text-blue-600" /> Explore Products & Catalog
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Search by name, browse categories, or filter by custom product tags.
            </p>
          </div>

          <button 
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl text-sm border border-blue-100"
          >
            <Filter className="w-4 h-4" /> Filters {hasActiveFilters && '(Active)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <aside className={`
          md:block ${mobileFilterOpen ? 'block' : 'hidden'} 
          bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6 h-fit sticky top-24
        `}>
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Filters
            </h3>
            {hasActiveFilters && (
              <button 
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Search by name/keyword */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Search By Name
            </label>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input 
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Product name or keyword..."
                className="w-full pl-3.5 pr-9 py-2.5 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition"
              />
              <button 
                type="submit"
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-blue-600"
              >
                <SearchIcon className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5">
              Categories
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => updateFilters({ category: '' })}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                  !categoryParam 
                    ? 'bg-blue-600 text-white font-bold' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>All Categories</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                    categoryParam.toLowerCase() === cat.toLowerCase()
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" /> Filter by Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => {
                const isSelected = tagParam.toLowerCase() === t.toLowerCase();
                return (
                  <button
                    key={t}
                    onClick={() => handleTagSelect(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    #{t}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right Product Results Area */}
        <main className="md:col-span-3 space-y-6">
          {/* Active Filter Chips & Sort Bar */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-gray-500 font-medium">
                Found <strong className="text-gray-900 font-bold">{sortedProducts.length}</strong> items
              </span>
              {/* Active Badges */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {queryParam && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                      Query: "{queryParam}"
                      <button onClick={() => updateFilters({ q: '' })}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {categoryParam && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                      Category: {categoryParam}
                      <button onClick={() => updateFilters({ category: '' })}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                  {tagParam && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                      Tag: #{tagParam}
                      <button onClick={() => updateFilters({ tag: '' })}><X className="w-3 h-3" /></button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <label className="text-xs font-semibold text-gray-500 shrink-0">Sort by:</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600 font-semibold">Loading products...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 space-y-2">
              <p className="text-sm font-bold">Something went wrong while loading products.</p>
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && sortedProducts.length === 0 && (
            <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <SearchIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No products found.</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                We couldn't find any products matching your current search or filter combination.
              </p>
              {hasActiveFilters && (
                <button 
                  onClick={handleClearAll}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Product Cards Grid */}
          {!loading && !error && sortedProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((p) => {
                const productId = p._id || p.id;
                const isJustAdded = addedCartId === productId;
                const isWish = isWishlisted(productId);
                const inStock = p.stock !== undefined ? p.stock > 0 : true;

                return (
                  <div 
                    key={productId}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                  >
                    {/* Image Container */}
                    <div>
                      <div className="relative h-48 bg-gray-50 overflow-hidden">
                        <img 
                          src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'} 
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-gray-700 shadow-sm">
                          {p.category || 'General'}
                        </span>

                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(p);
                          }}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 transition shadow-sm"
                          aria-label="Wishlist"
                          title={isWish ? "Remove from Wishlist" : "Add to Wishlist"}
                        >
                          <Heart className={`w-4 h-4 ${isWish ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2">
                        {p.tags && p.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1">
                            {p.tags.slice(0, 3).map((t) => (
                              <span 
                                key={t} 
                                onClick={(e) => {
                                  e.preventDefault();
                                  updateFilters({ tag: t });
                                }}
                                className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md cursor-pointer hover:bg-blue-100 transition"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}

                        <Link to={`/products/${productId}`}>
                          <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {p.name}
                          </h4>
                        </Link>

                        {/* Stock status indicator */}
                        <div className="text-xs">
                          {inStock ? (
                            <span className="text-emerald-600 font-bold text-[11px] inline-flex items-center gap-1">
                              {p.stock !== undefined ? `${p.stock} units left` : 'In Stock'}
                            </span>
                          ) : (
                            <span className="text-red-500 font-bold text-[11px]">
                              Out of stock
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-5 pt-0 border-t border-gray-50 mt-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase font-bold">Price</span>
                          <span className="text-lg font-black text-gray-900">
                            ₹{p.price}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleWishlist(p)}
                          className={`text-xs font-bold px-2 py-1 rounded-lg transition border ${
                            isWish
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : 'bg-white text-gray-600 border-gray-200 hover:text-red-500'
                          }`}
                        >
                          {isWish ? '♥ Saved' : '♡ Wishlist'}
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
                          onClick={() => handleAddToCart(p)}
                          disabled={!inStock}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                            isJustAdded 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {isJustAdded ? 'Added' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
