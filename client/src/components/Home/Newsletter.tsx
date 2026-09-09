import { useState } from "react";
import { MailIcon, Loader2Icon } from "lucide-react";
import { apiPost } from "../../services/api";
import toast from "react-hot-toast";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await apiPost("/newsletter", { email });
      if (res.alreadySubscribed) {
        toast(res.message || "You are already subscribed.", { icon: "ℹ️" });
      } else {
        toast.success(res.message || "You're subscribed to TrustCart updates!");
        setEmail("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to subscribe to updates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl mx-auto shadow-xs mt-24 mb-16 border border-app-border">
      <div className="max-w-2xl mx-auto text-center">
        <div className="size-16 bg-emerald-50 rounded-2xl flex-center mx-auto mb-5 border border-emerald-100">
          <MailIcon className="size-8 text-app-green" strokeWidth={1.75} />
        </div>
        <h2 className="text-3xl font-bold text-app-green mb-3">
          Subscribe to TrustCart Updates
        </h2>
        <p className="text-app-text-light mb-8 text-sm sm:text-base leading-relaxed">
          Get weekly updates on farm-fresh produce, seasonal specials, and verified store deals delivered right to your inbox.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 px-5 py-3.5 rounded-xl border border-app-border focus:border-app-green focus:ring bg-white text-sm transition-all"
          />
          <button
            disabled={loading}
            className="px-8 py-3.5 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors shadow-sm whitespace-nowrap active:scale-[0.98] disabled:opacity-60 flex-center gap-2"
            type="submit"
          >
            {loading ? <Loader2Icon className="size-4 animate-spin" /> : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;

