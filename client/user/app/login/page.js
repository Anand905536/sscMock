"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest, GOOGLE_LOGIN_URL } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify(form),
            });

            // Keep existing token and user storage
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            router.push("/");
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950 px-6 transition-colors duration-300">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 shadow-sm dark:shadow-zinc-950/40">
                <div className="mb-8 text-center">
                    <Link
                        href="/"
                        className="text-2xl font-extrabold tracking-tight text-black dark:text-white"
                    >
                        SubjectWise
                    </Link>

                    <h1 className="mt-6 text-2xl font-bold text-black dark:text-white">
                        Welcome back
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                        Login to continue your preparation.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 dark:border-rose-900/50 bg-red-50 dark:bg-rose-950/30 p-3.5 text-sm text-red-600 dark:text-rose-400">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                            className="h-11 w-full rounded-xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 text-sm text-black dark:text-white outline-none focus:border-emerald-500 transition"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-zinc-300"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                            className="h-11 w-full rounded-xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 text-sm text-black dark:text-white outline-none focus:border-emerald-500 transition"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="cursor-pointer h-11 w-full rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-all"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200 dark:bg-zinc-800" />
                    <span className="text-xs text-gray-400 dark:text-zinc-500">OR</span>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-zinc-800" />
                </div>

                {/* Google OAuth redirect remains unchanged */}
                <button
                    type="button"
                    onClick={() => {
                        window.location.href = GOOGLE_LOGIN_URL;
                    }}
                    className="cursor-pointer h-11 w-full rounded-xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-800 text-sm font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                >
                    Continue with Google
                </button>

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-zinc-400">
                    Don't have an account?{" "}
                    <Link
                        href="/signup"
                        className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </div>
        </main>
    );
}