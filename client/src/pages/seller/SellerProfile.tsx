import { useEffect, useState } from "react";
import { apiGet, apiPut, apiPost } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";
import {
  Store,
  Mail,
  Phone,
  MapPin,
  BadgeCheck,
  Upload,
  Save,
  ShieldAlert,
  Sparkles,
  Star,
  MessageSquareHeart,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SellerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [trust, setTrust] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [form, setForm] = useState({
    storeName: "",
    storeDescription: "",
    email: "",
    phone: "",
    address: "",
    logo: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/seller/profile");
      setProfile(data.seller);
      setTrust(data.trust);
      setForm({
        storeName: data.seller?.storeName || "",
        storeDescription: data.seller?.storeDescription || "",
        email: data.seller?.email || "",
        phone: data.seller?.phone || "",
        address: data.seller?.address || "",
        logo: data.seller?.logo || "",
      });
    } catch (e: any) {
      toast.error(e.message || "Failed to load seller profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setUploadingLogo(true);
    try {
      const data = await apiPost("/upload", formData);
      if (data.url) {
        setForm((prev) => ({ ...prev, logo: data.url }));
        toast.success("Logo uploaded successfully");
      }
    } catch (err: any) {
      toast.error(err.message || "Logo upload failed");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.storeName || !form.email) {
      toast.error("Store name and email are required");
      return;
    }

    setSaving(true);
    try {
      const data = await apiPut("/seller/profile", form);
      setProfile(data.seller);
      toast.success("Store profile updated successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-app-green">Store Profile</h1>
        <p className="text-sm text-app-text-light mt-1">
          Manage your seller identity, customer-facing store information and contact details.
        </p>
      </div>

      {/* Account Status Card */}
      <div className="bg-white p-6 rounded-2xl border border-app-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-2xl bg-app-cream flex items-center justify-center overflow-hidden border border-app-border shrink-0">
            {profile?.logo ? (
              <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="size-8 text-app-orange" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900">{profile?.storeName}</h2>
              {profile?.isVerified ? (
                <span className="flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  <BadgeCheck className="size-3.5 fill-blue-600 text-white" /> Verified Store
                </span>
              ) : (
                <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                  Pending Verification
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Account Owner: <strong className="text-zinc-700">{user?.name}</strong> • Rating:{" "}
              ⭐ {profile?.rating?.toFixed(1) || 0}
            </p>
          </div>
        </div>

        <div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              profile?.isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {profile?.isActive ? "Active Account" : "Suspended"}
          </span>
        </div>
      </div>

      {/* AI Trust Score Overview Card */}
      <div className="bg-gradient-to-br from-emerald-50 via-app-cream/50 to-emerald-50/40 rounded-2xl p-6 border border-emerald-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-app-orange" />
            <h3 className="text-sm font-bold text-app-green uppercase tracking-wider">
              AI Seller Trust Score
            </h3>
          </div>
          <span className="text-sm font-extrabold px-3 py-1 rounded-full bg-emerald-700 text-white shadow-2xs">
            {trust?.trustScore ?? (profile?.isVerified ? 85 : 50)} / 100
          </span>
        </div>

        <p className="text-xs text-zinc-700 leading-relaxed bg-white/80 p-3 rounded-xl border border-emerald-100 italic">
          "{trust?.trustSummary || 'Your store trust score is calculated based on verification, ratings, customer review sentiment, and complaint metrics.'}"
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-white p-3 rounded-xl border border-app-border">
            <p className="text-[10px] text-zinc-500 font-medium">Verification (20%)</p>
            <p className="font-bold text-blue-700 text-sm mt-0.5">
              {trust?.verificationScore ?? (profile?.isVerified ? 100 : 30)}/100
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-app-border">
            <p className="text-[10px] text-zinc-500 font-medium">Ratings (30%)</p>
            <p className="font-bold text-amber-700 text-sm mt-0.5">
              {trust?.ratingScore ?? 70}/100
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-app-border">
            <p className="text-[10px] text-zinc-500 font-medium">Sentiment (30%)</p>
            <p className="font-bold text-emerald-700 text-sm mt-0.5">
              {trust?.reviewSentimentScore ?? 70}/100
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-app-border">
            <p className="text-[10px] text-zinc-500 font-medium">Complaints (20%)</p>
            <p className="font-bold text-purple-700 text-sm mt-0.5">
              {trust?.complaintScore ?? 100}/100
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-app-border shadow-sm space-y-6">
        <h3 className="text-base font-semibold text-app-green border-b border-app-border pb-3">
          Store Information
        </h3>

        {/* Store Logo Upload */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            Store Logo
          </label>
          <div className="flex items-center gap-4">
            {form.logo && (
              <img
                src={form.logo}
                alt="Logo preview"
                className="size-14 rounded-xl object-cover border border-app-border shrink-0"
              />
            )}
            <div className="space-y-1.5 flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-app-orange/10 file:text-app-orange hover:file:bg-app-orange/20 cursor-pointer"
              />
              <input
                type="text"
                placeholder="Or paste image URL for logo..."
                value={form.logo}
                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                className="w-full px-3 py-1.5 bg-app-cream/50 border border-app-border rounded-xl text-xs outline-none focus:border-app-orange"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Store Name *
            </label>
            <input
              type="text"
              required
              value={form.storeName}
              onChange={(e) => setForm({ ...form, storeName: e.target.value })}
              className="w-full px-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Contact Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Contact Phone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+91 9876543210"
              className="w-full px-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
              Store Location / City
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. Hisar, Haryana"
              className="w-full px-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
            Store Description
          </label>
          <textarea
            rows={3}
            value={form.storeDescription}
            onChange={(e) => setForm({ ...form, storeDescription: e.target.value })}
            placeholder="Tell customers about your store, freshness standards, and specialties..."
            className="w-full px-4 py-2.5 bg-app-cream/50 border border-app-border rounded-xl text-sm outline-none focus:border-app-orange"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-app-orange text-white rounded-xl text-sm font-medium hover:bg-app-orange-dark transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save className="size-4" /> {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
