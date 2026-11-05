import React, { useState } from 'react';
import {
  User,
  MapPin,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export const ProfilePage = () => {
  const { user, updateProfile, addAddress, removeAddress, changePassword, isAdmin } = useAuth();
  const { wishlistCount } = useWishlist();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // New address form state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    isDefault: false,
  });

  // Password change state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPass, setChangingPass] = useState(false);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        Please sign in to view your profile.
      </div>
    );
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateProfile({ name, phone });
    setSavingProfile(false);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
      addToast({ message: 'Please complete all address fields.', type: 'error' });
      return;
    }
    const res = await addAddress(newAddress);
    if (res.success) {
      setShowAddAddress(false);
      setNewAddress({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        isDefault: false,
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast({ message: 'New passwords do not match.', type: 'error' });
      return;
    }
    setChangingPass(true);
    const res = await changePassword(passwords.currentPassword, passwords.newPassword);
    setChangingPass(false);
    if (res.success) {
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Top Profile Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 shadow-2xl mb-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[2px] shadow-xl">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-3xl font-extrabold text-white uppercase">
              {user.name.charAt(0)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
                {user.name}
              </h1>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{user.email}</p>
            <p className="text-xs text-slate-500 mt-1">
              Member since {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Quick metrics */}
        <div className="flex gap-4">
          <div className="px-4 py-3 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-xl font-bold text-white block">{user.addresses?.length || 0}</span>
            <span className="text-[10px] text-slate-400 uppercase">Addresses</span>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-xl font-bold text-pink-400 block">{wishlistCount}</span>
            <span className="text-[10px] text-slate-400 uppercase">Wishlist</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Tab Sidebar */}
        <div className="space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <User className="w-4 h-4" /> Personal Information
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'addresses'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <MapPin className="w-4 h-4" /> Saved Addresses ({user.addresses?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Lock className="w-4 h-4" /> Password & Security
          </button>
        </div>

        {/* Tab Panels */}
        <div className="md:col-span-3">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
              <h2 className="text-lg font-bold text-white font-['Space_Grotesk'] pb-3 border-b border-white/10">
                Personal Information
              </h2>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Email Address (Account ID)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950/50 border border-white/5 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="text-lg font-bold text-white font-['Space_Grotesk']">
                  Saved Delivery Addresses
                </h2>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add New Address
                </button>
              </div>

              {/* Add Address Form */}
              {showAddAddress && (
                <form
                  onSubmit={handleAddAddress}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4 animate-fade-in"
                >
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    New Shipping Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Street Address & Apt / Suite"
                        required
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="w-full p-2.5 rounded-xl text-xs bg-slate-900 border border-white/10 text-white"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="p-2.5 rounded-xl text-xs bg-slate-900 border border-white/10 text-white"
                    />
                    <input
                      type="text"
                      placeholder="State / Province"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="p-2.5 rounded-xl text-xs bg-slate-900 border border-white/10 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Postal Code"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="p-2.5 rounded-xl text-xs bg-slate-900 border border-white/10 text-white"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      className="p-2.5 rounded-xl text-xs bg-slate-900 border border-white/10 text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        className="rounded accent-indigo-600"
                      />
                      Set as primary default address
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddAddress(false)}
                        className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Saved Addresses List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 col-span-2">
                    No saved addresses found. Add an address to enable fast checkout.
                  </p>
                ) : (
                  user.addresses?.map((addr) => (
                    <div
                      key={addr._id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          {addr.city}, {addr.state}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300">{addr.street}</p>
                      <p className="text-xs text-slate-400">{addr.postalCode}, {addr.country}</p>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => removeAddress(addr._id)}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
              <h2 className="text-lg font-bold text-white font-['Space_Grotesk'] pb-3 border-b border-white/10">
                Change Account Password
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    New Password (at least 6 characters)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-950 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPass}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {changingPass ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
