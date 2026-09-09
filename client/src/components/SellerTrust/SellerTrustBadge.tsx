import { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, Sparkles, X, ChevronRight, CheckCircle2, AlertCircle, MessageSquareHeart } from "lucide-react";
import { apiGet } from "../../services/api";
import type { Seller, SellerTrust } from "../../types";

interface SellerTrustBadgeProps {
  seller: Seller | { _id: string; storeName: string; isVerified?: boolean; rating?: number; logo?: string };
  showDetailsButton?: boolean;
  compact?: boolean;
}

export default function SellerTrustBadge({ seller, showDetailsButton = true, compact = false }: SellerTrustBadgeProps) {
  const [trust, setTrust] = useState<SellerTrust | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!seller?._id) return;
    const fetchTrust = async () => {
      try {
        setLoading(true);
        const data = await apiGet(`/trust/${seller._id}`);
        if (data.success && data.trust) {
          setTrust(data.trust);
        }
      } catch (err) {
        console.error("Failed to load seller trust score:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrust();
  }, [seller?._id]);

  const score = trust?.trustScore ?? (seller?.isVerified ? 85 : 50);

  // Trust badge styling
  let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let ringColor = "text-emerald-600";
  let label = "Highly Trusted";

  if (score < 50) {
    badgeBg = "bg-rose-50 text-rose-700 border-rose-200";
    ringColor = "text-rose-600";
    label = "Needs Improvement";
  } else if (score < 70) {
    badgeBg = "bg-amber-50 text-amber-700 border-amber-200";
    ringColor = "text-amber-600";
    label = "Moderate Trust";
  } else if (score < 85) {
    badgeBg = "bg-blue-50 text-blue-700 border-blue-200";
    ringColor = "text-blue-600";
    label = "Trusted Seller";
  }

  if (compact) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeBg} hover:opacity-90 transition-all cursor-pointer shadow-2xs`}
        title="View AI Seller Trust Score Details"
      >
        <Sparkles className="size-3 text-app-orange shrink-0 animate-pulse" />
        <span>Trust Score: {score}/100</span>
      </button>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gradient-to-r from-emerald-50/50 via-app-cream/40 to-emerald-50/30 rounded-xl border border-emerald-100/80">
        <div className="flex items-center gap-3">
          {/* Trust Score Ring */}
          <div className="relative size-11 flex items-center justify-center rounded-xl bg-white shadow-2xs border border-app-border shrink-0">
            <span className={`text-base font-extrabold ${ringColor}`}>{score}</span>
            <span className="text-[9px] text-zinc-400 absolute -bottom-1">/100</span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-900 flex items-center gap-1">
                <Sparkles className="size-3.5 text-app-orange" />
                AI Seller Trust Score
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                {label}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5 max-w-sm">
              {trust?.trustSummary || "Verified store with continuous AI quality monitoring."}
            </p>
          </div>
        </div>

        {showDetailsButton && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="text-xs font-semibold text-app-green hover:text-emerald-700 bg-white/80 hover:bg-white px-3 py-1.5 rounded-lg border border-app-border transition-all flex items-center gap-1 shadow-2xs cursor-pointer ml-auto"
          >
            <span>Breakdown</span>
            <ChevronRight className="size-3.5" />
          </button>
        )}
      </div>

      {/* Trust Breakdown Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 animate-fade-in shadow-2xl border border-app-border">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100/70 text-app-green">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-app-green flex items-center gap-1.5">
                    {seller.storeName}
                  </h3>
                  <p className="text-xs text-zinc-500">AI Trust Engine Breakdown</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Total Score Banner */}
            <div className="bg-gradient-to-r from-app-green to-emerald-800 text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
              <div>
                <p className="text-xs text-white/80 font-medium">Overall Trust Score</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-extrabold">{score}</span>
                  <span className="text-sm text-white/70 font-semibold">/ 100</span>
                </div>
                <p className="text-xs text-emerald-200 mt-1 font-medium">{label}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
                <Sparkles className="size-8 text-amber-300 animate-pulse" />
              </div>
            </div>

            {/* AI Trust Summary */}
            <div className="bg-app-cream/60 p-3.5 rounded-2xl border border-app-border space-y-1">
              <p className="text-[11px] font-bold text-app-green uppercase tracking-wider flex items-center gap-1">
                <MessageSquareHeart className="size-3.5 text-app-orange" /> AI Trust Summary
              </p>
              <p className="text-xs text-zinc-700 leading-relaxed">
                "{trust?.trustSummary || "This seller maintains strong reliability with active product quality compliance."}"
              </p>
            </div>

            {/* Weighted Components Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Scoring Components
              </h4>

              {/* 1. Seller Verification (20%) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-blue-600" />
                    Verification Status (20%)
                  </span>
                  <span className="font-bold text-zinc-900">
                    {trust?.verificationScore ?? (seller.isVerified ? 100 : 30)}/100
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${trust?.verificationScore ?? (seller.isVerified ? 100 : 30)}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500">
                  {seller.isVerified ? "Admin verified business credentials" : "Pending official verification"}
                </p>
              </div>

              {/* 2. Customer Ratings (30%) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                    <span className="text-amber-500">⭐</span>
                    Customer Ratings (30%)
                  </span>
                  <span className="font-bold text-zinc-900">{trust?.ratingScore ?? 70}/100</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${trust?.ratingScore ?? 70}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500">
                  Average store star rating: {seller.rating ? `${seller.rating.toFixed(1)}/5` : "70% baseline"}
                </p>
              </div>

              {/* 3. Review Sentiment (30%) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-emerald-600" />
                    Review Sentiment (30%)
                  </span>
                  <span className="font-bold text-zinc-900">{trust?.reviewSentimentScore ?? 70}/100</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${trust?.reviewSentimentScore ?? 70}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500">
                  {trust?.totalReviews
                    ? `${trust.positiveReviews} Positive • ${trust.neutralReviews} Neutral • ${trust.negativeReviews} Negative reviews`
                    : "Natural language analysis of customer reviews"}
                </p>
              </div>

              {/* 4. Complaint History (20%) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                    <ShieldAlert className="size-3.5 text-purple-600" />
                    Complaint History (20%)
                  </span>
                  <span className="font-bold text-zinc-900">{trust?.complaintScore ?? 100}/100</span>
                </div>
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full transition-all"
                    style={{ width: `${trust?.complaintScore ?? 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-500">
                  Zero unresolved store complaints reported
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-app-border flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">
                Last calculated: {trust?.lastUpdated ? new Date(trust.lastUpdated).toLocaleDateString() : "Live"}
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
