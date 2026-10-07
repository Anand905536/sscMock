"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

import { apiRequest } from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (data.user.role !== "admin") {
        setError("You do not have admin access.");
        return;
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem(
        "adminUser",
        JSON.stringify(data.user)
      );

      router.push("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#2a2a2a] bg-[#141414]">
            <ShieldCheck className="h-7 w-7 text-[#f5f5f5]" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            sscMock
          </h1>

          <p className="mt-2 text-sm text-[#a3a3a3]">
            Admin Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#292929] bg-[#141414] p-7 shadow-2xl sm:p-8">
          <div className="mb-7">
            <h2 className="text-xl font-semibold">
              Welcome back
            </h2>

            <p className="mt-1.5 text-sm text-[#a3a3a3]">
              Sign in to manage your SSC mock test platform.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-[#d4d4d4]"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your admin email"
                required
                className="h-11 w-full rounded-lg border border-[#303030] bg-[#0d0d0d] px-3.5 text-sm text-[#f5f5f5] outline-none placeholder:text-[#666] transition focus:border-[#737373] focus:ring-1 focus:ring-[#737373]"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-[#d4d4d4]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-11 w-full rounded-lg border border-[#303030] bg-[#0d0d0d] px-3.5 pr-11 text-sm text-[#f5f5f5] outline-none placeholder:text-[#666] transition focus:border-[#737373] focus:ring-1 focus:ring-[#737373]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777] transition hover:text-[#f5f5f5]"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-3.5 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-[#f5f5f5] text-sm font-semibold text-[#0a0a0a] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[#666]">
          Authorized administrators only
        </p>
      </div>
    </main>
  );
}