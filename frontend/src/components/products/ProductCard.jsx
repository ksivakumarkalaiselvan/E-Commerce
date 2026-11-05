import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Eye, Check, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { RatingStars } from '../common/RatingStars';

export const ProductCard = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const productId = product._id || product.id;
  const inWishlist = isInWishlist(productId);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    setAdding(true);
    await addToCart(product, 1);
    setAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="group relative rounded-2xl bg-slate-900/40 border border-white/[0.08] backdrop-blur-md overflow-hidden flex flex-col transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.25)] hover:-translate-y-1">
      {/* Top Image Container */}
      <Link to={`/products/${productId}`} className="relative block aspect-square overflow-hidden bg-slate-950/60">
        <img
          src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.discountPercent > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/90 text-white backdrop-blur-md shadow-lg shadow-rose-500/30">
              -{product.discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/90 text-white backdrop-blur-md shadow-lg shadow-cyan-500/30">
              NEW
            </span>
          )}
          {product.isFeatured && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/90 text-white backdrop-blur-md shadow-lg shadow-amber-500/30">
              FEATURED
            </span>
          )}
        </div>

        {/* Wishlist and Quick View Floating Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={handleWishlistClick}
            className={`w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-xl border transition-all ${
              inWishlist
                ? 'bg-rose-500/90 border-rose-400 text-white shadow-lg shadow-rose-500/40'
                : 'bg-slate-900/70 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            aria-label="Save to Wishlist"
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>

          {onQuickView && (
            <button
              onClick={handleQuickViewClick}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-900/70 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
              aria-label="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stock Overlay if Out of Stock */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-medium uppercase tracking-wider text-indigo-400/90">
              {product.category}
            </span>
            <span className="truncate max-w-[100px] text-slate-500">{product.brand}</span>
          </div>

          <Link
            to={`/products/${productId}`}
            className="block text-sm font-semibold text-slate-100 hover:text-indigo-400 transition-colors line-clamp-2"
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="mt-2 flex items-center justify-between">
            <RatingStars
              rating={product.rating || 5.0}
              size="w-3.5 h-3.5"
              showScore={true}
              reviewsCount={product.numReviews || 0}
            />

            {/* Stock status indicator */}
            {isLowStock && (
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-white tracking-tight">
                ${product.price}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                : justAdded
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-indigo-600/80 hover:bg-indigo-500 text-white border border-indigo-400/30 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-95'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
