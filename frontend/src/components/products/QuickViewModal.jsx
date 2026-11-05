import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Heart, Check, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { RatingStars } from '../common/RatingStars';

export const QuickViewModal = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(
    product.images && product.images[0] ? product.images[0] : ''
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const productId = product._id || product.id;
  const inWishlist = isInWishlist(productId);

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;
    await addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative bg-[#0b0f19] border border-white/10 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden z-10 animate-fade-in my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Gallery Col */}
          <div className="p-6 bg-slate-950/50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10">
            <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 mb-4 border border-white/5">
              <img
                src={selectedImage || (product.images && product.images[0])}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === img
                        ? 'border-indigo-500 scale-105'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Col */}
          <div className="p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-1">
                <span>{product.category}</span>
                <span className="text-slate-400">{product.brand}</span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">{product.name}</h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <RatingStars
                  rating={product.rating || 5}
                  showScore={true}
                  reviewsCount={product.numReviews || 0}
                />
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-extrabold text-white">
                  ${product.price}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-sm text-slate-500 line-through">
                      ${product.originalPrice}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Save {product.discountPercent}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                {product.shortDescription || product.description}
              </p>

              {/* Features list */}
              {product.features && product.features.length > 0 && (
                <ul className="space-y-1 text-xs text-slate-400 mb-4">
                  {product.features.slice(0, 2).map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              )}

              {/* Stock info */}
              <div className="text-xs font-medium text-slate-300">
                Availability:{' '}
                {product.stock > 0 ? (
                  <span className="text-emerald-400 font-semibold">
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-3">
                {/* Quantity input */}
                <div className="flex items-center border border-white/10 rounded-xl bg-slate-900/80 px-2 py-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    product.stock <= 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </>
                  )}
                </button>

                {/* Wishlist toggle */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3 rounded-xl border transition-colors ${
                    inWishlist
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : 'border-white/10 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* View Full Product Link */}
              <Link
                to={`/products/${productId}`}
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 flex items-center justify-center gap-2 transition-colors"
              >
                View Full Product Specs & Reviews <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
