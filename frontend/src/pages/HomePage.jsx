import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Cpu,
  Watch,
  Headphones,
  Shirt,
  Home,
  Gamepad2,
  Clock,
  ShieldCheck,
  Flame,
  Star,
} from 'lucide-react';
import { ProductCard } from '../components/products/ProductCard';
import { QuickViewModal } from '../components/products/QuickViewModal';
import { initialProducts, initialCategories } from '../data/initialData';

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Flash sale countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch('/api/products?limit=12'),
          fetch('/api/categories'),
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (prodData && prodData.success && prodData.products?.length) {
          setProducts(prodData.products);
        } else {
          setProducts(initialProducts.slice(0, 12));
        }
        if (catData && catData.success && catData.categories?.length) {
          setCategories(catData.categories);
        } else {
          setCategories(initialCategories);
        }
      } catch (err) {
        console.warn('Backend API unavailable, using local product catalog:', err.message);
        setProducts(initialProducts.slice(0, 12));
        setCategories(initialCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter products by tab
  const displayedProducts = products.filter((p) => {
    if (activeTab === 'featured') return p.isFeatured;
    if (activeTab === 'new') return p.isNewArrival;
    return true;
  });

  const categoryIcons = {
    Electronics: <Cpu className="w-6 h-6" />,
    Wearables: <Watch className="w-6 h-6" />,
    'Audio & Sound': <Headphones className="w-6 h-6" />,
    'Fashion & Apparel': <Shirt className="w-6 h-6" />,
    'Home & Living': <Home className="w-6 h-6" />,
    'Gaming & Setup': <Gamepad2 className="w-6 h-6" />,
  };

  return (
    <div className="min-h-screen">
      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-32">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold backdrop-blur-md shadow-lg shadow-indigo-500/10 animate-fade-in">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Next-Gen Hardware & Spatial Sound Drop</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-['Space_Grotesk']">
                Precision Tech.{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200">
                  Aesthetic Luxury.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Discover a curated universe of audiophile spatial acoustics, aerospace titanium wearables, and cybernetic lifestyle gear engineered for modern high-performance living.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/products"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all transform hover:-translate-y-0.5"
                >
                  Explore Catalog <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/products?isFeatured=true"
                  className="px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-white/10 hover:border-white/20 backdrop-blur-md transition-all"
                >
                  Featured Drops
                </Link>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/[0.08] max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-bold text-white font-['Space_Grotesk']">50K+</div>
                  <div className="text-xs text-slate-400">Happy Clients</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-['Space_Grotesk']">4.9 ★</div>
                  <div className="text-xs text-slate-400">Average Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white font-['Space_Grotesk']">99.9%</div>
                  <div className="text-xs text-slate-400">On-Time Express</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
                
                {/* Frosted Glass Floating Card */}
                <div className="rounded-3xl p-4 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/15 shadow-2xl backdrop-blur-2xl relative overflow-hidden group">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950">
                    <img
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                      alt="Featured Headphone"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-600/40">
                      SPOTLIGHT
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                        Spatial Studio Audio
                      </span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9 (48)
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Aura SoundPro X Spatial Headphones
                    </h3>
                    <p className="text-xs text-slate-400">
                      Hybrid ANC with head-tracking spatial audio and 60-hour ultra-endurance battery.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div>
                        <span className="text-xs text-slate-400 block">Special Launch Price</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold text-white">₹299</span>
                          <span className="text-xs text-slate-500 line-through">₹379</span>
                        </div>
                      </div>
                      <Link
                        to="/products"
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
                      >
                        Order Now
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating Metric Pill 1 */}
                <div className="absolute -bottom-5 -left-5 bg-slate-900/90 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-pulse-slow">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Zero Latency Wireless</div>
                    <div className="text-[10px] text-slate-400">LDAC & aptX Adaptive</div>
                  </div>
                </div>

                {/* Floating Metric Pill 2 */}
                <div className="absolute -top-5 -right-5 bg-slate-900/90 border border-white/10 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">2-Year Official Care</div>
                    <div className="text-[10px] text-slate-400">Replacement Guarantee</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Categories Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              <TrendingUp className="w-3.5 h-3.5" /> Curated Ecosystem
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-['Space_Grotesk']">
              Explore Popular Categories
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
          >
            Browse all departments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id || cat.slug}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/80 border border-white/[0.08] hover:border-indigo-500/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(99,102,241,0.25)] flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 border border-white/10 group-hover:border-indigo-500/40 text-indigo-400 group-hover:text-cyan-400 flex items-center justify-center mb-3 transition-colors">
                {categoryIcons[cat.name] || <Cpu className="w-6 h-6" />}
              </div>
              <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Explore</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Cyber Flash Sale Banner with Countdown */}
      <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold tracking-wide">
                <Flame className="w-4 h-4 fill-rose-400" /> LIMITED FLASH SALE
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
                Save up to 35% on Premium Audio & Gaming Gear
              </h3>
              <p className="text-sm text-slate-300 max-w-lg">
                Use checkout coupon code <span className="text-cyan-400 font-bold">AURA20</span> for an extra 20% discount on all purchases today.
              </p>

              {/* Countdown Clocks */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mr-2 font-medium">
                  <Clock className="w-4 h-4 text-cyan-400" /> Ends In:
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-center min-w-[50px]">
                    <span className="text-lg font-bold text-white block leading-none font-['Space_Grotesk']">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Hours</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-center min-w-[50px]">
                    <span className="text-lg font-bold text-white block leading-none font-['Space_Grotesk']">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Mins</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-center min-w-[50px]">
                    <span className="text-lg font-bold text-cyan-400 block leading-none font-['Space_Grotesk']">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">Secs</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <Link
                to="/products?isFeatured=true"
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all transform hover:-translate-y-1"
              >
                Claim Flash Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Showcase Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
              Top Tier Hardware
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Space_Grotesk']">
              Trending Products
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/80 border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'featured'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Featured
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'new'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-2xl bg-slate-900/50 border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            No products found matching this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider border border-white/10 hover:border-indigo-500/40 transition-all shadow-lg"
          >
            View Complete Catalog ({products.length} Products) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
