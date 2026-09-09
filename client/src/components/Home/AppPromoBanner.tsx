import { Link } from "react-router-dom";
import { appPromoBannerData, assets } from "../../assets/assets";
import { ShoppingBag, Tag, Truck } from "lucide-react";

const AppPromoBanner = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 my-14 bg-gradient-to-r from-app-green via-green-950 to-app-green rounded-3xl shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 xl:px-10">
        {/* Left Side Content */}
        <div className="text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs border border-white/15">
            <ShoppingBag className="size-3.5 text-app-orange" />
            <span>Farm-Fresh & Verified Quality</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl text-white">
            {appPromoBannerData.title}
          </h2>
          <p className="text-white/80 max-w-lg text-sm sm:text-base leading-relaxed">
            {appPromoBannerData.description}
          </p>

          <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
            <Link
              to="/products"
              className="px-6 py-3 bg-app-orange text-white font-bold text-sm rounded-xl hover:bg-app-orange-dark transition-all shadow-sm flex items-center gap-2 active:scale-95"
            >
              <ShoppingBag className="size-4" /> Start Shopping
            </Link>
            <Link
              to="/deals"
              className="px-6 py-3 bg-white/10 text-white font-semibold text-sm rounded-xl hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2 active:scale-95"
            >
              <Tag className="size-4" /> Browse Deals
            </Link>
            <Link
              to="/orders"
              className="px-6 py-3 bg-white/5 text-white/90 font-medium text-sm rounded-xl hover:bg-white/15 transition-all border border-white/10 flex items-center gap-2 active:scale-95"
            >
              <Truck className="size-4" /> Track Orders
            </Link>
          </div>
        </div>

        {/* Right Side Image */}
        <img
          src={assets.delivery_truck}
          alt="TrustCart Fast Delivery"
          className="max-w-60 sm:max-w-96 xl:pr-6 drop-shadow-lg"
        />
      </div>
    </section>
  );
};

export default AppPromoBanner
