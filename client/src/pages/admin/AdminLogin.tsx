import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  BikeIcon,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);
      if (!data.user?.isAdmin) {
        await logout();
        setError("Access denied: This account does not have administrator privileges.");
        toast.error("Access denied: Administrator privileges required.");
        return;
      }

      toast.success("Welcome to TrustCart Admin Console!");
      navigate("/admin");
    } catch (err: any) {
      setError(err.message || "Invalid administrator credentials");
      toast.error(err.message || "Invalid administrator credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-cream flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Bar */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between pb-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-9 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-sm">
            <BikeIcon className="size-5 text-app-orange" />
          </div>
          <span className="text-xl font-bold text-zinc-900">TrustCart</span>
        </Link>
        <Link
          to="/welcome"
          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg border border-app-border bg-white"
        >
          ← Role Selection
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-8 border border-app-border shadow-md animate-fade-in space-y-6">
        <div className="text-center space-y-2">
          <div className="size-14 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center mx-auto border border-purple-100 shadow-2xs">
            <ShieldCheck className="size-7" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Admin Control Center</h1>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Authorized platform administrators and supervisors only.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="text-xs font-semibold text-zinc-700 flex flex-col gap-1.5">
            Admin Email Address
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 rounded-xl border border-app-border focus:border-purple-600 focus:bg-white text-sm outline-none transition-colors"
              />
            </div>
          </label>

          <label className="text-xs font-semibold text-zinc-700 flex flex-col gap-1.5">
            Admin Password
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 rounded-xl border border-app-border focus:border-purple-600 focus:bg-white text-sm outline-none transition-colors"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-zinc-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Sign In to Admin Panel"
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-zinc-100 text-center">
          <p className="text-[11px] text-zinc-400">
            Protected by multi-tier JWT authorization and role verification.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto w-full text-center text-xs text-zinc-400 pt-6">
        <span>© 2026 TrustCart Operations. All rights reserved.</span>
      </div>
    </div>
  );
}
