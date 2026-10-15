import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Store, LogOut, ChevronDown, Compass, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();

  const handleLogout = async () => {
    await logout();
    setProfileDropdown(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setMobileMenuOpen(false);
    } else {
      navigate('/search');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-all border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="text-2xl font-black tracking-tight flex items-center gap-1.5">
              <span className="bg-blue-600 text-white rounded-lg px-2.5 py-0.5 text-xl font-bold">Shop</span>
              <span className="text-gray-900">Kart</span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-gray-200 text-xs font-bold">
              <Link 
                to="/home" 
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  location.pathname === '/home' || location.pathname === '/'
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Store className="w-3.5 h-3.5" /> Home
              </Link>
              <Link 
                to="/products" 
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  location.pathname === '/products' || location.pathname === '/search'
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Compass className="w-3.5 h-3.5" /> Products
              </Link>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, brands, tags and categories..."
                className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/80 transition shadow-inner"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1.5 p-1 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Nav Icons */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link 
              to="/search" 
              className="md:hidden text-gray-600 hover:text-blue-600 flex flex-col items-center"
            >
              <Search className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-0.5">Search</span>
            </Link>

            {/* Auth-aware section */}
            {user ? (
              /* Logged In: Show profile dropdown */
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition group"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase ring-2 ring-blue-100">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[100px]">
                      {user.fullName}
                    </div>
                    <div className="text-[10px] text-gray-400 leading-tight">Member</div>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 hidden sm:block transition-transform ${profileDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/home"
                        onClick={() => setProfileDropdown(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        Storefront
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setProfileDropdown(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center justify-between"
                      >
                        <span>Saved Wishlist</span>
                        {wishlistCount > 0 && (
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/cart"
                        onClick={() => setProfileDropdown(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center justify-between"
                      >
                        <span>Shopping Cart</span>
                        {cartCount > 0 && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setProfileDropdown(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/search"
                        onClick={() => setProfileDropdown(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                      >
                        Browse All Products
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Not Logged In: Show Sign In link */
              <Link 
                to="/login" 
                className={`flex flex-col items-center transition group ${
                  location.pathname === '/login' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <div className="p-1 rounded-full group-hover:bg-blue-50 transition">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">Sign In</span>
              </Link>
            )}

            {/* Wishlist Link */}
            <Link 
              to="/wishlist" 
              className={`flex flex-col items-center relative cursor-pointer group transition ${
                location.pathname === '/wishlist' ? 'text-red-500 font-semibold' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <div className="p-1 rounded-full group-hover:bg-red-50 transition relative">
                <Heart className={`w-5 h-5 ${location.pathname === '/wishlist' || wishlistCount > 0 ? 'text-red-500' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">Wishlist</span>
            </Link>

            {/* Cart Link */}
            <Link 
              to="/cart"
              className={`flex flex-col items-center relative cursor-pointer group transition ${
                location.pathname === '/cart' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <div className="p-1 rounded-full group-hover:bg-blue-50 transition relative">
                <ShoppingCart className={`w-5 h-5 ${location.pathname === '/cart' || cartCount > 0 ? 'text-blue-600' : ''}`} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">Cart</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, categories..."
              className="w-full pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 transition"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-600">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-fadeIn">
            {/* User info banner on mobile when logged in */}
            {user && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-blue-50/70 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{user.fullName}</div>
                  <div className="text-[11px] text-gray-500">{user.email}</div>
                </div>
              </div>
            )}

            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                location.pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Overview (Landing)
            </Link>
            <Link 
              to="/home" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                location.pathname === '/home' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Storefront (Home)
            </Link>
            <Link 
              to="/search" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                location.pathname === '/search' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Explore Products
            </Link>
            <Link 
              to="/wishlist" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                location.pathname === '/wishlist' ? 'bg-red-50 text-red-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Saved Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link 
              to="/cart" 
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                location.pathname === '/cart' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>Shopping Cart</span>
              {cartCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {user && (
              <Link 
                to="/orders" 
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === '/orders' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                My Orders
              </Link>
            )}

            {user ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
