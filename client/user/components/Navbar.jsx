
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LogOut,
  UserCircle,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

const testLinks = [
  { label: "SSC Exams", href: "/tests/category/ssc" },
  { label: "Banking Exams", href: "/tests/category/banking" },
  { label: "Railway Exams", href: "/tests/category/railway" },
  { label: "Other Exams", href: "/tests/category/other" },
];

export default function Navbar() {
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isTestsOpen, setIsTestsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const testsActive = isMounted && pathname.startsWith("/tests");

  return (
    <nav className="relative z-50 border-b border-gray-200 bg-white">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-lg font-bold tracking-tight text-black sm:text-xl"
        >
          Subject Wise
        </Link>

        {/* Desktop navigation */}
        <div className="absolute left-1/2 hidden h-16 -translate-x-1/2 items-center gap-8 md:flex">
          <Link
            href="/"
            className={`flex h-full items-center border-b-2 px-2 text-sm font-medium transition ${
              homeActive
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-700 hover:text-green-700"
            }`}
          >
            Home
          </Link>

          <Link
            href="/various-pdf"
            className={`flex h-full items-center border-b-2 px-2 text-sm font-medium transition ${
              pdfActive
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-700 hover:text-green-700"
            }`}
          >
            PDFs
          </Link>

          <div
            className="relative flex h-full items-center"
            onMouseEnter={() => setIsTestsOpen(true)}
            onMouseLeave={() => setIsTestsOpen(false)}
          >
            <button
              type="button"
              onClick={() => setIsTestsOpen((open) => !open)}
              aria-expanded={isTestsOpen}
              aria-haspopup="true"
              className={`flex h-full items-center gap-1 border-b-2 px-2 text-sm font-medium transition ${
                testsActive
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-700 hover:text-green-700"
              }`}
            >
              Tests
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isTestsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isTestsOpen && (
              <div className="absolute left-0 top-full w-52 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                {testLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsTestsOpen(false)}
                    className="block px-4 py-2 text-sm text-gray-700 transition hover:bg-green-50 hover:text-green-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop account controls */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                className="flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
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
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 md:hidden"
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
        <div className="border-t border-gray-200 bg-white px-4 py-3 shadow-md md:hidden">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`rounded-lg px-4 py-3 text-sm font-medium ${
                homeActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Home
            </Link>

            <Link
              href="/various-pdf"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`rounded-lg px-4 py-3 text-sm font-medium ${
                pdfActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              PDFs
            </Link>

            <button
              type="button"
              onClick={() => setIsTestsOpen((open) => !open)}
              aria-expanded={isTestsOpen}
              className={`flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium ${
                testsActive
                  ? "bg-green-50 text-green-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Tests
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  isTestsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isTestsOpen && (
              <div className="ml-3 border-l-2 border-green-100 pl-3">
                {testLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setIsTestsOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-green-50 hover:text-green-700"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

            <div className="my-2 border-t border-gray-100" />

            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-green-700"
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
