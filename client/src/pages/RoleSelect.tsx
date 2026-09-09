import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Store,
  Truck,
  ShieldCheck,
  ArrowRight,
  BikeIcon,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function RoleSelect() {
  const navigate = useNavigate();

  const roles = [
    {
      id: "customer",
      title: "Customer",
      badge: "Shop & Save",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: ShoppingBag,
      iconBg: "bg-emerald-50 text-emerald-700",
      description:
        "Order farm-fresh groceries, explore verified sellers with AI trust scores, and track live order deliveries.",
      features: [
        "Real-time live delivery tracking",
        "Transparent AI Seller Trust Scores",
        "Verified customer ratings & reviews",
      ],
      path: "/login",
      buttonText: "Continue as Customer",
      buttonColor: "bg-app-green hover:bg-green-950 text-white",
    },
    {
      id: "seller",
      title: "Seller",
      badge: "Seller Hub",
      badgeColor: "bg-orange-100 text-app-orange border-orange-200",
      icon: Store,
      iconBg: "bg-orange-50 text-app-orange",
      description:
        "List products, monitor stock inventory, accept and pack orders, and build store reputation with AI Trust.",
      features: [
        "Product catalog & stock management",
        "Order fulfillment & preparation workflow",
        "Store performance & AI Trust metrics",
      ],
      path: "/seller/login",
      buttonText: "Continue as Seller",
      buttonColor: "bg-app-orange hover:bg-app-orange-dark text-white",
    },
    {
      id: "delivery",
      title: "Delivery Partner",
      badge: "Fleet Portal",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Truck,
      iconBg: "bg-blue-50 text-blue-700",
      description:
        "Receive assigned delivery dispatches, broadcast live geolocation, and safely complete deliveries with 6-digit OTP.",
      features: [
        "Active assigned orders dispatch",
        "Real-time GPS geolocation sharing",
        "Secure 6-digit OTP delivery confirmation",
      ],
      path: "/delivery/login",
      buttonText: "Continue as Delivery Partner",
      buttonColor: "bg-blue-700 hover:bg-blue-800 text-white",
    },
    {
      id: "admin",
      title: "Admin",
      badge: "Operations Center",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      icon: ShieldCheck,
      iconBg: "bg-purple-50 text-purple-700",
      description:
        "Supervise operations, verify and approve seller applications, dispatch delivery partners, and monitor metrics.",
      features: [
        "Seller verification & approval engine",
        "Order assignment to delivery fleet",
        "Platform-wide catalog & analytics oversight",
      ],
      path: "/admin/login",
      buttonText: "Continue as Admin",
      buttonColor: "bg-zinc-900 hover:bg-black text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-app-cream flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between pb-6 border-b border-app-border">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-10 bg-app-green rounded-xl flex items-center justify-center text-white shadow-sm">
            <BikeIcon className="size-6 text-app-orange" />
          </div>
          <div>
            <span className="text-xl font-bold text-app-green tracking-tight">TrustCart</span>
            <span className="block text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
              Role Access Portal
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs font-semibold text-zinc-600 hover:text-app-green px-4 py-2 rounded-xl bg-white border border-app-border hover:bg-app-cream transition-colors shadow-2xs"
        >
          ← Return to Store
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto w-full my-auto py-10 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
            <Sparkles className="size-3.5 text-app-orange" />
            <span>Welcome to TrustCart</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-app-green tracking-tight">
            How would you like to continue?
          </h1>
          <p className="text-sm sm:text-base text-app-text-light">
            Select your role to access your dedicated TrustCart portal with customized tools and dashboards.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                onClick={() => navigate(role.path)}
                className="bg-white rounded-3xl p-6 border border-app-border hover:border-app-orange/60 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-4">
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`size-12 rounded-2xl flex items-center justify-center ${role.iconBg} group-hover:scale-105 transition-transform`}>
                      <Icon className="size-6" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${role.badgeColor}`}>
                      {role.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 group-hover:text-app-green transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  {/* Key Features List */}
                  <div className="pt-2 space-y-1.5 border-t border-zinc-100">
                    {role.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-600">
                        <CheckCircle2 className="size-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-6">
                  <button
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-xs ${role.buttonColor}`}
                  >
                    <span>{role.buttonText}</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="max-w-6xl mx-auto w-full pt-6 border-t border-app-border text-center text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 TrustCart. All rights reserved.</span>
        <span className="text-zinc-400">
          Protected by role-based authentication and end-to-end authorization security.
        </span>
      </div>
    </div>
  );
}
