import { NavLink, Outlet } from "react-router-dom";
import {
  Store,
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Boxes,
  UserCheck,
  LogOut,
  BadgeCheck,
  Clock,
  AlertTriangle,
  Lock,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";

export default function SellerLayout() {
  const { seller } = useAuth();
  const isApproved = seller?.isVerified && seller?.isActive;

  const SellerLinks = [
    { to: "/seller", label: "Dashboard", icon: LayoutDashboard, requiresApproval: false },
    { to: "/seller/products", label: "Products", icon: Package, requiresApproval: true },
    { to: "/seller/inventory", label: "Inventory", icon: Boxes, requiresApproval: true },
    { to: "/seller/orders", label: "Orders", icon: ShoppingBag, requiresApproval: true },
    { to: "/seller/profile", label: "Store Profile", icon: UserCheck, requiresApproval: false },
    { to: "/", label: "Exit Store", icon: LogOut, requiresApproval: false },
  ];

  return (
    <div className="h-screen overflow-hidden bg-app-cream">
      <div className="max-lg:hidden">
        <Navbar />
      </div>
      <div className="flex flex-col h-full lg:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {/* Seller Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 h-fit bg-white rounded-2xl p-4 border border-app-border shadow-sm">
          <div className="pb-4 mb-4 border-b border-app-border">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-semibold text-app-green flex items-center gap-2">
                <Store className="size-5 text-app-orange" />
                <span className="truncate">{seller?.storeName || "Seller Hub"}</span>
              </h2>
              {seller?.isVerified && (
                <span title="Verified Seller" className="text-blue-500">
                  <BadgeCheck className="size-4 fill-blue-500 text-white" />
                </span>
              )}
            </div>
            <div className="mt-2 px-2">
              {!seller?.isVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Clock className="size-3" /> Pending Verification
                </span>
              ) : !seller?.isActive ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <AlertTriangle className="size-3" /> Account Inactive
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <BadgeCheck className="size-3" /> Verified & Active
                </span>
              )}
            </div>
          </div>
          <nav className="flex flex-col gap-1.5">
            {SellerLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/seller"}
                className={({ isActive }) =>
                  `flex items-center justify-between p-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-app-green text-white"
                      : "text-zinc-600 hover:bg-orange-50 hover:text-zinc-900"
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <link.icon className="size-4" /> {link.label}
                </span>
                {!isApproved && link.requiresApproval && (
                  <Lock className="size-3 text-zinc-400" />
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content with Alert Banner */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-5">
          {/* Status Banners */}
          {!seller?.isVerified ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-900 animate-fade-in shadow-sm">
              <Clock className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Seller Account Pending Admin Verification</h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your seller account is pending Admin verification. You cannot sell products until Admin approves your account. You may view and edit your store profile in the meantime.
                </p>
              </div>
            </div>
          ) : !seller?.isActive ? (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3 text-rose-900 animate-fade-in shadow-sm">
              <AlertTriangle className="size-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Seller Account Inactive / Suspended</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  Your seller account is currently inactive. Please contact Admin for assistance.
                </p>
              </div>
            </div>
          ) : null}

          <Outlet />
        </main>
      </div>
    </div>
  );
}
