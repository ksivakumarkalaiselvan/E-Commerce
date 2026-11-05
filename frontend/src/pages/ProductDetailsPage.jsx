import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Star,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { RatingStars } from '../components/common/RatingStars';
import { ProductCard } from '../components/products/ProductCard';

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Review submission form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setSelectedImage(data.product.images[0]);

          // Fetch reviews
          const revRes = await fetch(`/api/products/${data.product._id}/reviews`);
          const revData = await revRes.json();
          if (revData.success) setReviews(revData.reviews || []);

          // Fetch related products in same category
          const relRes = await fetch(`/api/products?category=${encodeURIComponent(data.product.category)}&limit=4`);
          const relData = await relRes.json();
          if (relData.success) {
            setRelatedProducts((relData.products || []).filter((p) => p._id !== data.product._id));
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-slate-900 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 bg-slate-900 rounded w-1/3" />
            <div className="h-10 bg-slate-900 rounded w-3/4" />
            <div className="h-6 bg-slate-900 rounded w-1/4" />
            <div className="h-32 bg-slate-900 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
        <p className="text-slate-400 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs">
          Back to Shop Catalog
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    await addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await addToCart(product, quantity);
    navigate('/checkout');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast({ message: 'Please sign in to post a product review.', type: 'error' });
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) {
      addToast({ message: 'Please write a review comment.', type: 'error' });
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('aura_token')}`,
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setReviews([data.review, ...reviews]);
      setReviewComment('');
      setReviewRating(5);
      addToast({ message: 'Your review has been published!', type: 'success' });
    } catch (err) {
      addToast({ message: err.message, type: 'error' });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 mb-8">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-white transition-colors">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="hover:text-white transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-200 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-900/60 border border-white/10 shadow-2xl relative group">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-lg shadow-rose-500/30">
                Save {product.discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-indigo-500 scale-105 shadow-lg shadow-indigo-500/20'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specs & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-indigo-400 uppercase tracking-widest font-bold mb-2">
              <span>{product.brand}</span>
              <span className="text-slate-400 font-medium">{product.category}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-['Space_Grotesk']">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-3 mt-3">
              <RatingStars
                rating={product.rating || 5}
                size="w-4 h-4"
                showScore={true}
                reviewsCount={reviews.length || product.numReviews}
              />
              <span className="text-xs text-slate-500">• Verified Purchases</span>
            </div>
          </div>

          {/* Price Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 flex items-baseline gap-4">
            <span className="text-3xl font-extrabold text-white">
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-base text-slate-500 line-through">
                ₹{product.originalPrice}
              </span>
            )}
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 ml-auto">
              In Stock & Ready to Ship
            </span>
          </div>

          {/* Short Description */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Feature highlights */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Key Engineered Highlights:
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Purchase Actions */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center border border-white/10 rounded-2xl bg-slate-900/80 px-3 py-1.5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white text-lg"
                >
                  -
                </button>
                <span className="w-10 text-center text-sm font-bold text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white text-lg"
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : added
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30'
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

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-2xl border transition-colors ${
                  inWishlist
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                    : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                aria-label="Wishlist toggle"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="w-full py-3.5 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-xl shadow-cyan-500/25 transition-all"
            >
              <Zap className="w-4 h-4 fill-current" /> Instant Checkout (Buy Now)
            </button>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10 text-center">
            <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <Truck className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-white block">Free Shipping</span>
              <span className="text-[10px] text-slate-400">On orders ₹150+</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <ShieldCheck className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-white block">2-Yr Warranty</span>
              <span className="text-[10px] text-slate-400">Full manufacturer</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <RotateCcw className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <span className="text-[11px] font-semibold text-white block">30 Days Return</span>
              <span className="text-[10px] text-slate-400">Risk-free trial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      {product.specifications && product.specifications.length > 0 && (
        <section className="mt-16 p-8 rounded-3xl bg-slate-900/40 border border-white/[0.08] backdrop-blur-md">
          <h3 className="text-xl font-bold text-white mb-6 font-['Space_Grotesk']">
            Technical Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.specifications.map((spec, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs"
              >
                <span className="text-slate-400 font-medium">{spec.key}</span>
                <span className="text-slate-100 font-semibold">{spec.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews & Form */}
      <section className="mt-16 p-8 rounded-3xl bg-slate-900/40 border border-white/[0.08] backdrop-blur-md space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
              Customer Reviews ({reviews.length})
            </h3>
            <p className="text-xs text-slate-400 mt-1">Real ratings submitted by verified purchasers</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-white">{product.rating || 5.0}</span>
            <div>
              <RatingStars rating={product.rating || 5.0} size="w-4 h-4" />
              <span className="text-[11px] text-slate-400 block mt-0.5">Based on {reviews.length} reviews</span>
            </div>
          </div>
        </div>

        {/* Write Review Form */}
        <div className="p-6 rounded-2xl bg-slate-950/70 border border-white/10 space-y-4">
          <h4 className="text-sm font-bold text-white">Write a Customer Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Your Rating</label>
              <RatingStars
                rating={reviewRating}
                interactive={true}
                onRate={(val) => setReviewRating(val)}
                size="w-5 h-5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Review Feedback</label>
              <textarea
                rows={3}
                placeholder="Share your experience with this product, build quality, and audio/performance..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {submittingReview ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4 divide-y divide-white/5">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                      {r.userName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{r.userName}</span>
                      <span className="text-[10px] text-emerald-400 font-medium">✓ Verified Buyer</span>
                    </div>
                  </div>
                  <RatingStars rating={r.rating} size="w-3.5 h-3.5" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{r.comment}</p>
                <span className="text-[10px] text-slate-500 block">
                  {new Date(r.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-white font-['Space_Grotesk']">
              Related Hardware in {product.category}
            </h3>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">
              View more
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.slice(0, 3).map((rel) => (
              <ProductCard key={rel._id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
