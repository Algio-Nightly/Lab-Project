import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, ShoppingBag, ArrowRight, Loader2, AlertCircle, 
  Calendar, CheckCircle2, Clock, ChevronRight, ExternalLink 
} from 'lucide-react';
import { axiosInstance } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get('/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            My Orders
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review your purchase history, delivery statuses, and invoices.
          </p>
        </div>
        <Link
          to="/home"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition self-start sm:self-auto inline-flex items-center gap-2"
        >
          <ShoppingBag className="w-3.5 h-3.5" /> Start Shopping
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs font-semibold text-gray-500">Retrieving your orders...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-sm font-extrabold text-red-900">{error}</h3>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && orders.length === 0 && (
        <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900">You have not placed any orders yet.</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your cart is waiting! Explore our catalog, add items to your cart, and complete test checkout seamlessly.
          </p>
          <div className="pt-2">
            <Link
              to="/home"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition inline-flex items-center gap-2"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const { _id, createdAt, totalAmount, status, paymentStatus, items = [] } = order;
            const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={_id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all space-y-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-100 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-900 text-sm">
                        Order #{_id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : status === 'SHIPPED'
                            ? 'bg-purple-100 text-purple-800'
                            : status === 'CONFIRMED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {status}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {paymentStatus}
                      </span>
                    </div>
                    <p className="text-gray-400 flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-gray-400 block font-medium">Total Amount</span>
                    <span className="text-lg font-black text-gray-900">
                      ₹{Number(totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Items Summary Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {items.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="p-3 bg-gray-50/70 rounded-2xl border border-gray-100 flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-gray-500">
                          ₹{Number(item.price).toLocaleString('en-IN')} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Bar */}
                <div className="pt-2 flex justify-end">
                  <Link
                    to={`/orders/${_id}`}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition inline-flex items-center gap-1.5 shadow-sm"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
