import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  Grid,
  List,
  ChevronDown,
  RotateCcw,
  Star,
} from 'lucide-react';
import { ProductCard } from '../components/products/ProductCard';
import { QuickViewModal } from '../components/products/QuickViewModal';
import { RatingStars } from '../components/common/RatingStars';
import { initialProducts, initialCategories } from '../data/initialData';

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters state initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [brand, setBrand] = useState(searchParams.get('brand') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || 0);
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || 1500);
  const [rating, setRating] = useState(Number(searchParams.get('rating')) || 0);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const [viewMode, setViewMode] = useState('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Fetch categories and brands on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products/brands'),
        ]);
        const catData = await catRes.json();
        const brandData = await brandRes.json();

        if (catData && catData.success && catData.categories?.length) {
          setCategories(catData.categories);
        } else {
          setCategories(initialCategories);
        }
        if (brandData && brandData.success && brandData.brands?.length) {
          setBrands(brandData.brands);
        } else {
          setBrands([...new Set(initialProducts.map(p => p.brand))]);
        }
      } catch (err) {
        console.warn('Backend API unavailable, using local metadata:', err.message);
        setCategories(initialCategories);
        setBrands([...new Set(initialProducts.map(p => p.brand))]);
      }
    };
    fetchMetadata();
  }, []);

  // Sync state if URL search query changes
  useEffect(() => {
    const qSearch = searchParams.get('search');
    const qCat = searchParams.get('category');
    if (qSearch !== null) setSearch(qSearch);
    if (qCat !== null) setCategory(qCat);
  }, [searchParams]);

  // Fetch products whenever filters or pagination change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.set('search', search);
        if (category && category !== 'All') query.set('category', category);
        if (brand && brand !== 'All') query.set('brand', brand);
        if (minPrice > 0) query.set('minPrice', minPrice);
        if (maxPrice < 1500) query.set('maxPrice', maxPrice);
        if (rating > 0) query.set('rating', rating);
        if (sort) query.set('sort', sort);
        query.set('page', page);
        query.set('limit', 12);

        const res = await fetch(`/api/products?${query.toString()}`);
        const data = await res.json();
        if (data && data.success && data.products) {
          setProducts(data.products || []);
          setTotalPages(data.pages || 1);
          setTotalProducts(data.total || 0);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (err) {
        // Fallback: Filter in-memory products so frontend always works standalone
        let filtered = [...initialProducts];
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
        }
        if (category && category !== 'All') {
          filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
        }
        if (brand && brand !== 'All') {
          filtered = filtered.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
        }
        if (minPrice > 0) {
          filtered = filtered.filter(p => p.price >= minPrice);
        }
        if (maxPrice < 1500) {
          filtered = filtered.filter(p => p.price <= maxPrice);
        }
        if (rating > 0) {
          filtered = filtered.filter(p => (p.rating || 5) >= rating);
        }
        if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
        if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
        if (sort === 'rating') filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        const limit = 12;
        const total = filtered.length;
        const pages = Math.ceil(total / limit) || 1;
        const paged = filtered.slice((page - 1) * limit, page * limit);
        setProducts(paged);
        setTotalPages(pages);
        setTotalProducts(total);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [search, category, brand, minPrice, maxPrice, rating, sort, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setBrand('All');
    setMinPrice(0);
    setMaxPrice(1500);
    setRating(0);
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(search) ||
    category !== 'All' ||
    brand !== 'All' ||
    minPrice > 0 ||
    maxPrice < 1500 ||
    rating > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <QuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-white/[0.08] gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
            All Products & Gear
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showing {products.length} of {totalProducts} items
          </p>
        </div>

        {/* Search, Sort & View controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-white/10 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
              <option value="popular">Most Popular</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View mode buttons */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-900 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Keyword Search Input */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Keywords..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Categories Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Category</label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setCategory('All');
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    category === 'All'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id || c.name}
                    onClick={() => {
                      setCategory(c.name);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      category === c.name
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands Filter */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Brand</label>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setBrand('All');
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    brand === 'All'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  All Brands
                </button>
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setBrand(b);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      brand === b
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Max Price</span>
                <span className="text-indigo-400 font-bold">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="50"
                max="1500"
                step="25"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full accent-indigo-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>₹50</span>
                <span>₹750</span>
                <span>₹1500+</span>
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Customer Rating
              </label>
              <div className="space-y-1">
                {[4, 3, 2].map((minR) => (
                  <button
                    key={minR}
                    onClick={() => {
                      setRating(rating === minR ? 0 : minR);
                      setPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                      rating === minR
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <RatingStars rating={minR} size="w-3.5 h-3.5" />
                    <span className="text-[11px] text-slate-400">& above</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <div className="relative ml-auto w-full max-w-xs bg-slate-900 border-l border-white/10 p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-base font-bold text-white">Filter Products</span>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Category Select */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Max Price */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-white mb-2">
                  <span>Max Price</span>
                  <span className="text-indigo-400">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1500"
                  step="25"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value));
                    setPage(1);
                  }}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  onClick={handleResetFilters}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-lg"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid / List Results */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Active filter badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <span className="text-xs text-slate-400">Active filters:</span>
              {category !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Category: {category}
                  <button onClick={() => setCategory('All')}>
                    <X className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              )}
              {brand !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Brand: {brand}
                  <button onClick={() => setBrand('All')}>
                    <X className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              )}
              {maxPrice < 1500 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Under ₹{maxPrice}
                  <button onClick={() => setMaxPrice(1500)}>
                    <X className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              )}
              {rating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {rating}★ & above
                  <button onClick={() => setRating(0)}>
                    <X className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-400 hover:underline ml-auto"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Items Rendering */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-2xl bg-slate-900/50 border border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-white/10 space-y-4">
              <p className="text-base text-slate-300">
                No products match your selected filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {products.map((p) => (
                <ProductCard key={p._id} product={p} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-semibold transition-colors ${
                    page === i + 1
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-900 border border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
