import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Shield,
  Package,
  LogOut,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { itemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setSearchDropdownOpen(false);
  }, [location.pathname]);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setSearchDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.products || []);
          setSearchDropdownOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080b11]/80 backdrop-blur-xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-300 font-['Space_Grotesk']">
                AURA
              </span>
              <span className="text-[10px] tracking-widest text-cyan-400 block -mt-1 font-semibold uppercase">
                Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link
              to="/"
              className={`hover:text-white transition-colors ${
                location.pathname === '/' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`hover:text-white transition-colors ${
                location.pathname === '/products' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              Shop Catalog
            </Link>
            <Link
              to="/products?category=Electronics"
              className="hover:text-white transition-colors"
            >
              Electronics
            </Link>
            <Link
              to="/products?category=Wearables"
              className="hover:text-white transition-colors"
            >
              Wearables
            </Link>
            <Link
              to="/orders"
              className={`hover:text-white transition-colors ${
                location.pathname === '/orders' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              Track Orders
            </Link>
          </nav>

          {/* Live Search Bar */}
          <div ref={searchRef} className="relative hidden md:block flex-1 max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products, brands, tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setSearchDropdownOpen(true)}
                className="w-full pl-10 pr-10 py-2.5 rounded-full text-sm bg-slate-900/70 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 backdrop-blur-md transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setSearchDropdownOpen(false);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Instant Search Dropdown */}
            {searchDropdownOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50 animate-slide-up">
                <div className="p-2 divide-y divide-white/5">
                  {searchResults.map((item) => (
                    <Link
                      key={item._id}
                      to={`/products/${item._id}`}
                      onClick={() => setSearchDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-11 h-11 rounded-lg object-cover bg-slate-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate group-hover:text-indigo-400 transition-colors">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-400">{item.brand} • {item.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-white">${item.price}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="bg-slate-950/60 p-2.5 text-center border-t border-white/5">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5"
                  >
                    View all results for "{searchQuery}" <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Icons & User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-pink-500/40 animate-pulse-slow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40">
                  {itemsCount}
                </span>
              )}
            </Link>

            {/* User Account Dropdown */}
            {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/40 hover:bg-white/5 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-slate-200 hidden sm:block max-w-[100px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl p-2 z-50 animate-slide-up">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          <Shield className="w-2.5 h-2.5" /> Administrator
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white hover:bg-indigo-600/20 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-indigo-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile & Addresses
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      Orders & Tracking
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-slate-400" />
                      Wishlist ({wishlistCount})
                    </Link>

                    <div className="border-t border-white/5 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0e17]/95 border-b border-white/10 px-4 pt-3 pb-6 space-y-4 backdrop-blur-2xl animate-fade-in">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-slate-900 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          <nav className="flex flex-col space-y-2 pt-2">
            <Link
              to="/"
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              All Products
            </Link>
            <Link
              to="/products?category=Electronics"
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Electronics & Tech
            </Link>
            <Link
              to="/products?category=Wearables"
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Wearables & Audio
            </Link>
            <Link
              to="/orders"
              className="px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5"
            >
              Track Orders
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-xl text-sm font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20"
              >
                Admin Control Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
