import { useState } from 'react';
import { BikeIcon, Loader2Icon, MailIcon, LockIcon } from 'lucide-react';
import { heroSectionData } from '../../assets/assets';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function DeliveryLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { deliveryLogin } = useAuth();
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await deliveryLogin(email, password);
      toast.success('Welcome back, Partner!');
      nav('/delivery');
    } catch (e: any) {
      toast.error(e.message || 'Delivery login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center">
        <img
          src={heroSectionData.hero_image}
          className="absolute inset-0 object-cover h-full opacity-10"
          alt="Delivery Background"
        />
        <div className="relative text-center px-12">
          <h2 className="text-4xl font-semibold text-white mb-4">
            Delivery Partner Portal
          </h2>
          <p className="text-white/60 font-serif text-xl max-w-sm mx-auto">
            Manage your assigned deliveries, share real-time location, and deliver with ease.
          </p>
        </div>
      </div>
      <div className="flex-1 flex-center px-4 py-12 bg-app-cream">
        <form
          onSubmit={submit}
          className="bg-white rounded-2xl p-8 w-full max-w-md space-y-5 border border-app-border shadow-sm"
        >
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <BikeIcon className="mx-auto size-8 text-app-green" />
            </Link>
            <h1 className="text-2xl font-semibold text-app-green mt-1">
              Delivery Partner Login
            </h1>
            <p className="text-xs text-app-text-light mt-1">
              Enter your registered partner credentials
            </p>
          </div>
          <div className="space-y-4">
            <label className="text-sm flex flex-col gap-1">
              Email Address
              <div className="relative">
                <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-app-border focus:border-app-green outline-none text-sm"
                  placeholder="partner@trustcart.com"
                />
              </div>
            </label>
            <label className="text-sm flex flex-col gap-1">
              Password
              <div className="relative">
                <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-app-border focus:border-app-green outline-none text-sm"
                  placeholder="••••••••"
                />
              </div>
            </label>
          </div>
          <button
            disabled={loading}
            className="w-full py-3 bg-app-green text-white rounded-xl font-semibold hover:bg-app-green-light transition-colors disabled:opacity-60 flex-center gap-2 shadow-sm"
          >
            {loading ? <Loader2Icon className="size-4 animate-spin" /> : 'Sign In'}
          </button>
          <div className="text-center pt-2 flex flex-col gap-1.5">
            <Link to="/welcome" className="text-xs text-app-orange hover:underline font-medium">
              ← Switch Portal / Role
            </Link>
            <Link to="/login" className="text-xs text-zinc-500 hover:underline">
              Customer or Admin Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

