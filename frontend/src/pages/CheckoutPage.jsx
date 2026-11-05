import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Plus,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cartItems, subtotal, shipping, tax, discountAmount, total, clearCart } = useCart();
  const { addToast } = useToast();

  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [loading, setLoading] = useState(false);

  // Shipping form state
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
  });

  const [selectedSavedAddr, setSelectedSavedAddr] = useState('');
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);

  // Simulated card input state
  const [cardData, setCardData] = useState({
    cardNumber: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvc: '888',
    nameOnCard: user?.name || 'Authorized Buyer',
  });

  // Pre-fill default address if available
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setSelectedSavedAddr(defaultAddr._id);
      setAddress({
        name: user.name,
        phone: user.phone || '555-0199',
        street: defaultAddr.street,
        city: defaultAddr.city,
        state: defaultAddr.state,
        postalCode: defaultAddr.postalCode,
        country: defaultAddr.country || 'United States',
      });
    }
  }, [user]);

  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedSavedAddr(addr._id);
    setAddress({
      name: user.name,
      phone: user.phone || '555-0199',
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!address.name || !address.street || !address.city || !address.state || !address.postalCode) {
      addToast({ message: 'Please complete all required shipping address fields.', type: 'error' });
      return;
    }

    if (!user) {
      addToast({ message: 'Please sign in or register to complete your order.', type: 'warning' });
      navigate('/login?redirect=/checkout');
      return;
    }

    setLoading(true);

    try {
      const isOnlinePayment = paymentMethod === 'Stripe' || paymentMethod === 'Razorpay';
      let paymentResult = {};

      if (isOnlinePayment) {
        // Step 1: Create Payment Intent
        const intentRes = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: total,
            currency: 'INR',
            gateway: paymentMethod,
          }),
        });
        const intentData = await intentRes.json();
        if (!intentRes.ok || !intentData.success) {
          throw new Error(intentData.message || 'Payment session initialization failed');
        }

        paymentResult = {
          id: intentData.transactionId,
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          email_address: user.email,
        };
      }

      // Step 2: Create Order in Backend
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.product || item._id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        discountAmount,
        totalPrice: total,
        isPaid: isOnlinePayment,
        paymentResult,
      };

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || 'Order placement failed');
      }

      // Step 3: Record Payment capture if online
      if (isOnlinePayment) {
        await fetch('/api/payments/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: orderData.order._id,
            transactionId: paymentResult.id,
            gateway: paymentMethod,
            amount: total,
            currency: 'INR',
          }),
        });
      }

      // If user checked saveAddress, save to profile
      if (saveAddressToAccount && !selectedSavedAddr) {
        await fetch('/api/auth/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(address),
        });
      }

      // Clear local cart
      await clearCart();
      addToast({ message: 'Order placed successfully!', type: 'success' });

      // Navigate to order confirmation
      navigate(`/order-confirmation/${orderData.order._id}`);
    } catch (err) {
      console.error('Checkout error:', err);
      addToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
            Secure Checkout
          </h1>
          <p className="text-xs text-slate-400">Complete your shipping address and select payment</p>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Address & Payment Selection */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Shipping Address */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" /> 1. Shipping Destination
              </h2>
              {user && (
                <span className="text-xs text-slate-400">Logged in as {user.email}</span>
              )}
            </div>

            {/* Saved Addresses Selector (if logged in and has addresses) */}
            {user && user.addresses && user.addresses.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 block">
                  Select from Saved Addresses
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {user.addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                        selectedSavedAddr === addr._id
                          ? 'border-indigo-500 bg-indigo-600/10 shadow-lg shadow-indigo-500/10'
                          : 'border-white/10 bg-slate-950/60 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 font-bold text-white">
                        <span>{addr.city}, {addr.state}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300">{addr.street}</p>
                      <p className="text-slate-400">{addr.postalCode}, {addr.country}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Address Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={address.name}
                  onChange={(e) => {
                    setSelectedSavedAddr('');
                    setAddress({ ...address, name: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Contact Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 019-2834"
                  value={address.phone}
                  onChange={(e) => {
                    setSelectedSavedAddr('');
                    setAddress({ ...address, phone: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Street Address & Apartment/Suite *
                </label>
                <input
                  type="text"
                  required
                  placeholder="100 Silicon Boulevard, Suite 400"
                  value={address.street}
                  onChange={(e) => {
                    setSelectedSavedAddr('');
                    setAddress({ ...address, street: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="San Francisco"
                  value={address.city}
                  onChange={(e) => {
                    setSelectedSavedAddr('');
                    setAddress({ ...address, city: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  State / Province *
                </label>
                <input
                  type="text"
                  required
                  placeholder="CA"
                  value={address.state}
                  onChange={(e) => {
                    setSelectedSavedAddr('');
                    setAddress({ ...address, state: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Postal / ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="94107"
                  value={address.postalCode}
                  onChange={(e) => {
                    setSelectedSavedAddr('');
                    setAddress({ ...address, postalCode: e.target.value });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  value={address.country}
                  onChange={(e) => setAddress({ ...address, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {user && (
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={saveAddressToAccount}
                  onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                  className="rounded text-indigo-600 accent-indigo-600 bg-slate-950 border-white/20"
                />
                <span className="text-xs text-slate-300">
                  Save this shipping address to my user profile for future checkouts
                </span>
              </label>
            )}
          </div>

          {/* Section 2: Payment Gateway Selection */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2 pb-4 border-b border-white/10">
              <CreditCard className="w-5 h-5 text-cyan-400" /> 2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Stripe Card option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Stripe')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'Stripe'
                    ? 'border-indigo-500 bg-indigo-600/10 shadow-lg shadow-indigo-500/10'
                    : 'border-white/10 bg-slate-950/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <span className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center">
                    {paymentMethod === 'Stripe' && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                  </span>
                </div>
                <div className="text-xs font-bold text-white">Stripe Checkout</div>
                <div className="text-[10px] text-slate-400">Instant Credit/Debit Card</div>
              </button>

              {/* Razorpay option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Razorpay')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'border-cyan-500 bg-cyan-600/10 shadow-lg shadow-cyan-500/10'
                    : 'border-white/10 bg-slate-950/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center">
                    {paymentMethod === 'Razorpay' && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                  </span>
                </div>
                <div className="text-xs font-bold text-white">Razorpay</div>
                <div className="text-[10px] text-slate-400">UPI, NetBanking & Cards</div>
              </button>

              {/* Cash on Delivery option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-emerald-500 bg-emerald-600/10 shadow-lg shadow-emerald-500/10'
                    : 'border-white/10 bg-slate-950/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Truck className="w-5 h-5 text-emerald-400" />
                  <span className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center">
                    {paymentMethod === 'Cash on Delivery' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                  </span>
                </div>
                <div className="text-xs font-bold text-white">Cash on Delivery</div>
                <div className="text-[10px] text-slate-400">Pay upon delivery</div>
              </button>
            </div>

            {/* Credit Card Input Preview if Stripe or Razorpay selected */}
            {(paymentMethod === 'Stripe' || paymentMethod === 'Razorpay') && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Simulated Card Information (Pre-Filled Test Card)
                </span>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={cardData.cardNumber}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-white/10 text-white font-mono"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cardData.expiry}
                      readOnly
                      className="px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-white/10 text-white font-mono"
                    />
                    <input
                      type="text"
                      value={cardData.cvc}
                      readOnly
                      className="px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 border border-white/10 text-white font-mono"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Direct sandbox integration with auto-captured receipts
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Review & Submit */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 sticky top-28">
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] pb-4 border-b border-white/10">
              Order Review ({cartItems.length} items)
            </h3>

            {/* Thumbnail items list */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-white/5">
              {cartItems.map((item) => (
                <div key={item.product || item._id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={item.image} alt="" className="w-9 h-9 rounded-lg object-cover bg-slate-950 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate max-w-[130px]">{item.name}</p>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-white shrink-0">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-white/10">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-white">
                  {shipping === 0 ? <span className="text-emerald-400">FREE</span> : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="font-semibold text-white">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-4 border-t border-white/10 text-base font-extrabold text-white">
                <span>Payable Total</span>
                <span className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Place Order Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Secure Order...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Place Order & Pay ₹{total.toFixed(2)}
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              By placing this order you agree to AURA's Terms of Service and official warranty policy.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
};
