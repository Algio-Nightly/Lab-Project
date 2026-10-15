import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Trash2, ArrowRight, ArrowLeft, Plus, Minus, 
  Sparkles, Loader2, PackageOpen, CheckCircle, Heart, ShieldCheck, 
  Truck, RotateCcw, CreditCard, Tag, AlertCircle, ShoppingBag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { 
    cart, 
    totalItems, 
    totalPrice, 
    loading, 
    error, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    refreshCart 
  } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'SAVE10' || code === 'WELCOME10') {
      setAppliedDiscount(0.10); // 10% discount
      setPromoSuccess('10% Discount applied successfully!');
    } else if (code === 'SUPER20' || code === 'DEAL20') {
      setAppliedDiscount(0.20); // 20% discount
      setPromoSuccess('20% Flash discount applied!');
    } else {
      setPromoError('Invalid promo code. Try "SAVE10" or "SUPER20"');
    }
  };

  const handleMoveToWishlist = async (product) => {
    if (!isWishlisted(product._id || product.id)) {
      await toggleWishlist(product);
    }
    await removeFromCart(product._id || product.id);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Unauthenticated view
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Sign in to view your Cart</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Log in to your account to review saved cart items, adjust quantities, and checkout seamlessly.
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

  // Checkout Success Modal / Screen
  if (checkoutComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl p-10 sm:p-12 border border-gray-100 shadow-lg space-y-5 animate-fadeIn">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Order Placed Successfully!</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            Thank you for your order, <span className="font-bold text-gray-900">{user.fullName}</span>! We've sent a confirmation email to <span className="font-bold text-gray-900">{user.email}</span>.
          </p>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs text-gray-500 max-w-sm mx-auto space-y-1">
            <p className="font-medium text-gray-700">Estimated Delivery: 2-3 Business Days</p>
            <p>Tracking number will be updated once shipped.</p>
          </div>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Link 
              to="/products"
              onClick={() => setCheckoutComplete(false)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-blue-600/25 inline-flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const discountAmount = Number((totalPrice * appliedDiscount).toFixed(2));
  const shippingFee = totalPrice > 50 || totalPrice === 0 ? 0 : 5.99;
  const grandTotal = Number(Math.max(0, totalPrice - discountAmount + shippingFee).toFixed(2));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                My Cart
                <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Review your items, modify quantities, and proceed to checkout.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 transition self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" /> Continue Shopping <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Loading State (Lab 05 Task 17) */}
      {loading && (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-gray-500 font-medium">Loading your cart...</p>
        </div>
      )}

      {/* Error State (Lab 05 Task 17 & 22) */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-red-800">Something went wrong.</h3>
            <p className="text-sm text-red-600">Unable to load your cart.</p>
          </div>
          <button 
            onClick={refreshCart}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      )}

      {/* Empty State (Lab 05 Task 17) */}
      {!loading && !error && cart.length === 0 && (
        <div className="bg-white rounded-3xl p-12 sm:p-16 border border-gray-100 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto text-3xl">
            🛒
          </div>
          <h3 className="text-2xl font-black text-gray-900">Your cart is empty 🛒</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            Looks like you haven't added anything yet.
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

      {/* Cart Content Layout */}
      {!loading && !error && cart.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Cart Items ({cart.length} unique products)
              </span>
              <button 
                onClick={clearCart}
                className="text-xs text-red-500 hover:text-red-700 font-semibold transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>

            <div className="space-y-3">
              {cart.map((item) => {
                const product = item.product || {};
                const productId = product._id || product.id || item.product;
                const itemQuantity = Number(item.quantity) || 1;
                const itemTotal = Number(((product.price || 0) * itemQuantity).toFixed(2));
                const isWish = isWishlisted(productId);

                return (
                  <div 
                    key={item._id || productId}
                    className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Product Image & Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Link 
                        to={`/products/${productId}`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 group"
                      >
                        <img 
                          src={product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'} 
                          alt={product.name || 'Product'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </Link>

                      <div className="space-y-1 min-w-0 flex-1">
                        {product.category && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                            {product.category}
                          </span>
                        )}
                        <Link to={`/products/${productId}`}>
                          <h4 className="font-extrabold text-sm text-gray-900 hover:text-blue-600 transition truncate">
                            {product.name || 'Product'}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Unit Price:</span>
                          <span className="font-bold text-gray-900">₹{product.price || 0}</span>
                        </div>
                        {product.stock !== undefined && (
                          <span className={`text-[10px] font-semibold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of stock'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls, Total Price & Actions (Lab 05 Section 14) */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                      {/* Quantity Controls: [-] 2 [+] */}
                      <div className="inline-flex items-center border border-gray-200 rounded-xl bg-gray-50">
                        <button 
                          onClick={() => updateQuantity(productId, itemQuantity - 1)}
                          disabled={itemQuantity <= 1}
                          className="p-2 text-gray-500 hover:text-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title={itemQuantity <= 1 ? "Minimum quantity is 1 (use Remove button to delete)" : "Decrease quantity"}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-900 min-w-[28px] text-center">
                          {itemQuantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(productId, itemQuantity + 1)}
                          disabled={product.stock !== undefined && itemQuantity >= product.stock}
                          className="p-2 text-gray-500 hover:text-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">Total</span>
                        <span className="text-base font-black text-gray-900">
                          ₹{itemTotal}
                        </span>
                      </div>

                      {/* Action buttons (Move to wishlist / Remove) */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleMoveToWishlist(product)}
                          className={`p-2 rounded-xl border transition ${
                            isWish 
                              ? 'bg-red-50 text-red-500 border-red-200' 
                              : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 border-gray-200'
                          }`}
                          title="Move to Wishlist"
                        >
                          <Heart className={`w-4 h-4 ${isWish ? 'fill-red-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => removeFromCart(productId)}
                          className="p-2 rounded-xl bg-white text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Perks Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-900">Free Express Shipping</h5>
                  <p className="text-[11px] text-gray-500">On all orders over ₹499</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-900">30-Day Easy Returns</h5>
                  <p className="text-[11px] text-gray-500">Hassle-free guarantee</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-900">100% Secure Checkout</h5>
                  <p className="text-[11px] text-gray-500">Encrypted payment</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-4 sticky top-24">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
              <h3 className="text-base font-extrabold text-gray-900 pb-3 border-b border-gray-100">
                Order Summary
              </h3>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" /> Have a Coupon Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. SAVE10 or SUPER20"
                    className="flex-1 px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 uppercase tracking-wider"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs transition"
                  >
                    Apply
                  </button>
                </div>
                {promoSuccess && (
                  <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {promoSuccess}
                  </p>
                )}
                {promoError && (
                  <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {promoError}
                  </p>
                )}
              </form>

              {/* Cost Calculations */}
              <div className="space-y-3 pt-3 border-t border-gray-100 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-bold text-gray-900">₹{totalPrice}</span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({(appliedDiscount * 100).toFixed(0)}%)</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-gray-900">
                    {shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${shippingFee}`}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Estimated Taxes</span>
                  <span className="text-gray-500">Calculated at checkout</span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-extrabold text-gray-900 block">Total Amount</span>
                    <span className="text-[10px] text-gray-400 font-medium">Includes all taxes & fees</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || cart.length === 0}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing Order...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" /> Proceed to Checkout (₹{grandTotal})
                  </>
                )}
              </button>

              <div className="text-center">
                <span className="text-[11px] text-gray-400 inline-flex items-center gap-1 justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-gray-500" /> 256-bit Bank Grade Security
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
