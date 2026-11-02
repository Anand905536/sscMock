"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";

function GoogleCallbackContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");

    if (!token || !user) {
      window.location.replace("/login?error=google_login_failed");
      return;
    }

    try {
      const userData = JSON.parse(user);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      window.location.replace("/");
    } catch (error) {
      console.error("Google callback error:", error);
      window.location.replace("/login?error=google_login_failed");
    }
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white selection:bg-emerald-500 selection:text-white">
      <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-zinc-900/85 border border-zinc-800/80 shadow-2xl shadow-zinc-950/50 backdrop-blur-md">
        <div className="mb-4">
          <ThreeDots color="#10b981" height={50} width={50} />
        </div>
        <h1 className="text-lg font-bold tracking-tight text-white">
          Signing you in...
        </h1>
        <p className="mt-1.5 text-xs font-medium text-zinc-400">
          Please wait a moment while we set up your session.
        </p>
      </div>
    </main>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
          <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-zinc-900/85 border border-zinc-800/80 shadow-2xl">
            <ThreeDots color="#10b981" height={50} width={50} />
            <h1 className="mt-4 text-sm font-semibold text-zinc-300">
              Loading Google Sign-In...
            </h1>
          </div>
        </main>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}