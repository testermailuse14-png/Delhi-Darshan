import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, MapPin, Car, Gem, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Places", path: "/Places", icon: MapPin },
    { label: "Cab Booking", path: "/cab-booking", icon: Car },
    { label: "Hidden Gems", path: "/hidden-gems", icon: Gem },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/logo.jpg"
              alt="App Logo"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <span className="block text-xl font-bold text-gray-800">
                Delhi Darshan
              </span>
              <span className="block text-xs text-gray-600 -mt-1">
                Discover & Explore
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (Visible only on Large screens) */}
          <div className="hidden lg:flex items-center space-x-2 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <div key={item.path} className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-md bg-orange-100/80"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Link
                    to={item.path}
                    className={`relative z-10 flex items-center gap-2 px-4 py-2 font-medium transition-all duration-300 rounded-md ${
                      isActive
                        ? "text-orange-700"
                        : "text-gray-700 hover:text-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Auth Section (Visible only on Large screens) */}
          <div className="hidden lg:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <p className="text-sm font-medium text-gray-800">{user?.email}</p>
                <button
                  onClick={logout}
                  className="relative flex items-center gap-2 px-6 py-2 rounded-2xl font-semibold text-white bg-gradient-to-b from-red-400 to-red-600 shadow-[0_4px_0_#991b1b] transition-all duration-300 hover:shadow-[0_6px_12px_rgba(239,68,68,0.6)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_2px_0_#991b1b] before:absolute before:inset-0 before:rounded-2xl before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/signin"
                className="relative flex items-center gap-2 px-6 py-2 rounded-2xl font-semibold text-white bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_4px_0_#b45309] transition-all duration-300 hover:shadow-[0_6px_12px_rgba(245,158,11,0.6)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_2px_0_#b45309] before:absolute before:inset-0 before:rounded-2xl before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile/Tablet menu button (Visible on screens smaller than lg) */}
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile/Tablet Menu Dropdown */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === item.path
                        ? "bg-orange-100 text-orange-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-3 py-2 mt-2 flex items-center justify-center gap-2 bg-gradient-to-b from-amber-400 to-amber-600 text-white rounded-2xl text-base font-semibold shadow-[0_4px_0_#b45309] hover:shadow-[0_6px_12px_rgba(245,158,11,0.6)] hover:-translate-y-1 transition-all duration-300 active:translate-y-0 active:shadow-[0_2px_0_#b45309]"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}