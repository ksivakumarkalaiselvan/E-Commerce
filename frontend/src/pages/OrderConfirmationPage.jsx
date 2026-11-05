import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Package,
  Truck,
  CreditCard,
  Printer,
  ArrowRight,
  Clock,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const OrderConfirmationPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trigger festive confetti explosion
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
      });
    } catch (e) {
      // Ignore if blocked
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem('aura_token')}`,
          },
        });
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to load order receipt:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-white mb-2">Order Not Found</h2>
        <Link to="/orders" className="text-xs font-semibold text-indigo-400">
          View All Your Orders
        </Link>
      </div>
    );
  }

  // Steps for timeline
  const orderSteps = [
    { title: 'Order Placed', desc: 'Order details received' },
    { title: 'Confirmed', desc: order.isPaid ? 'Payment verified' : 'Processing order' },
    { title: 'Shipped', desc: 'Handed to courier' },
    { title: 'Delivered', desc: 'Package arrived' },
  ];

  const getStepStatus = (index) => {
    if (order.orderStatus === 'Cancelled') return 'cancelled';
    if (order.orderStatus === 'Delivered') return 'completed';
    if (order.orderStatus === 'Shipped') return index <= 2 ? 'completed' : 'pending';
    if (order.orderStatus === 'Confirmed') return index <= 1 ? 'completed' : 'pending';
    return index === 0 ? 'completed' : 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      {/* Top Celebration Card */}
      <div className="text-center space-y-3 mb-10">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
          Thank You! Your Order is Confirmed
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
          An order confirmation receipt has been generated. We've notified our fulfillment center to prepare your hardware.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs font-mono text-cyan-400">
          Order ID: <b className="text-white">{order.orderNumber}</b>
        </div>
      </div>

      {/* Interactive Status Progress Timeline */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl mb-10">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-400" /> Tracking Status:
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              order.orderStatus === 'Delivered'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : order.orderStatus === 'Cancelled'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            }`}>
              {order.orderStatus}
            </span>
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Placed on {new Date(order.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* 4 Steps timeline */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {orderSteps.map((step, idx) => {
            const status = getStepStatus(idx);
            const isDone = status === 'completed';

            return (
              <div key={idx} className="relative">
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-indigo-600/10 border-indigo-500/40'
                    : 'bg-slate-950/60 border-white/5 opacity-60'
                }`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold mb-2 ${
                    isDone ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <h4 className="text-xs font-bold text-white">{step.title}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Printable Receipt Container */}
      <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-xl shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Itemized Official Invoice
            </h2>
            <p className="text-xs text-slate-400">Payment Method: {order.paymentMethod}</p>
          </div>

          <button
            onClick={handlePrint}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>

        {/* Order Items Table */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Purchased Hardware ({order.orderItems?.length})
          </span>
          <div className="divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden bg-slate-950/60">
            {order.orderItems?.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover bg-slate-900 shrink-0" />
                  <div>
                    <h5 className="font-bold text-white">{item.name}</h5>
                    <p className="text-slate-400 text-[11px]">${item.price} × {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-white">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Destination & Payment Info Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-1.5">
            <span className="font-bold text-indigo-400 block uppercase tracking-wider text-[11px]">
              Delivery Destination
            </span>
            <p className="font-semibold text-white">{order.shippingAddress?.name}</p>
            <p className="text-slate-300">{order.shippingAddress?.street}</p>
            <p className="text-slate-400">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
            </p>
            <p className="text-slate-400">{order.shippingAddress?.country}</p>
            <p className="text-slate-500 pt-1">Phone: {order.shippingAddress?.phone}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
            <span className="font-bold text-cyan-400 block uppercase tracking-wider text-[11px]">
              Payment Summary
            </span>
            <div className="flex justify-between text-slate-300">
              <span>Subtotal:</span>
              <span className="text-white font-semibold">${order.itemsPrice?.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount:</span>
                <span>-${order.discountAmount?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-300">
              <span>Shipping Fee:</span>
              <span className="text-white font-semibold">
                {order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Sales Tax:</span>
              <span className="text-white font-semibold">${order.taxPrice?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10 text-sm">
              <span>Total Paid:</span>
              <span className="text-cyan-400">${order.totalPrice?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
        <Link
          to="/orders"
          className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          Track All Orders <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/products"
          className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 font-semibold text-xs uppercase tracking-wider transition-all"
        >
          Back to Store Catalog
        </Link>
      </div>
    </div>
  );
};
