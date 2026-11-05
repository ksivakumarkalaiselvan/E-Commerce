import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { RatingStars } from '../components/common/RatingStars';

export const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center min-h-[65vh] flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-white/10 flex items-center justify-center text-pink-400 mb-6 shadow-2xl">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-2 font-['Space_Grotesk']">
          Your Wishlist is Empty
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          Save items you love by tapping the heart icon on any product card.
        </p>
        <Link
          to="/products"
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 flex items-center gap-2"
        >
          Explore Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-['Space_Grotesk']">
            Saved Wishlist ({wishlist.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage your favorite products and move them to cart</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlist.map((product) => {
          const productId = product._id || product.id;
          return (
            <div
              key={productId}
              className="rounded-2xl bg-slate-900/40 border border-white/[0.08] backdrop-blur-md overflow-hidden flex flex-col justify-between group hover:border-indigo-500/30 transition-all hover:-translate-y-1"
            >
              <div className="relative aspect-square bg-slate-950 overflow-hidden">
                <img
                  src={product.images ? product.images[0] : product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => removeFromWishlist(productId)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500 text-slate-300 hover:text-white border border-white/10 transition-colors shadow-lg"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                  {product.category}
                </div>
                <Link
                  to={`/products/${productId}`}
                  className="text-sm font-bold text-white hover:text-indigo-400 line-clamp-1 block transition-colors"
                >
                  {product.name}
                </Link>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-base font-bold text-white">${product.price}</span>
                  <RatingStars rating={product.rating || 5} size="w-3.5 h-3.5" />
                </div>

                <button
                  onClick={() => {
                    addToCart(product, 1);
                    removeFromWishlist(productId);
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
