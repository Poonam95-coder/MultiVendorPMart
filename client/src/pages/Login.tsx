import { useState } from 'react';
import { heroSectionData } from '../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { BikeIcon, MailIcon, UserIcon, LockIcon, Loader2Icon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [isLoginState, setIsLoginState] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const d = isLoginState
        ? await login(email, password)
        : await register(name, email, password);
      toast.success(isLoginState ? 'Signed in successfully' : 'Account created successfully');//notfication show
      nav(d.user?.isAdmin ? '/admin' : '/');
    } catch (e: any) {
      toast.error(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-app-green relative items-center justify-center">
        <img
          src={heroSectionData.hero_image}
          className="absolute inset-0 object-cover h-full bg-center opacity-10"
          alt="TrustCart Background"
        />
        <div className="relative text-center px-12">
          <h2 className="text-4xl font-semibold text-white mb-4">Welcome to TrustCart</h2>
          <p className="text-white/60 font-serif text-xl max-w-sm mx-auto">
            Discover everything you need at TrustCart – trusted, fresh, and delivered with care.
          </p>
        </div>
      </div>
      <div className="flex-1 flex-center px-4 py-12 bg-app-cream">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <BikeIcon className="size-8 text-app-orange" />
              <span className="text-2xl font-bold text-app-green">TrustCart</span>
            </Link>
            <h1 className="text-2xl font-bold text-app-green mb-2">
              {isLoginState ? 'Sign in to your account' : 'Create your TrustCart account'}
            </h1>
            <p className="text-sm text-app-text-light">
              {isLoginState ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => setIsLoginState(!isLoginState)}
                className="text-app-orange ml-1 font-semibold hover:underline"
              >
                {isLoginState ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {!isLoginState && (
              <label className="text-sm flex flex-col gap-1 text-zinc-700 font-medium">
                Full Name
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your Name"
                    className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border border-app-border focus:border-app-green outline-none"
                  />
                </div>
              </label>
            )}
            <label className="text-sm flex flex-col gap-1 text-zinc-700 font-medium">
              Email Address
              <div className="relative">
                <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border border-app-border focus:border-app-green outline-none"
                />
              </div>
            </label>
            <label className="text-sm flex flex-col gap-1 text-zinc-700 font-medium">
              Password
              <div className="relative">
                <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 text-sm bg-white rounded-xl border border-app-border focus:border-app-green outline-none"
                />
              </div>
              {!isLoginState && (
                <span className="text-[11px] text-zinc-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, number & special character.
                </span>
              )}
            </label>
            <button
              disabled={loading}
              className="flex-center w-full py-3 bg-app-green text-white font-semibold rounded-xl disabled:opacity-50 hover:bg-green-950 transition-colors shadow-sm"
            >
              {loading ? (
                <Loader2Icon className="animate-spin size-5" />
              ) : isLoginState ? (
                'Sign In'
              ) : (
                'Sign Up'
              )}
            </button>

            <div className="text-center pt-2">
              <Link to="/welcome" className="text-xs text-zinc-500 hover:text-app-green">
                Looking for Seller, Delivery, or Admin portal? <strong className="text-app-orange">Choose Role</strong>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

