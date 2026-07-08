import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  Plane,
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  LayoutDashboard,
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Heart,
  Map as MapIcon,
  Shield,
} from "lucide-react";

import { AuthProvider, useAuth } from "../context/AuthContext";
import { LoginModal } from "../components/LoginModal";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const navItems = [
  { path: "/", label: "Home", icon: LayoutDashboard, protected: false },
  { path: "/plan", label: "Plan Trip", icon: Sparkles, protected: true },
  {
    path: "/destinations",
    label: "Destinations",
    icon: MapPin,
    protected: false,
  },
  {
    path: "/itinerary",
    label: "Itinerary",
    icon: Calendar,
    protected: true,
  },
  { path: "/budget", label: "Budget", icon: DollarSign, protected: true },

];

function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, setShowLoginModal } = useAuth();

  const isDashboard = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const isTransparent = isDashboard && !scrolled;

  const activeNavItems = [
    ...navItems,
    ...(user?.role === "admin"
      ? [{ path: "/admin", label: "Admin", icon: Shield, protected: true }]
      : []),
  ];

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Track scroll position — show navbar after scrolling past 100px on dashboard
  useEffect(() => {
    if (!isDashboard) {
      setScrolled(true);
      return;
    }
    setScrolled(false);
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDashboard]);

  const handleNavClick = (
    e: React.MouseEvent,
    item: { path: string; label: string; icon: React.ComponentType<any>; protected: boolean },
  ) => {
    if (item.protected && !isAuthenticated) {
      e.preventDefault();
      setShowLoginModal(true);
      return;
    }
    // If already on this page, smooth-scroll to top
    if (location.pathname === item.path) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header — transparent on dashboard until user scrolls, always styled on other pages */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? isDashboard
            ? "bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm"
            : "bg-white/80 backdrop-blur-sm border-b border-gray-200"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo → Plan Trip */}
            <Link to="/" className="flex items-center gap-2">
              <Plane className={`w-8 h-8 transition-colors duration-500 ${isTransparent ? "text-white" : "text-indigo-600"}`} />
              <span className={`text-xl font-semibold transition-colors duration-500 ${isTransparent ? "text-white" : "text-gray-900"}`}>
                TravelPlan
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-1">
              {activeNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-500 ${isTransparent
                      ? isActive
                        ? "bg-white/20 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                      : isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Auth Button */}
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors cursor-pointer outline-none ${isTransparent ? "hover:bg-white/10" : "hover:bg-gray-100"}`}>
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                        {user.initials}
                      </div>
                      <span className={`hidden sm:inline text-sm font-medium transition-colors duration-500 ${isTransparent ? "text-white" : "text-gray-700"}`}>
                        {user.name}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 hidden sm:block transition-colors duration-500 ${isTransparent ? "text-white/60" : "text-gray-400"}`} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <DropdownMenuLabel className="font-normal px-3 py-2.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      {user.role === "admin" && (
                        <DropdownMenuItem
                          className="cursor-pointer px-3 py-2 font-semibold text-indigo-600 focus:text-indigo-750 focus:bg-indigo-50"
                          onClick={() => navigate("/admin")}
                        >
                          <Shield className="w-4 h-4 mr-2.5 text-indigo-500" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="cursor-pointer px-3 py-2"
                        onClick={() => navigate("/profile")}
                      >
                        <UserIcon className="w-4 h-4 mr-2.5 text-gray-500" />
                        My Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer px-3 py-2"
                        onClick={() => navigate("/my-trips")}
                      >
                        <MapIcon className="w-4 h-4 mr-2.5 text-gray-500" />
                        My Trips
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer px-3 py-2"
                        onClick={() => navigate("/wishlist")}
                      >
                        <Heart className="w-4 h-4 mr-2.5 text-gray-500" />
                        Wishlist
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer px-3 py-2"
                      variant="destructive"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4 mr-2.5" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  id="login-btn"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLoginModal(true)}
                  className={`gap-2 cursor-pointer transition-colors duration-500 ${isTransparent ? "bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white" : "border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"}`}
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white border-b border-gray-200">
        <div className="flex justify-around py-2">
          {activeNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isActive ? "text-indigo-600" : "text-gray-600"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className={location.pathname === "/" ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24"}>
        {location.pathname === "/" ? <Outlet /> : <div className="pt-16"><Outlet /></div>}
      </main>

      {/* Login Modal */}
      <LoginModal />
    </div>
  );
}

export function Root() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}
