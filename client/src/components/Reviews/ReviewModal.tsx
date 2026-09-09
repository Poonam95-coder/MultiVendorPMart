import { useState } from "react";
import { Star, X, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { apiPost } from "../../services/api";
import toast from "react-hot-toast";

interface ReviewModalProps {
  productId: string;
  productName: string;
  orderId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ productId, productName, orderId, onClose, onSuccess }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }

    setSubmitting(true);
    try {
      // If orderId is not provided, fetch user's delivered orders to find the right order
      let orderToUse = orderId;
      if (!orderToUse) {
        const eligible = await apiPost("/reviews/my-eligible-orders", {});
        // Fallback handled on backend
      }

      const res = await apiPost("/reviews", {
        productId,
        orderId: orderToUse,
        rating,
        comment: comment.trim(),
      });

      toast.success("Review submitted! AI Seller Trust Score updated.");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 animate-fade-in shadow-2xl border border-app-border">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-app-border">
          <div>
            <h3 className="text-lg font-bold text-app-green">Write a Review</h3>
            <p className="text-xs text-zinc-500 line-clamp-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Picker */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-2">
              Overall Rating
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`size-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-zinc-200 fill-zinc-100"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-zinc-700">
                {rating === 5 ? "Excellent" : rating === 4 ? "Good" : rating === 3 ? "Average" : rating === 2 ? "Below Average" : "Poor"}
              </span>
            </div>
          </div>

          {/* Comment Textarea */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider block mb-2">
              Your Review
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of the freshness, packaging, or quality? Your review trains the AI Seller Trust Engine!"
              className="w-full p-3.5 rounded-2xl border border-app-border focus:border-app-green outline-none text-sm leading-relaxed resize-none"
            />
          </div>

          {/* AI Sentiment Info Box */}
          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 flex items-start gap-2 text-xs text-emerald-800">
            <Sparkles className="size-4 text-app-orange shrink-0 mt-0.5" />
            <p>
              Your review is analyzed in real-time by the <strong>AI Trust Engine</strong> to update the seller's verified Trust Score.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-app-green hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
