import { useSearchParams } from "react-router-dom";
import type { Order } from "../types";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { statusColors } from "../assets/assets";
import { apiGet, API_URL } from "../services/api";
import { io } from "socket.io-client";
import Loading from "../components/Loading";
import { CalendarIcon, ChevronRightIcon, PackageIcon } from "lucide-react";
import { Link } from "react-router-dom";

const MyOrders = () => {
  const currency = import.meta.env.VITE_CURRENCY_SYMBOL || "$";

  const [orders,setOrders] = useState<Order[]>([]);
  const [loading,setLoading] = useState(true);
  const [activeTab,setActiveTab] = useState("all");
  const [searchParams,setSearchParams] = useSearchParams();

  const tabs = ["all","Placed","Out for delivery","Delivered"]

  const {clearCart}=useCart();

  const fetchOrders = async ()=>{ setLoading(true); try { const status=activeTab==='all'?'':activeTab==='Out for delivery'?'Out for Delivery':activeTab; const d=await apiGet(`/orders/my${status?`?status=${encodeURIComponent(status)}`:''}`); setOrders(d.orders||[]); } finally { setLoading(false); } }
    useEffect(()=>{
        if(searchParams.get("clearCart")){
          clearCart();
          setSearchParams({});
        }
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
    },[activeTab])
  
  return (
    <div className="min-h-screen bg-app-cream mb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-app-green mb-6">
        My Orders
        </h1>

        {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab)=>(
          <button key={tab} className={`px-4 py-4 text-sm font-medium rounded-xl whitespace-nowrap 
            transition-colors ${activeTab === tab ?"bg-app-green text-white":
            "bg-white text-app-text-light hover:bg-app-cream"}`}
           onClick={()=>setActiveTab(tab)}>
{tab === "all" ? "All Orders" :tab}
          </button>
        ))}
      </div>


        {/* Orders List */}
        {loading ? (
          <Loading/>
        ):
        (
          orders.length===0 ?(
            <div className="text-center py-16">
              <PackageIcon className="size-16 text-app-border mx-auto mb-4"/>
              <h2 className="text-lg font-medium text-app-green mb-2">
                No orders yet
              </h2>
              <p className="text-sm text-app-texxt-light mb-4">
                Start shopping to see your orders here</p>
                
              <Link to="/products">
              Start Shopping
                </Link>
              </div>
          )
          :(
            <div className="space-y-4">
              {orders.map((order)=>(
                <Link key={order._id}
                 to={`/orders/${order._id}`} className="block max-w-4xl 
                 bg-white rounded-2xl p-5 hover:shadow transition-all">
                {/* order id,date & status */}
                <div className="flex items-start justify-between mb-3">
                    {/* Left */}
                    <div >
                    <p className="text-sm font-medium text-app-green">
                      Order #{order._id.slice(-8).toUpperCase()}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarIcon className="size-3 text-app-text-light"/>
                      <span className="text-xs text-app-text-light">
                        {new Date(order.createdAt).toLocaleDateString("en-US"
                          ,{month:"short", day:"numeric", year: "numeric"})}</span>
                    </div>
                    </div>
                    {/* Right */}
                    <div className="flex items-center gap-2">
                        <span className={`px-4 py-1 text-xs font-medium 
                          rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                          {order.status}
                             </span>
                           <ChevronRightIcon
                            className="size-4 text-app-text-light"/>
                     
                    </div>
                </div>


                {/* Item thumbnails */}
                          <div className="flex items-center gap-2 mb-3">
                                {order.items.slice(0,4).map((item,i)=>(
                                  <img key={i} 
                                  src={item.image}
                                   alt={item.name} 
                                   className="size-12 sm:size-16 rounded-lg
                                    object-cover border border-app-border "/>
                                ))}
                                { order.items.length>4 && (
                                <div className="size-12
                                 sm:size-16 rounded-lg
                                  bg-app-cream flex-cente text-xs
                                   font-semibold text-app-text-light">
                                  +{order.items.length-4}
                                  </div>

                               ) }                          
                          </div>


                {/* total items & price */}
                <div className="flex justify-between items-center pt-3 border-t border-app-border/60 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600 font-medium">
                      {order.items.length} items
                    </span>
                    {order.status === "Delivered" && (
                      <span className="text-xs font-semibold text-app-orange bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100 flex items-center gap-1">
                        ★ Rate Products
                      </span>
                    )}
                  </div>

                  <span className="font-semibold text-app-green">
                    {currency}{order.total.toFixed(2)}
                  </span>
                </div>
                </Link>
              ))}
            </div>
          )
        )
      }

      </div>

    </div>
  )
}

export default MyOrders
