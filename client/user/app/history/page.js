"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/attempts/my",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load history");
          return;
        }

        setAttempts(data);
      } catch (error) {
        console.error(error);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-500">Loading history...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div>
          <h1 className="text-3xl font-bold text-black">
            Attempt History
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View your previous test attempts and performance.
          </p>
        </div>

        {attempts.length === 0 ? (
          <div className="mt-10 rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">
              You have not attempted any tests yet.
            </p>

            <Link
              href="/"
              className="mt-4 inline-block rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
            >
              Browse Tests
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {attempts.map((attempt) => (
              <div
                key={attempt.attemptId}
                className="rounded-xl border border-gray-200 p-6"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-black">
                      {attempt.test?.title || "Test"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {attempt.test?.category || "General"}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      {attempt.completedAt
                        ? new Date(
                            attempt.completedAt
                          ).toLocaleString()
                        : "In progress"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-gray-500">
                        Score
                      </p>

                      <p className="mt-1 font-semibold text-black">
                        {attempt.score}/{attempt.maximumMarks}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Percentage
                      </p>

                      <p className="mt-1 font-semibold text-black">
                        {attempt.percentage}%
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">
                        Status
                      </p>

                      <p className="mt-1 font-semibold capitalize text-black">
                        {attempt.status}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-gray-100 pt-5">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/history/${attempt.attemptId}`
                      )
                    }
                    className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
                  >
                    View Attempt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}