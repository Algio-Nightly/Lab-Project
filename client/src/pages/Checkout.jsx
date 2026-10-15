import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, ArrowLeft, CreditCard, Lock, CheckCircle2, 
  AlertCircle, Loader2, MapPin, Phone, User, Home, Building2, 
  Map, Sparkles, ShoppingBag 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { axiosInstance } from '../services/api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const { cart, totalPrice, totalItems, clearCartState } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Guard: Redirect to cart if empty
  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error on edit
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) {
      setServerError('');
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName || !formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }

    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = 'Phone Number is required';
    } else {
      const cleanPhone = formData.phone.trim().replace(/[\s-]/g, '');
      if (!/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
        errors.phone = 'Phone must contain a valid 10-digit number';
      }
    }

    if (!formData.addressLine1 || !formData.addressLine1.trim()) {
      errors.addressLine1 = 'Street Address is required';
    }

    if (!formData.city || !formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.state || !formData.state.trim()) {
      errors.state = 'State is required';
    }

    if (!formData.pincode || !formData.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      errors.pincode = 'Pincode must contain 6 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsPlacingOrder(true);

    try {
      // 1. Ensure Razorpay Checkout SDK is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setServerError('Razorpay SDK failed to load. Please check your network connection.');
        setIsPlacingOrder(false);
        return;
      }

      // 2. Call backend to validate cart, stock, calculate server total and create order
      const shippingAddress = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      };

      const res = await axiosInstance.post('/orders/create-payment-order', {
        shippingAddress,
      });

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = res.data;

      if (!razorpayOrderId) {
        throw new Error('Order creation did not return a Razorpay Order ID');
      }

      // 3. Configure Razorpay Standard Checkout options
      const options = {
        key: key || '',
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: 'Complete your ShopKart order',
        order_id: razorpayOrderId,
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.phone,
          email: user?.email || '',
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false);
          },
        },
        handler: async (response) => {
          // Handshake with backend for HMAC signature verification
          setIsVerifying(true);
          try {
            const verifyRes = await axiosInstance.post('/orders/verify-payment', {
              shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              // Clear global cart state in React immediately
              clearCartState();
              // Navigate to confirmed order screen
              navigate(`/orders/${shopKartOrderId}`, {
                state: { orderPlaced: true },
                replace: true,
              });
            }
          } catch (verifyErr) {
            console.error('Payment signature verification error:', verifyErr);
            setServerError(
              verifyErr.response?.data?.message ||
                'Payment signature verification failed. Please contact support.'
            );
          } finally {
            setIsVerifying(false);
            setIsPlacingOrder(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (failResponse) => {
        console.error('Razorpay payment failed:', failResponse.error);
        setServerError(
          `Payment failed: ${failResponse.error?.description || 'Transaction declined'}. Your cart has been preserved.`
        );
        setIsPlacingOrder(false);
      });

      rzp.open();
    } catch (err) {
      console.error('Error initiating checkout:', err);
      setServerError(
        err.response?.data?.message ||
          err.message ||
          'Failed to initialize checkout. Ensure backend has valid Razorpay API keys.'
      );
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header & Breadcrumb */}
      <div className="mb-8">
        <Link 
          to="/cart" 
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              Checkout & Payment
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Provide your delivery address and pay securely with Razorpay Test Mode.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 self-start">
            <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {serverError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs shadow-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">
            <p className="font-bold text-red-900">Checkout Notice</p>
            <p className="mt-0.5">{serverError}</p>
          </div>
        </div>
      )}

      {/* Verification Overlay */}
      {isVerifying && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl animate-scaleUp">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Verifying Payment...</h3>
            <p className="text-xs text-gray-500">
              Please wait while our server verifies the Razorpay payment signature. Do not close this window.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Shipping Address Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-gray-900">1. Shipping Address</h2>
                <p className="text-xs text-gray-400">Where should we deliver your order?</p>
              </div>
            </div>

            <form onSubmit={handlePlaceOrder} id="checkout-form" className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-gray-400" /> Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className={`w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 transition ${
                    formErrors.fullName
                      ? 'border-red-400 focus:ring-red-400/20'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                {formErrors.fullName && (
                  <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.fullName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" /> Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className={`w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 transition ${
                    formErrors.phone
                      ? 'border-red-400 focus:ring-red-400/20'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                {formErrors.phone && (
                  <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.phone}
                  </p>
                )}
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-gray-400" /> Street Address / Apartment <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="e.g. 22 MG Road, Flat 4B, Silicon Heights"
                  className={`w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 transition ${
                    formErrors.addressLine1
                      ? 'border-red-400 focus:ring-red-400/20'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                {formErrors.addressLine1 && (
                  <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.addressLine1}
                  </p>
                )}
              </div>

              {/* City & State (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" /> City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className={`w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 transition ${
                      formErrors.city
                        ? 'border-red-400 focus:ring-red-400/20'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                  {formErrors.city && (
                    <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Map className="w-3.5 h-3.5 text-gray-400" /> State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    className={`w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 transition ${
                      formErrors.state
                        ? 'border-red-400 focus:ring-red-400/20'
                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                    }`}
                  />
                  {formErrors.state && (
                    <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.state}
                    </p>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> Pincode (6 Digits) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 560001"
                  className={`w-full px-4 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 bg-gray-50/50 transition ${
                    formErrors.pincode
                      ? 'border-red-400 focus:ring-red-400/20'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                />
                {formErrors.pincode && (
                  <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.pincode}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Razorpay Test Mode</p>
                <p className="text-[11px] text-gray-400">No real money deducted</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Verified Signature</p>
                <p className="text-[11px] text-gray-400">Server-validated HMAC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-5 sticky top-24">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" /> Order Summary
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Cart Items List */}
            <div className="max-h-72 overflow-y-auto space-y-3.5 pr-1 divide-y divide-gray-50">
              {cart.map((item, idx) => {
                const product = item.product || {};
                const name = product.name || 'Product';
                const price = Number(product.price) || 0;
                const quantity = item.quantity || 1;
                const image = product.image || '';

                return (
                  <div key={item._id || idx} className="pt-3 first:pt-0 flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {image ? (
                        <img 
                          src={image} 
                          alt={name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{name}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        ₹{price.toLocaleString('en-IN')} × {quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-gray-900">
                        ₹{(price * quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-bold text-gray-900">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Shipping</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Taxes</span>
                <span className="font-medium text-gray-400">Included</span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-extrabold text-gray-900 block">Total Amount</span>
                  <span className="text-[10px] text-gray-400">Revalidated on server</span>
                </div>
                <span className="text-2xl font-black text-blue-600">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={isPlacingOrder || isVerifying || cart.length === 0}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Contacting Razorpay...</span>
                </>
              ) : isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Signature...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Place Order (₹{totalPrice.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <p className="text-[11px] text-gray-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                Cart will be cleared only after verified payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
