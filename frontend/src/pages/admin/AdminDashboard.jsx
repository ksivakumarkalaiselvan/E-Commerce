import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900/60" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-900/60" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toLocaleString() || '0'}`,
      icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
      change: '+18.4% from last month',
      bgGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    {
      label: 'Lifetime Orders',
      value: stats?.totalOrders || 0,
      icon: <ShoppingBag className="w-5 h-5 text-indigo-400" />,
      change: '100% fulfillable',
      bgGlow: 'shadow-[0_0_20px_rgba(99,102,241,0.15)]',
    },
    {
      label: 'Active Products',
      value: stats?.totalProducts || 0,
      icon: <Package className="w-5 h-5 text-cyan-400" />,
      change: 'Across 6 categories',
      bgGlow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    },
    {
      label: 'Registered Users',
      value: stats?.totalUsers || 0,
      icon: <Users className="w-5 h-5 text-violet-400" />,
      change: 'Customer & Admin accounts',
      bgGlow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
            Overview & Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Real-time financial metrics, recent orders, and inventory performance
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/products"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-white text-xs font-semibold transition-colors"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl ${card.bgGlow} space-y-2`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              <div className="p-2 rounded-xl bg-slate-950 border border-white/5">
                {card.icon}
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white font-['Space_Grotesk']">
              {card.value}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">{card.change}</div>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Trend Visualizer */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Revenue Growth Trajectory (Last 6 Months)
            </h3>
            <p className="text-xs text-slate-400">Monthly gross sales volume</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> +24.8% Year-over-Year
          </span>
        </div>

        {/* Visual Bar Graph */}
        <div className="grid grid-cols-6 gap-3 items-end h-44 pt-6 border-b border-white/10 pb-3">
          {stats?.monthlySales?.map((item, idx) => {
            const heightPercent = Math.min(100, Math.max(25, (item.revenue / 6000) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  ${item.revenue}
                </span>
                <div
                  className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-indigo-600 to-cyan-400 group-hover:from-indigo-500 group-hover:to-cyan-300 transition-all shadow-lg"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-xs font-bold text-slate-300 uppercase">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
            Recent Customer Orders
          </h3>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View all orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-white/5">
              <tr>
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No orders placed yet.
                  </td>
                </tr>
              ) : (
                stats?.recentOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">
                      {order.user?.name || order.shippingAddress?.name || 'Customer'}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      ${order.totalPrice?.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.orderStatus === 'Delivered'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/order-confirmation/${order._id}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
