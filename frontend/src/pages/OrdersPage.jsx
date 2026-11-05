import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  ChevronRight,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const OrdersPage = () => {
  const { user, token } = useAuth();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Cancel order modal state
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Changed mind');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    setCancelling(true);

    try {
      const res = await fetch(`/api/orders/${cancellingOrder._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      setOrders((prev) =>
        prev.map((o) => (o._id === cancellingOrder._id ? data.order : o))
      );
      addToast({ message: 'Order has been cancelled successfully.', type: 'info' });
      setCancellingOrder(null);
    } catch (err) {
      addToast({ message: err.message, type: 'error' });
    } finally {
      setCancelling(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'All') return true;
    return o.orderStatus === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  if (!user && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <Package className="w-12 h-12 text-indigo-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2 font-['Space_Grotesk']">
          Sign In to View Orders
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Please sign in to track your packages and view detailed order history.
        </p>
        <Link
          to="/login?redirect=/orders"
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wider"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setCancellingOrder(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Cancel Order {cancellingOrder.orderNumber}</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to cancel this order? Once cancelled, items will be restocked and payment refunded.
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
              >
                <option value="Changed mind">Changed my mind</option>
                <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Shipping takes too long">Shipping takes too long</option>
                <option value="Need to change shipping address">Need to change shipping address</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
            My Orders & Tracking
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track package delivery status and view past purchases
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
          {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 rounded-3xl bg-slate-900/50 border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-white/10 space-y-4">
          <Package className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Orders Found</h3>
          <p className="text-xs text-slate-400">
            {statusFilter === 'All'
              ? "You haven't placed any orders yet."
              : `No orders currently match status: ${statusFilter}`}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
          >
            Start Shopping <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const canCancel =
              order.orderStatus === 'Pending' || order.orderStatus === 'Confirmed';

            return (
              <div
                key={order._id}
                className="p-6 rounded-3xl bg-slate-900/40 border border-white/[0.08] backdrop-blur-md shadow-xl hover:border-white/20 transition-all space-y-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold text-white font-mono">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    {order.trackingNumber && (
                      <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                        Tracking: {order.trackingNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.orderStatus)}
                    <span className="text-base font-bold text-white">
                      ₹{order.totalPrice?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items Thumbnails */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {order.orderItems?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/60 border border-white/5"
                    >
                      <img
                        src={item.image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover bg-slate-900 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-400">Qty: {item.quantity} • ₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Action Footer */}
                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-white/10 gap-3 text-xs">
                  <div className="text-slate-400">
                    Ship to: <span className="text-slate-200 font-medium">{order.shippingAddress?.city}, {order.shippingAddress?.country}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {canCancel && (
                      <button
                        onClick={() => setCancellingOrder(order)}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-medium transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}

                    <Link
                      to={`/order-confirmation/${order._id}`}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      View Invoice / Details <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
