import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../../services/api";
import Loading from "../../components/Loading";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Boxes,
  CheckCircle,
  Clock,
  ArrowRight,
  PlusCircle,
  Store,
  UserCheck,
  ShieldCheck,
  Lock,
  Sparkles,
  Star,
  MessageSquareHeart,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function SellerDashboard() {
  const { seller } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

  const isApproved = seller?.isVerified && seller?.isActive;

  useEffect(() => {
    if (isApproved) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [isApproved]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/seller/dashboard");
      setStats(data.stats);
    } catch (e) {
      console.error("Failed to load seller dashboard stats:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  // Pending verification state view
  if (!seller?.isVerified) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 border border-app-border shadow-sm text-center max-w-2xl mx-auto space-y-5">
          <div className="size-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Clock className="size-8 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">
              Your Store is Pending Admin Verification
            </h2>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Your seller application for <strong className="text-zinc-900">{seller?.storeName}</strong> has been received and is currently in review by the TrustCart Admin team. You cannot list or sell products until your account is approved.
            </p>
          </div>

          <div className="bg-app-cream/60 p-5 rounded-2xl border border-app-border text-left space-y-3 text-xs">
            <h4 className="font-bold text-app-green flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-app-orange" /> Next Steps
            </h4>
            <ul className="space-y-2 text-zinc-600 list-disc list-inside">
              <li>Review and complete your store address and contact details in Store Profile.</li>
              <li>Once verified by an Admin, you will receive full access to product management, stock inventory, and orders.</li>
            </ul>
          </div>

          <div className="pt-2">
            <Link
              to="/seller/profile"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-app-orange hover:bg-app-orange-dark text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <UserCheck className="size-4" /> Edit Store Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Inactive / Suspended state view
  if (!seller?.isActive) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 border border-app-border shadow-sm text-center max-w-2xl mx-auto space-y-5">
          <div className="size-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <AlertTriangle className="size-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">
              Seller Account Currently Inactive
            </h2>
            <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
              Your seller account for <strong className="text-zinc-900">{seller?.storeName}</strong> is currently paused or suspended. Selling operations, product catalog updates, and order processing are disabled.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/seller/profile"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-900 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              <UserCheck className="size-4" /> View Store Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      label: "Active Products",
      value: stats?.activeProducts || 0,
      icon: Boxes,
      color: "text-green-600 bg-green-50 border-green-100",
    },
    {
      label: "Low Stock Items",
      value: stats?.lowStock || 0,
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      label: "Total Revenue",
      value: `${currency}${(stats?.revenue || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: "text-orange-600 bg-orange-50 border-orange-100",
    },
    {
      label: "Completed Orders",
      value: stats?.completedOrders || 0,
      icon: CheckCircle,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-green">Seller Dashboard</h1>
          <p className="text-sm text-app-text-light mt-1">
            Real-time analytics and overview of your store performance.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/seller/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-app-orange text-white rounded-xl text-sm font-medium hover:bg-app-orange-dark transition-colors shadow-sm"
          >
            <PlusCircle className="size-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* AI Seller Trust Score Overview Banner */}
      <div className="bg-gradient-to-r from-app-green via-emerald-900 to-app-green text-white p-6 sm:p-8 rounded-3xl shadow-md border border-emerald-800 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="size-3.5 text-amber-300 animate-pulse" />
              AI Trust Engine Status
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">
              Store Trust Score: {stats?.trust?.trustScore ?? (seller?.isVerified ? 85 : 50)} / 100
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl leading-relaxed">
              {stats?.trust?.trustSummary ||
                "Your store trust score is calculated based on verified credentials, customer ratings, NLP review sentiment, and complaint history."}
            </p>
          </div>

          {/* Quick Score Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] text-white/70 font-medium">Verification</p>
              <p className="text-lg font-bold mt-0.5 text-blue-300">
                {stats?.trust?.verificationScore ?? (seller?.isVerified ? 100 : 30)}
              </p>
              <p className="text-[9px] text-white/60">20% Weight</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] text-white/70 font-medium">Rating Score</p>
              <p className="text-lg font-bold mt-0.5 text-amber-300">
                {stats?.trust?.ratingScore ?? 70}
              </p>
              <p className="text-[9px] text-white/60">30% Weight</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] text-white/70 font-medium">Sentiment</p>
              <p className="text-lg font-bold mt-0.5 text-emerald-300">
                {stats?.trust?.reviewSentimentScore ?? 70}
              </p>
              <p className="text-[9px] text-white/60">30% Weight</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <p className="text-[10px] text-white/70 font-medium">Complaints</p>
              <p className="text-lg font-bold mt-0.5 text-purple-300">
                {stats?.trust?.complaintScore ?? 100}
              </p>
              <p className="text-[9px] text-white/60">20% Weight</p>
            </div>
          </div>
        </div>

        {/* Sentiment Distribution Sub-Bar */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-white/80">Customer Feedback:</span>
            <span className="text-emerald-300 font-semibold">
              😊 {stats?.trust?.positiveReviews || 0} Positive
            </span>
            <span className="text-zinc-300 font-semibold">
              😐 {stats?.trust?.neutralReviews || 0} Neutral
            </span>
            <span className="text-rose-300 font-semibold">
              🙁 {stats?.trust?.negativeReviews || 0} Negative
            </span>
          </div>
          <span className="text-white/50 text-[11px]">
            Total Reviews: {stats?.trust?.totalReviews || 0} • Automatically updated
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-app-border shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-medium text-app-text-light">{card.label}</p>
              <p className="text-2xl font-bold text-zinc-900 mt-1">{card.value}</p>
            </div>
            <div className={`p-3 rounded-xl border ${card.color}`}>
              <card.icon className="size-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Top Products & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl border border-app-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-app-green flex items-center gap-2">
              <Package className="size-4 text-app-orange" /> Top Performing Products
            </h2>
            <Link
              to="/seller/products"
              className="text-xs font-medium text-app-orange hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="size-3" />
            </Link>
          </div>
          {stats?.topProducts?.length === 0 ? (
            <p className="text-sm text-zinc-400 py-6 text-center">No products found yet.</p>
          ) : (
            <div className="divide-y divide-app-border">
              {stats?.topProducts?.map((p: any) => (
                <div key={p._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="size-10 rounded-lg object-cover border border-app-border"
                    />
                    <div>
                      <p className="text-sm font-medium text-zinc-900 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-app-text-light">
                        {currency}
                        {p.price.toFixed(2)} • {p.stock} in stock
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                      ⭐ {p.rating?.toFixed(1) || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Store Orders */}
        <div className="bg-white p-6 rounded-2xl border border-app-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-app-green flex items-center gap-2">
              <ShoppingBag className="size-4 text-app-orange" /> Recent Orders
            </h2>
            <Link
              to="/seller/orders"
              className="text-xs font-medium text-app-orange hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="size-3" />
            </Link>
          </div>
          {stats?.recentOrders?.length === 0 ? (
            <p className="text-sm text-zinc-400 py-6 text-center">No orders received yet.</p>
          ) : (
            <div className="divide-y divide-app-border">
              {stats?.recentOrders?.map((o: any) => (
                <div key={o._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      Order #{o._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="text-xs text-app-text-light">
                      {o.user?.name || "Customer"} • {o.sellerItems?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-app-green">
                      {currency}
                      {(o.sellerSubtotal || 0).toFixed(2)}
                    </p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        o.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : o.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
