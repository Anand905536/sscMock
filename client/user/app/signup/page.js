"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
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

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "http://localhost:5000/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        password: form.password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            /*
             * Current backend registration response does not return
             * a JWT token, so send the user to login after signup.
             */
            router.push("/login");
        } catch (err) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <Link
                        href="/"
                        className="text-2xl font-bold tracking-tight text-black"
                    >
                        sscMock
                    </Link>

                    <h1 className="mt-6 text-2xl font-bold text-black">
                        Create your account
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Start your preparation with sscMock.
                    </p>
                </div>

                {error && (
                    <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-black"
                            placeholder="Your name"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-gray-700"
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
                            className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-black"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium text-gray-700"
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
                            className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-black"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="mb-2 block text-sm font-medium text-gray-700"
                        >
                            Confirm Password
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-black"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-11 w-full rounded-md bg-black text-sm font-medium text-white disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs text-gray-400">OR</span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                <button
                    type="button"
                    onClick={() => {
                        window.location.href =
                            "http://localhost:5000/api/auth/google";
                    }}
                    className="h-11 w-full rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700"
                >
                    Continue with Google
                </button>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-black hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </main>
    );
}