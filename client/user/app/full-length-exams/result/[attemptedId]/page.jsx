
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";

const API_BASE = "http://localhost:5000/api/full-length-exams";

export default function FullLengthExamResultPage() {
    const params = useParams();
    const router = useRouter();

    const routeAttemptId = Array.isArray(params.attemptId)
        ? params.attemptId[0]
        : params.attemptId;

    const [attempts, setAttempts] = useState([]);
    const [selectedAttemptId, setSelectedAttemptId] = useState(
        String(routeAttemptId || "")
    );
    const [result, setResult] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [resultLoading, setResultLoading] = useState(false);
    const [error, setError] = useState("");
    const [historyError, setHistoryError] = useState("");

    // Fetch attempt history.
    useEffect(() => {
        let cancelled = false;

        async function loadHistory() {
            try {
                setHistoryLoading(true);
                setHistoryError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                const response = await fetch(
                    `${API_BASE}/previous`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok || data.success === false) {
                    throw new Error(
                        data.message || "Failed to load attempts."
                    );
                }

                const completedAttempts = (data.attempts || [])
                    .filter((item) => item.status === "completed")
                    .sort(
                        (a, b) =>
                            new Date(b.createdAt) -
                            new Date(a.createdAt)
                    );

                if (cancelled) return;

                setAttempts(completedAttempts);

                const requestedAttempt = completedAttempts.find(
                    (item) =>
                        String(item._id) === String(routeAttemptId)
                );

                const target = requestedAttempt || completedAttempts[0];

                if (target) {
                    setSelectedAttemptId(String(target._id));
                } else {
                    setError("No completed exam attempts found.");
                }
            } catch (err) {
                if (!cancelled) {
                    setHistoryError(
                        err.message || "Failed to load attempt history."
                    );
                }
            } finally {
                if (!cancelled) {
                    setHistoryLoading(false);
                }
            }
        }

        loadHistory();

        return () => {
            cancelled = true;
        };
    }, [routeAttemptId, router]);

    const selectedHistoryAttempt = useMemo(
        () =>
            attempts.find(
                (item) =>
                    String(item._id) === String(selectedAttemptId)
            ) || null,
        [attempts, selectedAttemptId]
    );

    // Restrict the dropdown to the same exam as the selected attempt.
    const examAttempts = useMemo(() => {
        if (!selectedHistoryAttempt) return [];

        const selectedExamId =
            selectedHistoryAttempt.exam?._id ||
            selectedHistoryAttempt.exam;

        return attempts.filter((item) => {
            const itemExamId = item.exam?._id || item.exam;

            return String(itemExamId) === String(selectedExamId);
        });
    }, [attempts, selectedHistoryAttempt]);

    // Fetch complete result details whenever the selection changes.
    useEffect(() => {
        if (!selectedAttemptId) return;

        let cancelled = false;
        const controller = new AbortController();

        async function loadDetailedResult() {
            try {
                setResultLoading(true);
                setError("");
                setResult(null);

                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                const response = await fetch(
                    `${API_BASE}/attempts/${encodeURIComponent(
                        selectedAttemptId
                    )}/result`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                    }
                );

                const data = await response.json();

                if (!response.ok || data.success === false) {
                    throw new Error(
                        data.message || "Failed to load detailed result."
                    );
                }

                if (!cancelled) {
                    setResult(data.result);
                }
            } catch (err) {
                if (!cancelled && err.name !== "AbortError") {
                    setError(
                        err.message || "Could not load detailed result."
                    );
                }
            } finally {
                if (!cancelled) {
                    setResultLoading(false);
                }
            }
        }

        loadDetailedResult();

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [selectedAttemptId, router]);

    if (historyLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50">
                <ThreeDots color="#4f46e5" height={80} width={80} />
            </main>
        );
    }

    if (historyError) {
        return (
            <main className="mx-auto max-w-2xl space-y-4 p-8">
                <h1 className="text-2xl font-bold">
                    Could not load attempts
                </h1>
                <p className="text-red-600">{historyError}</p>
                <button
                    onClick={() => router.push("/full-length-exams")}
                    className="rounded-lg bg-indigo-600 px-5 py-3 text-white"
                >
                    Back to Exams
                </button>
            </main>
        );
    }

    return (
        <main className="min-h-screen space-y-6 bg-gray-50 p-4 sm:p-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <header className="rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow">
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                        Full-Length Mock Test
                    </p>

                    <h1 className="mt-2 text-3xl font-extrabold">
                        Exam Performance Result
                    </h1>

                    <p className="mt-2 text-indigo-100">
                        View your score, answers, explanations, and
                        performance compared with other candidates.
                    </p>

                    {result && (
                        <p className="mt-3 text-sm text-indigo-100">
                            {result.examTitle} · {result.category}
                        </p>
                    )}

                    <button
                        type="button"
                        disabled={!result || resultLoading || !selectedAttemptId}
                        onClick={() => {
                            router.push(
                                `/full-length-exams/result/${selectedAttemptId}/analysis`
                            );
                        }}
                        className="cursor-pointer mt-4 rounded-lg bg-white px-5 py-3
               font-bold text-indigo-700 shadow
               hover:bg-indigo-50 disabled:cursor-not-allowed
               disabled:opacity-50"
                    >
                        View Detailed Analysis →
                    </button>
                </header>

                {/* Attempt dropdown */}
                <section className="rounded-2xl border bg-white p-5 shadow-sm">
                    <label
                        htmlFor="attempt-history"
                        className="cursor-pointer mb-2 block font-bold text-gray-800"
                    >
                        Previous attempts ({examAttempts.length})
                    </label>

                    <select
                        id="attempt-history"
                        value={selectedAttemptId}
                        onChange={(event) =>
                            setSelectedAttemptId(event.target.value)
                        }
                        className="cursor-pointer w-full rounded-xl border border-gray-300 bg-gray-50 p-3.5 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                        {examAttempts.map((item, index) => (
                            <option key={item._id} value={item._id}>
                                {item.exam?.title || "Mock Test"}
                                {" — Attempt "}
                                {examAttempts.length - index}
                                {" — "}
                                {new Date(
                                    item.createdAt
                                ).toLocaleString()}
                                {" — Score: "}
                                {item.score ?? 0}
                            </option>
                        ))}
                    </select>
                </section>

                {resultLoading && (
                    <div className="flex justify-center rounded-xl border bg-white p-8">
                        <ThreeDots color="#4f46e5" height={60} width={60} />
                    </div>
                )}

                {error && !resultLoading && (
                    <section className="rounded-xl border border-red-200 bg-white p-5">
                        <p className="font-semibold text-red-600">
                            {error}
                        </p>
                    </section>
                )}

                {result && !resultLoading && !error && (
                    <>
                        {/* Overall metrics */}
                        <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            <StatCard
                                label="Score"
                                value={`${result.score} / ${result.totalMarks}`}
                                highlight
                                className="cursor-pointer"
                            />
                            <StatCard
                                label="Percentage"
                                value={`${result.percentage}%`}
                                className="cursor-pointer"
                            />
                            <StatCard
                                label="Percentile"
                                value={
                                    result.percentile == null
                                        ? "Not available"
                                        : `${result.percentile}%`
                                }
                                className="cursor-pointer"
                            />
                            <StatCard
                                label="Total Questions"
                                value={result.totalQuestions}
                                className="cursor-pointer"
                            />
                            <StatCard
                                label="Attempted"
                                value={result.attemptedQuestions}
                                className="cursor-pointer"
                            />
                            <StatCard
                                label="Unattempted"
                                value={result.unattemptedQuestions}
                                className="cursor-pointer"
                            />
                            <StatCard
                                label="Correct"
                                value={result.correctAnswers}
                                color="text-green-600"
                                className="cursor-pointer"
                            />
                            <StatCard
                                label="Wrong"
                                value={result.wrongAnswers}
                                color="text-red-600"
                                className="cursor-pointer"
                            />
                            <StatCard
                                label="Accuracy"
                                value={`${result.accuracy}%`}
                                className="cursor-pointer"
                            />
                        </section>

                        <section className="rounded-2xl border bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="font-bold text-gray-800">
                                    Percentage
                                </h2>
                                <span className="text-xl font-extrabold text-indigo-600">
                                    {result.percentage}%
                                </span>
                            </div>

                            <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-100">
                                <div
                                    className="h-full rounded-full bg-indigo-600 transition-all"
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            Math.max(0, result.percentage)
                                        )}%`,
                                    }}
                                />
                            </div>

                            <p className="mt-3 text-sm text-gray-500">
                                Percentile is compared against{" "}
                                {result.percentileComparedCandidates} other
                                candidates for this exam.
                            </p>
                        </section>





                    </>
                )}

                <footer className="flex flex-wrap gap-3">


                    <button
                        onClick={() => {
                            const exam = selectedHistoryAttempt?.exam;

                            const category = exam?.category;
                            const examSlug = exam?.exam;

                            if (category && examSlug) {
                                router.push(
                                    `/tests/exam/${encodeURIComponent(
                                        String(category).trim().toLowerCase()
                                    )}/${encodeURIComponent(
                                        String(examSlug).trim().toLowerCase()
                                    )}`
                                );
                            } else {
                                router.push("/full-length-exams");
                            }
                        }}
                        className="cursor-pointer rounded-xl bg-indigo-600 px-6 py-3.5 font-bold text-white shadow-md transition hover:bg-indigo-700"
                    >
                        Back to Exams
                    </button>


                    <button
                        onClick={() => router.push("/")}
                        className="cursor-pointer rounded-xl border bg-white px-6 py-3 font-bold text-gray-700"
                    >
                        Home
                    </button>
                </footer>
            </div>
        </main>
    );
}

function StatCard({
    label,
    value,
    color = "text-gray-900",
    highlight = false,
    className = "",

}) {
    return (
        <div
            className={`rounded-2xl border p-5 shadow-md ${highlight
                ? "border-indigo-200 bg-indigo-50"
                : "border-gray-100 bg-white"
                } ${className}`}
        >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {label}
            </p>
            <p className={`mt-2 break-words text-2xl font-extrabold ${color}`}>
                {value ?? "—"}
            </p>
        </div>
    );
}
