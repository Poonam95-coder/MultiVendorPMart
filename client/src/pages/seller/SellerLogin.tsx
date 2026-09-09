import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Store, ArrowRight, Lock, Mail, User, Phone, MapPin, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function SellerLogin() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const { sellerLogin, sellerRegister } = useAuth();
  const navigate = useNavigate();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regStoreName, setRegStoreName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regDescription, setRegDescription] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in email and password");
      return;
    }
    setLoading(true);
    try {
      await sellerLogin(loginEmail, loginPassword);
      toast.success("Welcome back to Seller Hub!");
      navigate("/seller");
    } catch (e: any) {
      toast.error(e.message || "Failed to log in as seller");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regStoreName || !regEmail || !regPassword) {
      toast.error("Name, Store Name, Email, and Password are required");
      return;
    }
    setLoading(true);
    try {
      await sellerRegister({
        name: regName,
        storeName: regStoreName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        address: regAddress,
        storeDescription: regDescription,
      });
      toast.success("Seller registration successful! Welcome to TrustCart.");
      navigate("/seller");
    } catch (e: any) {
      toast.error(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-cream flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-app-border shadow-md animate-fade-in">
        {/* Top Branding */}
        <div className="text-center mb-6">
          <div className="size-14 bg-orange-100 text-app-orange rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Store className="size-7" />
          </div>
          <h1 className="text-2xl font-bold text-app-green">TrustCart Seller Hub</h1>
          <p className="text-xs text-app-text-light mt-1">
            Grow your verified store and reach thousands of customers.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-app-cream/80 p-1 rounded-xl mb-6 border border-app-border">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              tab === "login" ? "bg-white text-app-green shadow-sm" : "text-zinc-500"
            }`}
          >
            Seller Login
          </button>
          <button
            onClick={() => setTab("register")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              tab === "register" ? "bg-white text-app-green shadow-sm" : "text-zinc-500"
            }`}
          >
            Register Store
          </button>
        </div>

        {/* Login Form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Seller Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="seller@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-app-orange text-white rounded-xl text-sm font-semibold hover:bg-app-orange-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? "Signing in..." : "Enter Seller Dashboard"} <ArrowRight className="size-4" />
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Owner Name"
                  className="w-full pl-10 pr-4 py-2 bg-app-cream/50 border border-app-border rounded-xl text-xs outline-none focus:border-app-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Store Name *
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={regStoreName}
                  onChange={(e) => setRegStoreName(e.target.value)}
                  placeholder="e.g. Fresh Farm Organics"
                  className="w-full pl-10 pr-4 py-2 bg-app-cream/50 border border-app-border rounded-xl text-xs outline-none focus:border-app-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Business Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="store@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-app-cream/50 border border-app-border rounded-xl text-xs outline-none focus:border-app-orange"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full pl-9 pr-3 py-2 bg-app-cream/50 border border-app-border rounded-xl text-xs outline-none focus:border-app-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Location / City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-400" />
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="City, State"
                    className="w-full pl-9 pr-3 py-2 bg-app-cream/50 border border-app-border rounded-xl text-xs outline-none focus:border-app-orange"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                Create Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2 bg-app-cream/50 border border-app-border rounded-xl text-xs outline-none focus:border-app-orange"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-app-green text-white rounded-xl text-sm font-semibold hover:bg-green-950 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm mt-2"
            >
              {loading ? "Registering Store..." : "Register & Open Store"}{" "}
              <ArrowRight className="size-4" />
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="mt-6 pt-4 border-t border-app-border text-center text-xs text-zinc-500">
          <Link to="/" className="hover:text-app-green font-medium">
            ← Back to Customer Store
          </Link>
        </div>
      </div>
    </div>
  );
}
