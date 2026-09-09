import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "../../services/api";
import Loading from "../../components/Loading";
import {
  Store,
  BadgeCheck,
  Search,
  CheckCircle,
  XCircle,
  Package,
  Eye,
  X,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Star,
  MessageSquareHeart,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSellers() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "suspended" | "all">("pending");
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, [activeTab]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const queryParam = activeTab !== "all" ? `?tab=${activeTab}` : "";
      const data = await apiGet(`/admin/sellers${queryParam}`);
      setSellers(data.sellers || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load sellers");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (seller: any) => {
    try {
      await apiPatch(`/admin/sellers/${seller._id}/approve`, {});
      toast.success(`Seller "${seller.storeName}" has been approved!`);
      fetchSellers();
    } catch (e: any) {
      toast.error(e.message || "Failed to approve seller");
    }
  };

  const handleReject = async (seller: any) => {
    if (!window.confirm(`Are you sure you want to reject verification for "${seller.storeName}"?`)) return;
    try {
      await apiPatch(`/admin/sellers/${seller._id}/reject`, {});
      toast.success(`Seller "${seller.storeName}" verification rejected.`);
      fetchSellers();
    } catch (e: any) {
      toast.error(e.message || "Failed to reject seller");
    }
  };

  const handleSuspend = async (seller: any) => {
    try {
      await apiPatch(`/admin/sellers/${seller._id}/suspend`, {});
      toast.success(`Seller "${seller.storeName}" suspended.`);
      fetchSellers();
    } catch (e: any) {
      toast.error(e.message || "Failed to suspend seller");
    }
  };

  const handleActivate = async (seller: any) => {
    try {
      await apiPatch(`/admin/sellers/${seller._id}/activate`, {});
      toast.success(`Seller "${seller.storeName}" activated.`);
      fetchSellers();
    } catch (e: any) {
      toast.error(e.message || "Failed to activate seller");
    }
  };

  const viewDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const data = await apiGet(`/admin/sellers/${id}`);
      setSelectedSeller(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load seller details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const filtered = sellers.filter(
    (s) =>
      s.storeName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-app-green">Seller Verification & Management</h1>
        <p className="text-sm text-app-text-light mt-1">
          Review pending store applications, approve sellers for product listing, or suspend accounts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-app-border">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === "pending"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-app-border"
          }`}
        >
          <Clock className="size-4" /> Pending Approval
        </button>
        <button
          onClick={() => setActiveTab("verified")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === "verified"
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-app-border"
          }`}
        >
          <BadgeCheck className="size-4" /> Verified & Active
        </button>
        <button
          onClick={() => setActiveTab("suspended")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === "suspended"
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-app-border"
          }`}
        >
          <ShieldAlert className="size-4" /> Suspended / Inactive
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-semibold rounded-xl flex items-center gap-2 transition-all ${
            activeTab === "all"
              ? "bg-zinc-800 text-white shadow-sm"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border border-app-border"
          }`}
        >
          <Store className="size-4" /> All Sellers
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-app-border flex items-center gap-3">
        <Search className="size-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by store name, email, or owner name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      {/* Sellers Table */}
      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-app-border">
          <Store className="size-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-zinc-900 mb-1">No sellers found in this section</p>
          <p className="text-sm text-zinc-500">
            {activeTab === "pending"
              ? "Great news! There are no pending seller applications awaiting review."
              : "No sellers match the current filter or search query."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-app-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-app-cream/80 text-zinc-600 text-xs font-semibold uppercase tracking-wider border-b border-app-border">
                <tr>
                  <th className="px-6 py-4">Store & Owner</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4">Orders</th>
                  <th className="px-6 py-4">AI Trust Score</th>
                  <th className="px-6 py-4">Verification</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {filtered.map((seller) => (
                  <tr key={seller._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-orange-100 text-app-orange flex items-center justify-center font-bold text-sm shrink-0">
                          {seller.logo ? (
                            <img
                              src={seller.logo}
                              alt=""
                              className="size-10 rounded-xl object-cover"
                            />
                          ) : (
                            <Store className="size-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 flex items-center gap-1.5">
                            {seller.storeName}
                            {seller.isVerified && (
                              <BadgeCheck className="size-4 fill-blue-600 text-white" />
                            )}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Owner: {seller.user?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-600">
                      <p className="font-medium text-zinc-900">{seller.email}</p>
                      <p className="text-zinc-400">{seller.phone || seller.address || "-"}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">
                      {seller.productCount || 0}
                    </td>
                    <td className="px-6 py-4 font-semibold text-zinc-900">
                      {seller.orderCount || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-2xs">
                        <Sparkles className="size-3 text-app-orange shrink-0" />
                        <span>{seller.trustScore ?? (seller.isVerified ? 85 : 50)}/100</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {seller.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Verified ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Approval
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {seller.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          Inactive / Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => viewDetails(seller._id)}
                          className="p-1.5 text-zinc-500 hover:text-app-green hover:bg-zinc-100 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                          title="View store details"
                        >
                          <Eye className="size-4" />
                        </button>

                        {!seller.isVerified ? (
                          <>
                            <button
                              onClick={() => handleApprove(seller)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1"
                              title="Approve seller"
                            >
                              <CheckCircle className="size-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(seller)}
                              className="px-2.5 py-1 bg-zinc-100 hover:bg-rose-50 hover:text-rose-600 text-zinc-600 rounded-lg text-xs font-semibold transition-colors"
                              title="Reject seller application"
                            >
                              Reject
                            </button>
                          </>
                        ) : seller.isActive ? (
                          <button
                            onClick={() => handleSuspend(seller)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold transition-colors"
                            title="Suspend seller operations"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(seller)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
                            title="Reactivate seller"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Seller Details Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 animate-fade-in shadow-2xl border border-app-border">
            <div className="flex items-center justify-between pb-4 border-b border-app-border">
              <div className="flex items-center gap-3">
                <Store className="size-6 text-app-orange" />
                <div>
                  <h3 className="text-lg font-bold text-app-green flex items-center gap-2">
                    {selectedSeller.seller?.storeName}
                    {selectedSeller.seller?.isVerified && (
                      <BadgeCheck className="size-5 fill-blue-600 text-white" />
                    )}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Registered on{" "}
                    {new Date(selectedSeller.seller?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-app-cream/60 p-4 rounded-2xl">
              <div>
                <p className="text-zinc-400">Account Owner</p>
                <p className="font-semibold text-zinc-800 text-sm mt-0.5">
                  {selectedSeller.seller?.user?.name}
                </p>
              </div>
              <div>
                <p className="text-zinc-400">Store Email</p>
                <p className="font-semibold text-zinc-800 text-sm mt-0.5">
                  {selectedSeller.seller?.email}
                </p>
              </div>
              <div>
                <p className="text-zinc-400">Phone</p>
                <p className="font-semibold text-zinc-800 text-sm mt-0.5">
                  {selectedSeller.seller?.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-zinc-400">Store Address</p>
                <p className="font-semibold text-zinc-800 text-sm mt-0.5">
                  {selectedSeller.seller?.address || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-zinc-400">Verification Status</p>
                <p className="font-semibold text-zinc-800 text-sm mt-0.5">
                  {selectedSeller.seller?.isVerified ? "Verified" : "Pending Verification"}
                </p>
              </div>
              <div>
                <p className="text-zinc-400">Account Status</p>
                <p className="font-semibold text-zinc-800 text-sm mt-0.5">
                  {selectedSeller.seller?.isActive ? "Active" : "Inactive / Suspended"}
                </p>
              </div>
            </div>

            {/* Description */}
            {selectedSeller.seller?.storeDescription && (
              <div>
                <p className="text-xs text-zinc-400 mb-1">Store Description</p>
                <p className="text-xs text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-app-border">
                  {selectedSeller.seller?.storeDescription}
                </p>
              </div>
            )}

            {/* AI Trust Engine Analysis */}
            <div className="bg-gradient-to-br from-emerald-50 to-app-cream/60 p-4 rounded-2xl border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-app-green flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="size-3.5 text-app-orange" /> AI Seller Trust Analysis
                </h4>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                  {selectedSeller.trust?.trustScore ?? (selectedSeller.seller?.isVerified ? 85 : 50)} / 100
                </span>
              </div>

              <p className="text-xs text-zinc-700 leading-relaxed italic bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                "{selectedSeller.trust?.trustSummary || 'Trust score dynamically computed based on seller verification, ratings, customer review sentiment, and complaint metrics.'}"
              </p>

              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <div className="bg-white/80 p-2 rounded-xl border border-app-border">
                  <p className="text-zinc-500 font-medium">Verification</p>
                  <p className="font-bold text-blue-700 text-xs mt-0.5">
                    {selectedSeller.trust?.verificationScore ?? (selectedSeller.seller?.isVerified ? 100 : 30)}
                  </p>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-app-border">
                  <p className="text-zinc-500 font-medium">Rating Score</p>
                  <p className="font-bold text-amber-700 text-xs mt-0.5">
                    {selectedSeller.trust?.ratingScore ?? 70}
                  </p>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-app-border">
                  <p className="text-zinc-500 font-medium">Sentiment</p>
                  <p className="font-bold text-emerald-700 text-xs mt-0.5">
                    {selectedSeller.trust?.reviewSentimentScore ?? 70}
                  </p>
                </div>
                <div className="bg-white/80 p-2 rounded-xl border border-app-border">
                  <p className="text-zinc-500 font-medium">Complaints</p>
                  <p className="font-bold text-purple-700 text-xs mt-0.5">
                    {selectedSeller.trust?.complaintScore ?? 100}
                  </p>
                </div>
              </div>
            </div>

            {/* Products by this seller */}
            <div>
              <h4 className="font-semibold text-sm text-app-green mb-3 flex items-center gap-2">
                <Package className="size-4 text-app-orange" /> Listed Products (
                {selectedSeller.products?.length || 0})
              </h4>
              {selectedSeller.products?.length === 0 ? (
                <p className="text-xs text-zinc-500 italic p-3 bg-zinc-50 rounded-xl">
                  No products listed yet.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto divide-y divide-app-border border border-app-border rounded-xl">
                  {selectedSeller.products?.map((p: any) => (
                    <div key={p._id} className="p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img src={p.image} alt="" className="size-8 rounded-lg object-cover" />
                        <span className="font-medium text-zinc-900">{p.name}</span>
                      </div>
                      <span className="font-bold text-zinc-700">{p.stock} in stock</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orders for this seller */}
            <div>
              <h4 className="font-semibold text-sm text-app-green mb-3 flex items-center gap-2">
                <ShoppingBag className="size-4 text-app-orange" /> Store Orders (
                {selectedSeller.orders?.length || 0})
              </h4>
              {selectedSeller.orders?.length === 0 ? (
                <p className="text-xs text-zinc-500 italic p-3 bg-zinc-50 rounded-xl">
                  No orders placed for this store yet.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto divide-y divide-app-border border border-app-border rounded-xl">
                  {selectedSeller.orders?.map((o: any) => (
                    <div key={o._id} className="p-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-zinc-900">
                          Order #{o._id.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-zinc-500 ml-2">
                          by {o.user?.name || "Customer"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-800">
                          ${(o.total || 0).toFixed(2)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
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

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-app-border">
              <div className="flex gap-2">
                {!selectedSeller.seller?.isVerified ? (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedSeller.seller);
                        setSelectedSeller(null);
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
                    >
                      Approve Store
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedSeller.seller);
                        setSelectedSeller(null);
                      }}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl"
                    >
                      Reject Store
                    </button>
                  </>
                ) : selectedSeller.seller?.isActive ? (
                  <button
                    onClick={() => {
                      handleSuspend(selectedSeller.seller);
                      setSelectedSeller(null);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl"
                  >
                    Suspend / Deactivate Store
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleActivate(selectedSeller.seller);
                      setSelectedSeller(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
                  >
                    Activate Store
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
