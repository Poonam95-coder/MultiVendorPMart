import { useState, useEffect } from "react";
import type { Product, Review } from "../../types";
import { StarIcon, ThumbsUpIcon, Sparkles, MessageSquarePlus, ShieldCheck, CheckCircle2 } from "lucide-react";
import { apiGet } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ReviewModal from "./ReviewModal";
import toast from "react-hot-toast";

interface ProductReviewsSectionProps {
  product: Product;
  onReviewAdded?: () => void;
}

export default function ProductReviewsSection({ product, onReviewAdded }: ProductReviewsSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [eligibleOrderId, setEligibleOrderId] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await apiGet(`/reviews/product/${product._id}`);
      if (data.success) {
        setReviews(data.reviews || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!user) return;
    try {
      const data = await apiGet("/reviews/my-eligible-orders");
      if (data.success && data.eligibleItems?.length) {
        const match = data.eligibleItems.find(
          (item: any) => item.productId === product._id || item.productId?._id === product._id
        );
        if (match) {
          setEligibleOrderId(match.orderId);
        } else {
          setEligibleOrderId(null);
        }
      }
    } catch (err) {
      // Ignored if user has no eligible orders
    }
  };

  useEffect(() => {
    if (product?._id) {
      fetchReviews();
      checkEligibility();
    }
  }, [product?._id, user]);

  const handleOpenReviewModal = () => {
    if (!user) {
      toast.error("Please log in as a customer to write a review");
      return;
    }
    if (!eligibleOrderId) {
      toast("You can review this product after completing a purchase!", { icon: "🛍️" });
      return;
    }
    setShowModal(true);
  };

  const totalReviews = stats?.total ?? product.reviewCount ?? reviews.length;
  const avgRating = stats?.avgRating ?? product.rating ?? 0;
  const breakdown = stats?.breakdown ?? { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const maxCount = Math.max(...Object.values(breakdown).map(Number), 1);
  const sentimentCounts = stats?.sentimentCounts ?? { positive: 0, neutral: 0, negative: 0 };

  return (
    <section className="mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-app-green flex items-center gap-2">
            Verified Customer Reviews
            <span className="text-sm font-normal text-zinc-500">({totalReviews})</span>
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real feedback verified by purchase and analyzed by the AI Trust Engine.
          </p>
        </div>

        <button
          onClick={handleOpenReviewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-app-orange hover:bg-app-orange-dark text-white rounded-xl text-xs font-semibold transition-all shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <MessageSquarePlus className="size-4" />
          Write a Review
        </button>
      </div>

      <div className="bg-white/70 rounded-3xl p-6 md:p-8 border border-app-border space-y-8">
        {/* Rating Breakdown & AI Sentiment Overview */}
        <div className="grid md:grid-cols-3 gap-6 pb-6 border-b border-app-border">
          {/* Average Rating Score */}
          <div className="flex flex-col items-center justify-center p-4 bg-app-cream/40 rounded-2xl border border-app-border text-center">
            <span className="text-5xl font-extrabold text-app-green">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</span>
            <div className="flex items-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon
                  key={s}
                  className={`size-4 ${
                    s <= Math.round(avgRating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-zinc-200 fill-zinc-100"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-500 font-medium">Based on {totalReviews} ratings</span>
          </div>

          {/* Star Distribution Bars */}
          <div className="space-y-1.5 justify-center flex flex-col">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = breakdown[star] || 0;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-8 text-zinc-600 font-medium text-right">{star} ★</span>
                  <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-zinc-400 text-right">{count}</span>
                </div>
              );
            })}
          </div>

          {/* AI Sentiment Analysis Card */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-app-cream/50 rounded-2xl border border-emerald-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-app-green mb-2">
                <Sparkles className="size-4 text-app-orange" />
                AI Sentiment Overview
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {totalReviews > 0
                  ? `${sentimentCounts.positive} positive, ${sentimentCounts.neutral} neutral, and ${sentimentCounts.negative} negative sentiment reviews.`
                  : "No reviews analyzed yet. Be the first to review!"}
              </p>
            </div>

            <div className="flex gap-1.5 mt-3">
              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                {sentimentCounts.positive} Positive
              </span>
              <span className="px-2 py-1 bg-zinc-100 text-zinc-700 rounded-lg text-[10px] font-bold">
                {sentimentCounts.neutral} Neutral
              </span>
              <span className="px-2 py-1 bg-rose-50 text-rose-700 rounded-lg text-[10px] font-bold">
                {sentimentCounts.negative} Negative
              </span>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm font-semibold text-zinc-700">No customer reviews yet</p>
            <p className="text-xs text-zinc-500 mt-1">
              Have you ordered this item? Be the first to share your experience!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-app-border space-y-4">
            {reviews.map((review) => {
              const userName = typeof review.user === "object" ? review.user?.name : "Verified Customer";
              const userAvatar = typeof review.user === "object" && review.user?.avatar ? review.user.avatar : null;
              const dateStr = new Date(review.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div key={review._id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-emerald-100 text-app-green flex items-center justify-center font-bold text-xs shrink-0">
                        {userAvatar ? (
                          <img src={userAvatar} alt="" className="size-8 rounded-full object-cover" />
                        ) : (
                          userName.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-zinc-900">{userName}</span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                            <CheckCircle2 className="size-3" /> Verified Purchase
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400">{dateStr}</p>
                      </div>
                    </div>

                    {/* Sentiment Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          review.sentiment === "positive"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : review.sentiment === "negative"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-zinc-100 text-zinc-600 border-zinc-200"
                        }`}
                      >
                        {review.sentiment === "positive"
                          ? "😊 Positive"
                          : review.sentiment === "negative"
                          ? "🙁 Negative"
                          : "😐 Neutral"}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarIcon
                        key={s}
                        className={`size-3.5 ${
                          s <= review.rating ? "text-amber-400 fill-amber-400" : "text-zinc-200 fill-zinc-100"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-zinc-700 leading-relaxed font-normal">{review.comment}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {showModal && (
        <ReviewModal
          productId={product._id}
          productName={product.name}
          orderId={eligibleOrderId || undefined}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchReviews();
            checkEligibility();
            if (onReviewAdded) onReviewAdded();
          }}
        />
      )}
    </section>
  );
}
