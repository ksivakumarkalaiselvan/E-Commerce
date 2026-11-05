import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      addToast({
        message: 'Subscribed! Check your inbox for your 10% welcome coupon (SAVE10).',
        type: 'success',
      });
      setEmail('');
    } else {
      addToast({ message: 'Please enter a valid email address.', type: 'error' });
    }
  };

  return (
    <footer className="bg-[#05070b] border-t border-white/[0.08] text-slate-400 text-sm mt-20">
      {/* Top Value Banner */}
      <div className="border-b border-white/[0.06] py-10 bg-gradient-to-b from-[#0a0d14] to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Free Express Delivery</h4>
                <p className="text-xs text-slate-400">On all qualified orders over ₹150</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">2-Year Official Warranty</h4>
                <p className="text-xs text-slate-400">100% genuine guaranteed products</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">30-Day Hassle-Free Returns</h4>
                <p className="text-xs text-slate-400">Instant full refund or replacements</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">24/7 Dedicated Support</h4>
                <p className="text-xs text-slate-400">Live technical and order assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold tracking-wider text-white font-['Space_Grotesk']">
                AURA
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              Engineered for tomorrow. A modern shopping destination curating premium spatial audio, aerospace-grade wearables, next-gen workstations, and cyberpunk apparel.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2 pt-2 max-w-sm">
              <label className="text-xs font-semibold text-slate-300 block">
                Stay updated on limited drops & flash sales
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shrink-0 shadow-lg shadow-indigo-600/30"
                >
                  Join
                </button>
              </div>
              {subscribed && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Welcome! Use promo code <b className="text-white">SAVE10</b> for 10% off.
                </p>
              )}
            </form>
          </div>

          {/* Quick Categories */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Explore Collections
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/products?category=Electronics" className="hover:text-indigo-400 transition-colors">
                  Electronics & Displays
                </Link>
              </li>
              <li>
                <Link to="/products?category=Wearables" className="hover:text-indigo-400 transition-colors">
                  Smartwatches & Rings
                </Link>
              </li>
              <li>
                <Link to="/products?category=Audio+%26+Sound" className="hover:text-indigo-400 transition-colors">
                  Studio Audio & ANC
                </Link>
              </li>
              <li>
                <Link to="/products?category=Gaming+%26+Setup" className="hover:text-indigo-400 transition-colors">
                  Mechanical Keyboards & Mice
                </Link>
              </li>
              <li>
                <Link to="/products?category=Fashion+%26+Apparel" className="hover:text-indigo-400 transition-colors">
                  Cyberpunk Streetwear
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Customer Support
            </h5>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/orders" className="hover:text-indigo-400 transition-colors">
                  Order Status & Tracking
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-indigo-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-indigo-400 transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Warranty Registration</span>
              </li>
              <li>
                <span className="text-slate-500 cursor-default">Shipping & Delivery Rates</span>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Accepted Payments
            </h5>
            <p className="text-xs text-slate-400 mb-3">
              We process high-encryption payments securely with multiple verified gateways.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-[10px] font-semibold text-slate-300">
                Stripe
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-[10px] font-semibold text-slate-300">
                Razorpay
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-[10px] font-semibold text-slate-300">
                Visa / Master
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-[10px] font-semibold text-slate-300">
                UPI / NetBanking
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-[10px] font-semibold text-emerald-400">
                Cash on Delivery
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.06] mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AURA Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Security Overview</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
