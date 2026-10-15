import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/profile';
import Search from './pages/Search';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm py-12 mt-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5 mb-3">
            <span className="bg-blue-600 text-white rounded-lg px-2.5 py-0.5 text-xl font-bold">Shop</span>
            <span>Kart</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Your premium destination for electronics, fashion, groceries, and everyday lifestyle essentials with lightning fast delivery.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Quick Links</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/" className="hover:text-white transition">Landing Page</Link></li>
            <li><Link to="/home" className="hover:text-white transition">Store Catalog</Link></li>
            <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
            <li><Link to="/register" className="hover:text-white transition">Create Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Customer Care</h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:text-white transition">Help Center & FAQ</a></li>
            <li><a href="#" className="hover:text-white transition">Returns & Refunds</a></li>
            <li><a href="#" className="hover:text-white transition">Shipping Policy</a></li>
            <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm">Stay Connected</h4>
          <p className="text-xs text-gray-400 mb-3">Subscribe for exclusive flash deals and vouchers.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-gray-800 text-white px-3 py-2 rounded-lg text-xs flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-700" 
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition">
              Join
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} ShopKart. All rights reserved.
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <div className="min-h-screen flex flex-col bg-gray-50/50">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  {/* Public Landing Page */}
                  <Route path="/" element={<Landing />} />
                  
                  {/* Main Storefront / Catalog */}
                  <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  <Route path="/products" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                  
                  {/* Product Catalog, Details, Wishlist & Cart */}
                  <Route path="/search" element={<Search />} />
                  <Route path="/products/:id" element={<ProductDetails />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/cart" element={<Cart />} />
                  
                  {/* Checkout, Orders & Confirmation */}
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                  <Route path="/order-success/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

                  {/* Authentication Pages */}
                  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                  
                  {/* Alias / Redirection */}
                  <Route path="/signup" element={<PublicRoute><Navigate to="/register" replace /></PublicRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
