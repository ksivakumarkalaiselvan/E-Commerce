import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    itemsCount,
    subtotal,
    shipping,
    tax,
    coupon,
    discountAmount,
    total,
    freeShippingThreshold,
    progressToFreeShipping,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyCoupon(promoInput.trim());
      setPromoInput('');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center text-indigo-400 mb-6 shadow-2xl shadow-indigo-500/10">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-3 font-['Space_Grotesk']">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-sm text-slate-400 max-w-md mb-8">
          Explore our collection of next-gen acoustics, aerospace wearables, and cybernetic accessories.
        </p>
        <Link
          to="/products"
          className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
        >
          Explore Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <h1 className="text-3xl font-extrabold text-white font-['Space_Grotesk'] mb-2">
        Shopping Bag ({itemsCount} items)
      </h1>
      <p className="text-xs text-slate-400 mb-8">Review items before proceeding to secure checkout</p>

      {/* Free Shipping Progress Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md mb-8">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-slate-300">
            {subtotal >= freeShippingThreshold ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" /> You've unlocked Free Express Delivery!
              </span>
            ) : (
              <span>
                Add <b className="text-white">${(freeShippingThreshold - subtotal).toFixed(2)}</b> more to unlock Free Express Delivery
              </span>
            )}
          </span>
          <span className="text-indigo-400">{progressToFreeShipping}%</span>
        </div>
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="divide-y divide-white/[0.08] rounded-3xl bg-slate-900/40 border border-white/[0.08] backdrop-blur-md overflow-hidden">
            {cartItems.map((item) => {
              const productId = item.product || item._id;
              return (
                <div key={productId} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Image & Title */}
                  <div className="flex items-center gap-4 flex-1">
                    <Link to={`/products/${productId}`} className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-950 shrink-0 border border-white/10">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </Link>
                    <div>
                      <Link to={`/products/${productId}`} className="text-sm font-bold text-white hover:text-indigo-400 transition-colors line-clamp-1">
                        {item.name}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">${item.price} each</p>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                    {/* Stepper */}
                    <div className="flex items-center border border-white/10 rounded-xl bg-slate-950 px-2 py-1">
                      <button
                        onClick={() => updateQuantity(productId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(productId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-sm font-bold text-white block">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Delete item */}
                    <button
                      onClick={() => removeFromCart(productId)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link
              to="/products"
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] pb-4 border-b border-white/10">
              Order Summary
            </h3>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Promo Code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Try SAVE10 or AURA20"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-950 border border-white/10 text-white placeholder-slate-500 uppercase focus:outline-none focus:border-indigo-500"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </div>

              {coupon && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {coupon.code} applied ({coupon.label})
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            {/* Financial Lines */}
            <div className="space-y-3 text-xs text-slate-300 pt-2 border-t border-white/10">
              <div className="flex justify-between">
                <span>Subtotal ({itemsCount} items)</span>
                <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-white">
                  {shipping === 0 ? <span className="text-emerald-400">FREE</span> : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-white">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-white/10 text-base font-extrabold text-white">
                <span>Total Amount</span>
                <span className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
