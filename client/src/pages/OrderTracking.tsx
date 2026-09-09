import { useParams,useNavigate } from "react-router-dom"
import { useEffect, useState } from "react";
import type { Order } from "../types";
import { apiGet, API_URL } from "../services/api";
import { io } from "socket.io-client";

import Loading from "../components/Loading";
import { ArrowLeftIcon, MapPinIcon, Star, Store, Sparkles, CheckCircle2 } from "lucide-react";
import OrderOTP from "../components/OrderTracking/OrderOTP";
import LiveMap from "../components/OrderTracking/LiveMap";
import OrderTimeLine from "../components/OrderTracking/OrderTimeLine";
import ReviewModal from "../components/Reviews/ReviewModal";
import toast from "react-hot-toast";

const OrderTracking = () => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [reviewingItem, setReviewingItem] = useState<{ productId: string; productName: string } | null>(null);
  const [reviewedProductIds, setReviewedProductIds] = useState<string[]>([]);

  const fetchOrderAndReviews = async () => {
    if (!id) return;
    try {
      const d = await apiGet(`/orders/${id}`);
      setOrder(d.order);
      if (d.order?.liveLocation && typeof d.order.liveLocation.lat === 'number' && typeof d.order.liveLocation.lng === 'number') {
        setLiveLocation({ lat: d.order.liveLocation.lat, lng: d.order.liveLocation.lng });
      } else {
        setLiveLocation(null);
      }

      if (d.order?.status === 'Delivered') {
        try {
          const elig = await apiGet('/reviews/my-eligible-orders');
          if (elig.success && elig.eligibleItems) {
            // Find which items from this order are still eligible (not yet reviewed)
            const eligibleForThisOrder = elig.eligibleItems
              .filter((item: any) => (item.orderId === id || item.orderId?._id === id))
              .map((item: any) => (item.productId?._id || item.productId).toString());

            const allOrderProductIds = (d.order.items || []).map((i: any) =>
              (i.product?._id || i.product).toString()
            );

            const reviewed = allOrderProductIds.filter(
              (pId: string) => !eligibleForThisOrder.includes(pId)
            );
            setReviewedProductIds(reviewed);
          }
        } catch (e) {
          // Non-blocking
        }
      }
    } catch (err) {
      console.error("Failed to load order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndReviews();
  }, [id, navigate]);

  useEffect(() => {
    if (!id) return;
    const token =
      localStorage.getItem('trustcart_token') ||
      localStorage.getItem('pmart_token') ||
      '';
    const socket = io(API_URL.replace(/\/api$/, ''), {
      auth: { token },
    });

    const join = () => {
      socket.emit('join-order', { orderId: id, token });
      socket.emit('track-order', { orderId: id, token });
    };

    socket.on('connect', join);
    join();

    const handleLocationUpdate = (data: any) => {
      console.log('[LOCATION RECEIVED]', data);
      const lat = typeof data?.lat === 'number' ? data.lat : (typeof data?.latitude === 'number' ? data.latitude : null);
      const lng = typeof data?.lng === 'number' ? data.lng : (typeof data?.longitude === 'number' ? data.longitude : null);
      if (typeof lat === 'number' && typeof lng === 'number' && (lat !== 0 || lng !== 0)) {
        setLiveLocation({ lat, lng });
      }
    };

    const handleStatusUpdate = (data: any) => {
      console.log('[STATUS UPDATE RECEIVED]', data);
      fetchOrderAndReviews();
    };

    socket.on('location-update', handleLocationUpdate);
    socket.on('delivery:location:update', handleLocationUpdate);
    socket.on('status-update', handleStatusUpdate);

    return () => {
      socket.emit('leave-order', { orderId: id });
      socket.off('connect', join);
      socket.off('location-update', handleLocationUpdate);
      socket.off('delivery:location:update', handleLocationUpdate);
      socket.off('status-update', handleStatusUpdate);
      socket.disconnect();
    };
  }, [id]);

  if(loading) return <Loading/>
  if(!order) return null;
  return (
    <div className="min-h-screen mb-20 bg-app-cream">
       <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <button  onClick={()=>(
              navigate("/orders")
            )}  className="flex items-center gap-2 text-sm text-app-text-light
             hover:text-app-green mb-6 transition-colors">
              <ArrowLeftIcon className="size-4"/> Back to Orders
            </button>

              {/* order id,date,status */}
              <div className="flex items-center
               justify-between mb-8">
                  <div>
                  <h1 className="text-2xl font-semibold text-app-green">
                    Order #{order!._id.slice(-8).toUpperCase()}</h1>
                  <p className="text-sm text-app-text-light mt-1">
                    Placed on {new Date(order!.createdAt).toLocaleDateString("en-US",{
                    month:"long",day:"numeric",year:"numeric"
                  })}</p>
                  </div>
                  <span className={`px-4 py-1.5 text-sm
                     font-semibold rounded-full ${order.status === "Delivered"?"bg-green-100 text-green-700"
                     :order!.status==="Cancelled"?"bg-red-100 text-red-700"
                     :"bg-app-orange/10 text-app-orange"}`}>
                            {order!.status}
                  </span>
              </div>


              <div className="grid lg:grid-cols-3 gap-6">
                        {/*Left Side- TimeLine+Map Area */}
                        <div className="lg:col-span-2 space-y-6">
                          {/* OTP Card */}
                          <OrderOTP order={order}/>

                          {/* Live Tracking Map */}
                          <LiveMap order={order} liveLocation={liveLocation}/>
                          <OrderTimeLine order={order}/>
                        </div>

                        {/* Right Side- Order Details Sidebar */}

                        <div className="space-y-5">
                          {/* Delivery Addres */}
                          <div className="bg-white rounded-2xl p-5">
                            <h3 className="text-sm font-semibold 
                            text-app-green mb-3 flex items-center gap-2">
                              <MapPinIcon className="size-4"/>
                              Delivery Address
                            </h3>
                            <p className="text-sm text-app-text-light leading-relaxed">
                              {order?.shippingAddress.label}
                              <br/>
                              {order?.shippingAddress.address}
                              <br/>
                              {order?.shippingAddress.city},
                               {order?.shippingAddress.state}
                               {order?.shippingAddress.zip}
                            </p>
                          </div>
                        {/* Items */}
                        <div className="bg-white rounded-2xl p-5">
                          <h3 className="text-sm font-semibold text-app-green mb-3">
                            Items ({order?.items.length})</h3>
                            <div className="space-y-4 divide-y divide-app-border">
                            {order?.items.map((item: any, i: number) => {
                              const pId = (item.product?._id || item.product).toString();
                              const isReviewed = reviewedProductIds.includes(pId);
                              const sellerObj = typeof item.seller === 'object' && item.seller ? item.seller : null;

                              return (
                                <div key={i} className="pt-3 first:pt-0 space-y-2">
                                  <div className="flex items-start gap-3">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="size-12 rounded-lg object-cover border border-app-border shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-app-green truncate">
                                        {item.name}
                                      </p>
                                      <p className="text-xs text-app-text-light">
                                        {currency}{(item.price || 0).toFixed(2)} × {item.quantity} {item.unit || "pcs"}
                                      </p>
                                      {sellerObj?.storeName && (
                                        <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                                          <Store className="size-3 text-app-orange" />
                                          <span>Sold by: <strong>{sellerObj.storeName}</strong></span>
                                          {sellerObj.isVerified && (
                                            <span className="text-blue-600 font-bold text-[10px]">✓</span>
                                          )}
                                        </p>
                                      )}
                                    </div>

                                    <span className="text-sm font-semibold text-zinc-900 shrink-0">
                                      {currency}{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                    </span>
                                  </div>

                                  {/* Delivered Order Review Action */}
                                  {order?.status === "Delivered" && (
                                    <div className="flex items-center justify-end pt-1">
                                      {isReviewed ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                          <CheckCircle2 className="size-3 text-emerald-600" />
                                          Reviewed ★
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            setReviewingItem({
                                              productId: pId,
                                              productName: item.name,
                                            })
                                          }
                                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-app-orange hover:bg-app-orange-dark text-white rounded-lg text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
                                        >
                                          <Star className="size-3.5 fill-white" />
                                          Rate Product
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            </div>
                            <div className="mt-4 pt-3 border-t border-app-border space-y-1.5 text-sm">
                              <div className="flex justify-between">
                                <span className="text-app-text-light">Subtotal: </span>
                                <span>{currency}{order?.subtotal.toFixed(2)}</span>
                              </div>

                               <div className="flex justify-between">
                                <span className="text-app-text-light">Delivery Fee: </span>
                                <span>{currency}{order?.deliveryFee ===0 ?"Free": `${currency}
                                ${order?.deliveryFee.toFixed(2)}`}</span>
                              </div>

                               <div className="flex justify-between">
                                <span className="text-app-text-light">Tax: </span>
                                <span>{currency}{order?.tax.toFixed(2)}</span>
                              </div>

                               <div className="flex justify-between
                               pt-2 border-t border-app-border 
                               font-semibold text-app-green
                               ">
                                <span className=""> Total</span>
                                <span>{currency}{order?.total.toFixed(2)}</span>
                              </div>
                            </div>
                        </div>


                        </div>

              </div>
       </div>

       {/* Review Modal */}
       {reviewingItem && (
         <ReviewModal
           productId={reviewingItem.productId}
           productName={reviewingItem.productName}
           orderId={order._id}
           onClose={() => setReviewingItem(null)}
           onSuccess={() => {
             toast.success("Thank you for your rating! AI Trust Score recalculated.");
             fetchOrderAndReviews();
           }}
         />
       )}
    </div>
  )
}

export default OrderTracking
