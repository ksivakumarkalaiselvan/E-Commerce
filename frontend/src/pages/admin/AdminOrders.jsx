import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminOrders = () => {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Order Details Modal state
  const [inspectOrder, setInspectOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url =
        statusFilter && statusFilter !== 'All'
          ? `/api/admin/orders?status=${statusFilter}&limit=100`
          : '/api/admin/orders?limit=100';

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update status');
      }

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
      if (inspectOrder && inspectOrder._id === orderId) {
        setInspectOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
      addToast({ message: `Order status set to "${newStatus}"!`, type: 'success' });
    } catch (err) {
      addToast({ message: err.message, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateTracking = async (orderId, trackingNumber) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'Shipped', trackingNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, trackingNumber, orderStatus: 'Shipped' } : o))
        );
        addToast({ message: 'Tracking number updated & marked as Shipped!', type: 'success' });
      }
    } catch (err) {
      addToast({ message: err.message, type: 'error' });
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const idMatch = o.orderNumber?.toLowerCase().includes(q);
    const userMatch = (o.user?.name || o.shippingAddress?.name || '').toLowerCase().includes(q);
    return idMatch || userMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
            Customer Orders Management
          </h1>
          <p className="text-xs text-slate-400">
            Review live order requests, update courier fulfillment, and inspect transactions
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

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Filter by Order ID or Customer Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading customer orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No orders matching this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {order.user?.name || order.shippingAddress?.name || 'Guest User'}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      ${order.totalPrice?.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded-md border border-white/5">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={order.orderStatus}
                        disabled={updatingId === order._id}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border cursor-pointer ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : order.orderStatus === 'Shipped'
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                            : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                        }`}
                      >
                        <option value="Pending" className="bg-slate-900 text-amber-400">Pending</option>
                        <option value="Confirmed" className="bg-slate-900 text-indigo-400">Confirmed</option>
                        <option value="Shipped" className="bg-slate-900 text-cyan-400">Shipped</option>
                        <option value="Delivered" className="bg-slate-900 text-emerald-400">Delivered</option>
                        <option value="Cancelled" className="bg-slate-900 text-rose-400">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setInspectOrder(order)}
                        className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-white border border-white/10 font-semibold"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Order Modal */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setInspectOrder(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Order Details ({inspectOrder.orderNumber})
                </h3>
                <span className="text-[11px] text-slate-400">
                  Placed {new Date(inspectOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setInspectOrder(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Shipping Details */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-1 text-xs">
              <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[10px]">
                Customer & Shipping
              </span>
              <p className="font-bold text-white">{inspectOrder.shippingAddress?.name}</p>
              <p className="text-slate-300">{inspectOrder.shippingAddress?.street}</p>
              <p className="text-slate-400">
                {inspectOrder.shippingAddress?.city}, {inspectOrder.shippingAddress?.state}{' '}
                {inspectOrder.shippingAddress?.postalCode}, {inspectOrder.shippingAddress?.country}
              </p>
              <p className="text-slate-400 pt-1">Phone: {inspectOrder.shippingAddress?.phone}</p>
            </div>

            {/* Courier Tracking Input */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-2">
              <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                Tracking Number
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. FEDEX-982187319"
                  defaultValue={inspectOrder.trackingNumber || ''}
                  id="trackingInput"
                  className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-900 border border-white/10 text-white"
                />
                <button
                  onClick={() => {
                    const val = document.getElementById('trackingInput').value;
                    handleUpdateTracking(inspectOrder._id, val);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
                >
                  Save & Ship
                </button>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">Ordered Items</span>
              <div className="divide-y divide-white/5 border border-white/5 rounded-2xl bg-slate-950/60 overflow-hidden">
                {inspectOrder.orderItems?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img src={item.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-slate-900" />
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-[10px] text-slate-400">${item.price} × {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-white/10">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-white">${inspectOrder.itemsPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping & Delivery:</span>
                <span className="font-semibold text-white">${inspectOrder.shippingPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1 border-t border-white/5 text-sm">
                <span>Total Amount:</span>
                <span className="text-cyan-400">${inspectOrder.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
