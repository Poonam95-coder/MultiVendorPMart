import { useEffect, useState } from "react";
import { PackageIcon, NavigationIcon } from "lucide-react";
import OtpModal from "../../components/Delivery/OtpModal";
import CancelModal from "../../components/Delivery/CancelModal";
import DeliveryOrderCard from "../../components/Delivery/DeliveryOrderCard";
import Loading from "../../components/Loading";
import type { Order } from "../../types";
import { apiGet, apiPatch, apiPost, API_URL } from "../../services/api";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function DeliveryDashboard() {

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"active" | "completed">("active");
    const [tracking, setTracking] = useState(false);

    // OTP modal
    const [otpModal, setOtpModal] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Cancel modal
    const [cancelModal, setCancelModal] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState("");

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const d = await apiGet(`/delivery/orders?tab=${tab}`);
            setOrders(d.orders || []);
        } catch (e: any) {
            toast.error(e.message || "Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const token =
            localStorage.getItem("trustcart_delivery_token") ||
            localStorage.getItem("pmart_delivery_token") ||
            localStorage.getItem("deliveryToken") ||
            "";

        const socket = io(API_URL.replace(/\/api$/, ""), {
            auth: { token },
        });

        socket.on("order-assigned", (data: any) => {
            toast.success("New order assigned to your route!", { icon: "📦" });
            fetchOrders();
        });

        socket.on("order-updated", () => {
            fetchOrders();
        });

        return () => {
            socket.off("order-assigned");
            socket.off("order-updated");
            socket.disconnect();
        };
    }, [tab]);

    useEffect(() => {
        if (!tracking) return;
        const token =
            localStorage.getItem("trustcart_delivery_token") ||
            localStorage.getItem("pmart_delivery_token") ||
            localStorage.getItem("deliveryToken") ||
            "";

        const socket = io(API_URL.replace(/\/api$/, ""), {
            auth: { token },
        });

        const activeOrders = orders.filter(
            (o) => o.status !== "Delivered" && o.status !== "Cancelled"
        );

        if (activeOrders.length === 0) {
            toast("No active orders to track currently", { icon: "ℹ️" });
        }

        let watchId: number | null = null;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    const accuracy = pos.coords.accuracy;

                    activeOrders.forEach((o) => {
                        socket.emit("update-location", {
                            orderId: o._id,
                            lat,
                            lng,
                            accuracy,
                            token,
                        });
                    });
                },
                (err) => {
                    console.warn("Geolocation watch error:", err.message);
                    if (err.code === 1) {
                        toast.error("Location permission denied. Please allow location access in browser settings.");
                    } else if (err.code === 2) {
                        toast.error("Location unavailable. Please check GPS connection.");
                    } else if (err.code === 3) {
                        toast.error("Location request timed out.");
                    }
                    setTracking(false);
                },
                { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
            );
        } else {
            toast.error("Geolocation is not supported by your browser");
            setTracking(false);
        }

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
            socket.disconnect();
        };
    }, [tracking, orders]);

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await apiPatch(`/delivery/orders/${orderId}/status`, { status });
            toast.success(`Delivery status updated to "${status}"`);
            await fetchOrders();
        } catch (e: any) {
            toast.error(e.message || "Failed to update status");
        }
    };

    const handleComplete = async () => {
        if (!otpModal || !otp) return;
        setSubmitting(true);
        try {
            await apiPost(`/delivery/orders/${otpModal}/complete`, { otp: String(otp).trim() });
            toast.success("Delivery completed successfully!");
            await fetchOrders();
            setOtpModal(null);
            setOtp('');
        } catch (e: any) {
            toast.error(e.message || "Invalid 6-digit OTP or failed to complete delivery");
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelModal) return;
        setSubmitting(true);
        try {
            await apiPost(`/delivery/orders/${cancelModal}/cancel`, { reason: cancelReason });
            toast.success("Delivery cancelled");
            await fetchOrders();
            setCancelModal(null);
            setCancelReason('');
        } catch (e: any) {
            toast.error(e.message || "Failed to cancel delivery");
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="space-y-6">
            {/* Tabs + Tracking toggle */}
            <div className="flex items-center gap-2 flex-wrap">
                {(["active", "completed"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${tab === t ? "bg-app-green text-white" : "bg-white text-zinc-600 hover:bg-app-cream border border-app-border"}`}>
                        {t === "active" ? "Active" : "Completed"}
                    </button>
                ))}
                <div className="ml-auto">
                    <button onClick={() => setTracking((prev) => !prev)} className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 ${tracking ? "bg-green-600 text-white" : "bg-white text-zinc-600 border border-app-border hover:bg-app-cream"}`}>
                        <NavigationIcon className={`w-3.5 h-3.5 ${tracking ? "animate-pulse" : ""}`} />
                        {tracking ? "Sharing Location" : "Share Location"}
                    </button>
                </div>
            </div>

            {/* Orders */}
            {loading ? (
                <Loading />
            ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-app-border">
                    <PackageIcon className="size-12 text-app-border mx-auto mb-3" />
                    <p className="text-lg font-semibold text-zinc-900 mb-1">No {tab} deliveries</p>
                    <p className="text-sm text-zinc-500">{tab === "active" ? "You'll see new assignments here" : "Completed deliveries will appear here"}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => <DeliveryOrderCard key={order._id} order={order} tab={tab} handleUpdateStatus={handleUpdateStatus} setOtpModal={setOtpModal} setCancelModal={setCancelModal} />)}
                </div>
            )}

            {/* OTP Modal */}
            {otpModal && <OtpModal setOtpModal={setOtpModal} otp={otp} setOtp={setOtp} handleComplete={handleComplete} submitting={submitting} />}
            {/* Cancel Modal */}
            {cancelModal && <CancelModal setCancelModal={setCancelModal} cancelReason={cancelReason} setCancelReason={setCancelReason} handleCancel={handleCancel} submitting={submitting} />}
        </div>
    );
}
