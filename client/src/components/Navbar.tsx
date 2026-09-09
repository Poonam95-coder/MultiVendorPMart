//lucide-react = ready-made icons for React
import {
  BikeIcon,  XIcon,  ChevronDownIcon,  SearchIcon,  ShoppingCartIcon,  UserIcon, MenuIcon,  PackageIcon,  MapPinIcon,  ArrowUpRightIcon,
  ShieldIcon,  LogOutIcon,  Store,  HomeIcon,} 
  from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();//user ka data yahan se aa rha hain
  const { cartCount, setIsCartOpen } = useCart();//CartContext ka data/functions access karta hai
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();//React Router ka hook hai

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      //It converts special characters into a URL-safe format.
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate("/");
  };

  const userInitial = (
    user?.name?.trim()?.charAt(0) ||
    user?.email?.charAt(0) ||
    "U"
  ).toUpperCase();

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-app-border shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-4">
        {/* Left: Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-[22px] font-bold text-app-green shrink-0"
        >
          <BikeIcon size={26} className="text-app-orange" />
          <span>TrustCart</span>
        </Link>

        {/* Center-Left: Nav Links - Desktop */}
        <div className="hidden md:flex items-center gap-6 text-sm text-zinc-600 font-medium">
          <Link to="/" className="hover:text-app-green transition-colors">
            Home
          </Link>
          <Link
            to="/products"
            className="hover:text-app-green transition-colors"
          >
            Products
          </Link>
          <Link
            to="/deals"
            className="text-app-orange hover:text-app-orange-dark transition-colors font-semibold"
          >
            Deals
          </Link>
        </div>

        {/* Center: Search */}
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex flex-1 max-w-sm text-xs sm:text-sm"
        >
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search for groceries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-orange-50/70 rounded-full border border-orange-200/60 focus:border-app-orange focus:bg-white text-zinc-800 transition-colors placeholder:text-zinc-400 text-xs sm:text-sm outline-none"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <button
            className="relative p-2 rounded-xl text-zinc-700 hover:text-app-green hover:bg-app-cream transition-colors"
            onClick={() => setIsCartOpen(true)}
            aria-label="Open Cart"
          >
            <ShoppingCartIcon className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-app-orange text-white text-[10px] font-bold rounded-full flex-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* User / Menu */}
          <div className="relative">
            {user ? (
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-app-cream transition-colors"
                aria-expanded={userMenuOpen}
              >
                <div className="size-8 rounded-full bg-app-green text-white flex-center text-xs font-bold shadow-xs">
                  {userInitial}
                </div>
                <ChevronDownIcon className="size-3.5 text-zinc-500" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-app-green rounded-full hover:bg-app-green-light transition-colors shadow-xs"
                >
                  <UserIcon size={16} />
                  <span>Sign In</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 rounded-xl text-zinc-700 hover:bg-app-cream md:hidden transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  {userMenuOpen ? (
                    <XIcon className="size-5" />
                  ) : (
                    <MenuIcon className="size-5" />
                  )}
                </button>
              </div>
            )}

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-xl border border-app-border py-2 z-50 animate-fade-in divide-y divide-zinc-100">
                  {user && (
                    <div className="px-4 py-2.5">
                      <p className="text-sm font-bold text-zinc-900 truncate">
                        {user.name || "User"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  )}

                  <div
                    className="py-1"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    {!user && (
                      <Link to="/login" className="dropdown-link md:hidden">
                        <UserIcon size={16} />
                        <span>Sign In</span>
                      </Link>
                    )}
                    <Link to="/" className="dropdown-link md:hidden">
                      <HomeIcon size={16} />
                      <span>Home</span>
                    </Link>
                    <Link
                      to="/products"
                      className="dropdown-link md:hidden"
                    >
                      <ArrowUpRightIcon size={16} />
                      <span>Products</span>
                    </Link>
                    <Link to="/deals" className="dropdown-link md:hidden">
                      <ArrowUpRightIcon size={16} className="text-app-orange" />
                      <span className="text-app-orange font-medium">Deals</span>
                    </Link>
                    {user && (
                      <>
                        <Link to="/orders" className="dropdown-link">
                          <PackageIcon size={16} />
                          <span>My Orders</span>
                        </Link>
                        <Link to="/addresses" className="dropdown-link">
                          <MapPinIcon size={16} />
                          <span>Saved Addresses</span>
                        </Link>
                      </>
                    )}
                    {user?.isAdmin && (
                      <Link to="/admin" className="dropdown-link">
                        <ShieldIcon
                          size={16}
                          className="text-app-orange-dark"
                        />
                        <span className="text-app-orange-dark font-medium">
                          Admin Panel
                        </span>
                      </Link>
                    )}
                    <Link to="/seller" className="dropdown-link">
                      <Store size={16} className="text-app-orange" />
                      <span className="text-app-orange font-medium">
                        Seller Hub
                      </span>
                    </Link>
                    <Link to="/delivery" className="dropdown-link">
                      <BikeIcon size={16} className="text-blue-700" />
                      <span className="text-blue-700 font-medium">
                        Delivery Portal
                      </span>
                    </Link>
                  </div>

                  {user && (
                    <div
                      className="pt-1"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm w-full hover:bg-red-50 text-left text-red-600 font-medium transition-colors"
                      >
                        <LogOutIcon size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;