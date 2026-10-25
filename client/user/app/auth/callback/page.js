
"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

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
    <main className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-black">
          Signing you in...
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Please wait a moment.
        </p>
      </div>
    </main>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          Signing you in...
        </main>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  );
}
