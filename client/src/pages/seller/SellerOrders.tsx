import { useEffect, useState } from "react";
import { apiGet, apiPatch, API_URL } from "../../services/api";
import { io } from "socket.io-client";
import Loading from "../../components/Loading";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Package,
  XCircle,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Eye,
  X,
  Store,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

  useEffect(() => {
    fetchOrders();

    const token =
      localStorage.getItem("trustcart_token") ||
      localStorage.getItem("pmart_token") ||
      "";

    const socket = io(API_URL.replace(/\/api$/, ""), {
      auth: { token },
    });

    socket.on("order-updated", () => {
      fetchOrders();
    });

    return () => {
      socket.off("order-updated");
      socket.disconnect();
    };
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const query = statusFilter !== "all" ? `?sellerStatus=${statusFilter}` : "";
      const data = await apiGet(`/seller/orders${query}`);
      setOrders(data.orders || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load seller orders");
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (id: string) => {
    try {
      setLoadingDetails(true);
      const data = await apiGet(`/seller/orders/${id}`);
      setSelectedOrder(data.order);
    } catch (e: any) {
      toast.error(e.message || "Failed to load order details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, itemId: string, newStatus: string) => {
    setUpdatingId(`${orderId}-${itemId}`);
    try {
      await apiPatch(`/seller/orders/${orderId}/status`, {
        itemId,
        status: newStatus,
      });
      toast.success(`Item status updated to ${newStatus}`);
      await fetchOrders();
    } catch (e: any) {
      toast.error(e.message || "Failed to update item status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Accepted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Preparing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Packed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-app-green">Store Orders</h1>
          <p className="text-sm text-app-text-light mt-1">
            Fulfill and prepare ordered items from your store inventory.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap bg-white p-1.5 rounded-2xl border border-app-border">
          {["all", "Pending", "Accepted", "Preparing", "Packed", "Rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors capitalize ${
                statusFilter === s
                  ? "bg-app-green text-white"
                  : "text-zinc-600 hover:bg-orange-50 hover:text-zinc-900"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-app-border">
          <ShoppingBag className="size-12 text-zinc-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-zinc-900 mb-1">No orders found</p>
          <p className="text-sm text-zinc-500">
            {statusFilter === "all"
              ? "You haven't received any orders containing your items yet."
              : `No orders currently in "${statusFilter}" status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-app-border shadow-sm p-6 space-y-4"
            >
              {/* Order Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-app-border gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-app-green">
                    Order #{order._id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => viewOrderDetails(order._id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-app-green hover:bg-zinc-100 rounded-lg transition-colors border border-app-border cursor-pointer"
                    title="View complete order details"
                  >
                    <Eye className="size-3.5" />
                    Details
                  </button>
                  <span className="text-xs text-zinc-500">Overall Status:</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700"
                        : order.status === "Cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-app-cream/50 p-3.5 rounded-xl">
                <div className="flex items-start gap-2">
                  <User className="size-3.5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-zinc-800">{order.user?.name || "Customer"}</p>
                    <p className="text-zinc-500">{order.user?.phone || order.user?.email}</p>
                  </div>
                </div>
                {order.shippingAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin className="size-3.5 text-zinc-400 mt-0.5" />
                    <p className="text-zinc-600 line-clamp-2">
                      {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state} - {order.shippingAddress.zip}
                    </p>
                  </div>
                )}
              </div>

              {/* Store Items inside this Order */}
              <div className="divide-y divide-app-border">
                {order.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-12 rounded-xl object-cover border border-app-border shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-sm text-zinc-900">{item.name}</p>
                        <p className="text-xs text-zinc-500">
                          {currency}
                          {(item.price || 0).toFixed(2)} × {item.quantity} {item.unit || "pcs"} ={" "}
                          <span className="font-semibold text-app-green">
                            {currency}
                            {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Status & Action Buttons */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(
                          item.sellerStatus || "Pending"
                        )}`}
                      >
                        {item.sellerStatus || "Pending"}
                      </span>

                      {/* Action Dropdown / Quick Buttons */}
                      {item.sellerStatus !== "Packed" && item.sellerStatus !== "Rejected" && (
                        <div className="flex items-center gap-1.5">
                          {item.sellerStatus === "Pending" && (
                            <>
                              <button
                                disabled={updatingId === `${order._id}-${item.product}`}
                                onClick={() =>
                                  handleStatusUpdate(order._id, item.product, "Accepted")
                                }
                                className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                Accept
                              </button>
                              <button
                                disabled={updatingId === `${order._id}-${item.product}`}
                                onClick={() =>
                                  handleStatusUpdate(order._id, item.product, "Rejected")
                                }
                                className="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {item.sellerStatus === "Accepted" && (
                            <button
                              disabled={updatingId === `${order._id}-${item.product}`}
                              onClick={() =>
                                handleStatusUpdate(order._id, item.product, "Preparing")
                              }
                              className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                              Start Preparing
                            </button>
                          )}
                          {item.sellerStatus === "Preparing" && (
                            <button
                              disabled={updatingId === `${order._id}-${item.product}`}
                              onClick={() =>
                                handleStatusUpdate(order._id, item.product, "Packed")
                              }
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              Mark as Packed
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
                <span>Payment: <strong className="uppercase">{order.paymentMethod}</strong></span>
                <span className="text-sm font-bold text-zinc-900">
                  Store Subtotal: {currency}{(order.sellerTotal || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-fade-in shadow-2xl border border-app-border">
            <div className="flex items-center justify-between pb-3 border-b border-app-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-50 text-app-orange">
                  <ShoppingBag className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-app-green">
                    Order #{selectedOrder._id.slice(-6).toUpperCase()}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Customer & Delivery Information */}
            <div className="bg-app-cream/60 p-4 rounded-2xl border border-app-border space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-zinc-400">Customer Name</p>
                  <p className="font-semibold text-zinc-800 text-sm mt-0.5">{selectedOrder.user?.name || "Customer"}</p>
                </div>
                <div>
                  <p className="text-zinc-400">Contact</p>
                  <p className="font-semibold text-zinc-800 text-sm mt-0.5">{selectedOrder.user?.phone || selectedOrder.user?.email || "—"}</p>
                </div>
              </div>

              {selectedOrder.shippingAddress && (
                <div className="pt-2 border-t border-app-border">
                  <p className="text-zinc-400">Shipping Address</p>
                  <p className="font-medium text-zinc-700 mt-0.5">
                    {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zip}
                  </p>
                </div>
              )}
            </div>

            {/* Items for this store */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Store Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-app-border border border-app-border rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs bg-white">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover border border-app-border" />
                      <div>
                        <p className="font-semibold text-zinc-900">{item.name}</p>
                        <p className="text-zinc-500">
                          {currency}{(item.price || 0).toFixed(2)} × {item.quantity} {item.unit || "pcs"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-zinc-900">
                        {currency}{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </p>
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${getStatusBadge(item.sellerStatus || "Pending")}`}>
                        {item.sellerStatus || "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Status History if available */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Status History
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1.5 p-3 bg-zinc-50 rounded-2xl border border-app-border text-xs">
                  {selectedOrder.statusHistory.map((h: any, idx: number) => (
                    <div key={idx} className="flex items-start justify-between gap-2 text-[11px]">
                      <span className="font-medium text-zinc-800">{h.status}</span>
                      <span className="text-zinc-400 shrink-0">
                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-app-border flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Total Store Items Value: <strong className="text-sm font-bold text-zinc-900">{currency}{(selectedOrder.sellerTotal || 0).toFixed(2)}</strong>
              </span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl transition-colors"
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
