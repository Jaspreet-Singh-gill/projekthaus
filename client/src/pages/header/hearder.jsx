import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import useAuthStore from "../../store/authStore";
import { authService } from "../../api/index";
import { Sun, Moon } from "lucide-react";
import useThemeStore from "../../store/themeStore";
import { Link } from "react-router-dom";

const Header = ({ onMenuClick, onMenuOpen }) => {
  const { user, clearTheUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Handle click outside to close dropdowns like a professional, polished app should
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearTheUser();
      toast.success("Successfully logged out");
      setIsProfileDropdownOpen(false);
    } catch (error) {
      toast.error(error.message || "Logout failed");
    }
  };

  const navLinks = [
    { label: "Dashboard", href: "#" },
    { label: "Projects", href: "#" },
    { label: "Tasks", href: "#" },
    { label: "Notes", href: "#" },
    { label: "Team", href: "#" },
  ];


  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-900/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side: Mobile Menu Button (when logged in) or Brand Logo */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onMenuClick}
                  className={`${onMenuOpen ? "hidden" : ""} md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors focus:outline-none cursor-pointer`}
                  aria-label="Open sidebar menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                {/* Brand Logo on mobile when logged in */}
                <a href="#" className="flex items-center gap-2 md:hidden group">
                  <div className="w-8 h-8 bg-gradient-to-tr from-violet-600 to-blue-500 rounded-lg flex items-center justify-center shadow shadow-violet-500/10 transition-transform duration-200 group-hover:scale-105">
                    <img className="w-4 h-4 brightness-0 invert" src="/logo.svg" alt="projektHaus logo" />
                  </div>
                  <span className="text-md font-bold text-slate-900 dark:text-white tracking-tight">
                    projekt<span className="text-violet-600 dark:text-violet-400">Haus</span>
                  </span>
                </a>
              </div>
            ) : (
              <div className="flex items-center">
                <a href="#" className="flex items-center gap-2.5 group">
                  <div className="w-9 h-9 bg-gradient-to-tr from-violet-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/10 group-hover:scale-105 transition-transform duration-200">
                    <img className="w-5 h-5 brightness-0 invert" src="/logo.svg" alt="projektHaus logo" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent tracking-tight">
                    projekt<span className="text-violet-600 dark:text-violet-400">Haus</span>
                  </span>
                </a>

                {/* Desktop Navigation Link Items */}
                <nav className="hidden md:flex items-center ml-10 space-x-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-all duration-200"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>

          {/* Right-side utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors duration-200 focus:outline-none cursor-pointer"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform duration-300" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600 hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {user ? (
              <>
                {/* Notifications Button */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors duration-200 relative focus:outline-none cursor-pointer"
                    aria-label="View notifications"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>

                  {/* Notifications Dropdown Panel */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-800/80 animate-fade-in">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Notifications</span>
                        <span className="text-[10px] bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 px-2 py-0.5 rounded-full font-semibold">
                          0 New
                        </span>
                      </div>
                      <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
                        This feature will be available soon
                      </div>
                      <a
                        href="#"
                        className="block py-2.5 text-center text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-semibold bg-slate-50 dark:bg-slate-900/50 transition-colors duration-150 border-t border-slate-100 dark:border-slate-800/80"
                      >
                        View all notifications
                      </a>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-200 focus:outline-none cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-blue-500 p-0.5 flex items-center justify-center shadow-sm">
                      {user.avatar?.url ? (
                        <img
                          src={user.avatar.url}
                          alt={user.name || "User profile"}
                          className="w-full h-full object-cover rounded-[6px]"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-white uppercase">
                          {user.name ? user.name.substring(0, 2) : user.username?.substring(0, 2) || "U"}
                        </span>
                      )}
                    </div>
                    <svg
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""
                        }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Profile Dropdown Options */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-100 dark:divide-slate-800 animate-fade-in">
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Logged in as</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate mt-0.5">{user.name || user.username}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="py-1 bg-white dark:bg-slate-900">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/55 transition-colors duration-150"
                        >
                          My Profile
                        </Link>
                      </div>
                      <div className="py-1 bg-white dark:bg-slate-900">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors duration-150 focus:outline-none cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Desktop Authentication Links */}
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    to="login"
                    className="text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="register"
                    className="py-2 px-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-md shadow-violet-500/15 active:scale-[0.98] transition-all duration-150 focus:outline-none"
                  >
                    Get Started
                  </Link>
                </div>

                {/* Mobile hamburger menu toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors duration-200 focus:outline-none cursor-pointer"
                  aria-label="Toggle Navigation Menu"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {isMobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Panel (Logged Out Only) */}
      {isMobileMenuOpen && !user && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-900 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-4 shadow-2xl animate-fade-in">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-2.5 rounded-lg text-base font-semibold text-slate-655 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors duration-150"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-900 flex flex-col gap-2 px-3">
            <Link
              to="login"
              className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-355 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-150"
            >
              Sign In
            </Link>
            <Link
              to="register"
              className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-md transition-all duration-150"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
