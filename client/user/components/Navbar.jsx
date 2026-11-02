"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import {
  LogOut,
  UserCircle,
  ChevronDown,
  Menu,
  X,
  Sun,
  Moon
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

export default function Navbar() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTestsOpen, setIsTestsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { darkMode, isThemeReady, toggleDarkMode } = useTheme();

  useEffect(() => {
    setIsMounted(true);

    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  useEffect(() => {
    setIsTestsOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsMobileMenuOpen(false);

    window.location.href = "/";
  };

  const getProfilePicture = () => {
    if (!currentUser?.profilePicture) return null;

    return currentUser.profilePicture.startsWith("http")
      ? currentUser.profilePicture
      : `${BACKEND_URL}${currentUser.profilePicture}`;
  };

  const homeActive = isMounted && pathname === "/";
  const pdfActive = isMounted && pathname.startsWith("/various-pdf");

  if (!isThemeReady) {
    return (
      <nav className="relative z-50 min-h-16 bg-[var(--app-background)]" />
    );
  }

  return (
    <nav className={`relative z-50 transition-colors duration-300 ${darkMode ? "bg-zinc-900 text-zinc-100" : "border-b border-gray-200 bg-white text-gray-900"
      }`}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className={`shrink-0 text-lg font-bold tracking-tight sm:text-xl ${darkMode ? "text-white" : "text-black"}`}
        >
          Subject Wise
        </Link>

        {/* Desktop navigation */}
        <div className="absolute left-1/2 hidden h-16 -translate-x-1/2 items-center gap-8 md:flex">
          <Link
            href="/"
            className={`flex h-full items-center border-b-2 px-2 text-sm font-medium transition ${homeActive
              ? "border-emerald-500 text-emerald-400 font-semibold"
              : darkMode
                ? "border-transparent text-zinc-300 hover:text-emerald-400"
                : "border-transparent text-gray-700 hover:text-green-700"
              }`}
          >
            Home
          </Link>

          <Link
            href="/various-pdf"
            className={`flex h-full items-center border-b-2 px-2 text-sm font-medium transition ${pdfActive
              ? "border-emerald-500 text-emerald-400 font-semibold"
              : darkMode
                ? "border-transparent text-zinc-300 hover:text-emerald-400"
                : "border-transparent text-gray-700 hover:text-green-700"
              }`}
          >
            PDFs
          </Link>
        </div>

        {/* Desktop account controls */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleDarkMode}
            className={`cursor-pointer flex items-center justify-center h-9 w-9 rounded-lg transition-all ${darkMode
                ? "bg-zinc-800 text-amber-400 hover:bg-zinc-700"
                : "border border-gray-300 bg-white text-slate-700 hover:bg-gray-100 shadow-xs"
              }`}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition ${darkMode ? "text-zinc-200 hover:bg-zinc-800" : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {getProfilePicture() ? (
                  <img
                    src={getProfilePicture()}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-8 w-8" />
                )}
                <span>{currentUser?.name || "My Profile"}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="cursor-pointer flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          className={`flex h-10 w-10 items-center justify-center rounded-lg border md:hidden transition ${darkMode ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800" : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className={`px-4 py-3 shadow-md md:hidden transition-colors duration-300 ${darkMode ? "bg-zinc-900 text-zinc-100" : "border-t border-gray-200 bg-white text-gray-900"
          }`}>
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`rounded-lg px-4 py-3 text-sm font-medium transition ${homeActive
                ? darkMode ? "bg-emerald-500/15 text-emerald-400 font-semibold" : "bg-green-50 text-green-700"
                : darkMode ? "text-zinc-300 hover:bg-zinc-800" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              Home
            </Link>

            <Link
              href="/various-pdf"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`rounded-lg px-4 py-3 text-sm font-medium transition ${pdfActive
                ? darkMode ? "bg-emerald-500/15 text-emerald-400 font-semibold" : "bg-green-50 text-green-700"
                : darkMode ? "text-zinc-300 hover:bg-zinc-800" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              PDFs
            </Link>

            <div className={`my-2 border-t ${darkMode ? "border-zinc-800" : "border-gray-100"}`} />

            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs font-semibold opacity-70">Theme Mode</span>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`cursor-pointer flex items-center justify-center h-9 w-9 rounded-lg transition-all ${darkMode
                    ? "bg-zinc-800 text-amber-400 hover:bg-zinc-700"
                    : "border border-gray-300 bg-white text-slate-700 hover:bg-gray-100 shadow-xs"
                  }`}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            <div className={`my-2 border-t ${darkMode ? "border-zinc-800" : "border-gray-100"}`} />

            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${darkMode ? "text-zinc-200 hover:bg-zinc-800" : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {getProfilePicture() ? (
                    <img
                      src={getProfilePicture()}
                      alt="Profile"
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="h-9 w-9" />
                  )}
                  {currentUser?.name || "My Profile"}
                </Link>

                <button
                  onClick={handleLogout}
                  className={`cursor-pointer flex items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-medium transition ${darkMode ? "text-rose-400 hover:bg-rose-500/10" : "text-red-600 hover:bg-red-50"
                    }`}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-green-700 transition"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}