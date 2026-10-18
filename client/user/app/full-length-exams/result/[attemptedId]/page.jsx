"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";
import { Award, BarChart2, CheckCircle2, ChevronRight, Clock, HelpCircle, ShieldCheck, Sparkles, XCircle, Home, ArrowLeft } from "lucide-react";

const API_BASE = "http://localhost:5000/api/full-length-exams";

export default function FullLengthExamResultPage() {
    const params = useParams();
    const router = useRouter();

    const routeAttemptId = Array.isArray(params.attemptedId)
        ? params.attemptedId[0]
        : params.attemptedId;

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


                const requestedAttempt = routeAttemptId
                    ? completedAttempts.find(
                        (item) =>
                            String(item._id) === String(routeAttemptId)
                    )
                    : null;

                if (requestedAttempt) {
                    setSelectedAttemptId(String(requestedAttempt._id));
                } else {
                    setSelectedAttemptId("");
                    setResult(null);
                    setError(
                        routeAttemptId
                            ? "The requested attempt was not found in your completed attempts."
                            : "No attempt ID was provided in the result URL."
                    );
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
            <main className="flex min-h-screen items-center justify-center bg-slate-50">
                <ThreeDots color="#059669" height={80} width={80} />
            </main>
        );
    }

    if (historyError) {
        return (
            <main className="mx-auto max-w-xl space-y-4 p-8 pt-20 text-center">
                <h1 className="text-2xl font-extrabold text-slate-800">
                    Could not load attempts
                </h1>
                <p className="text-sm text-rose-600">{historyError}</p>
                <button
                    onClick={() => router.push("/full-length-exams")}
                    className="mt-4 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                    Back to Exams
                </button>
            </main>
        );
    }

    return (
        <main className="min-h-screen space-y-6 bg-slate-50/60 p-4 sm:p-8 pb-16">
            <div className="mx-auto max-w-5xl space-y-6">

                {/* Header Banner */}
                <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white shadow-lg sm:p-8">
                    <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-emerald-200 border border-emerald-400/30">
                                <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" /> Full-Length Mock Test
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                Exam Performance Result
                            </h1>
                            <p className="text-emerald-100/90 text-sm">
                                View your score, answers, explanations, and performance compared with other candidates.
                            </p>
                            {result && (
                                <p className="pt-2 text-xs font-bold text-emerald-200 tracking-wide uppercase">
                                    {result.examTitle} &bull; {result.category}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            disabled={!result || resultLoading || !selectedAttemptId}
                            onClick={() => {
                                router.push(
                                    `/full-length-exams/result/${selectedAttemptId}/analysis`
                                );
                            }}
                            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-bold text-emerald-800 shadow-md hover:bg-emerald-50 transition disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                        >
                            <span>View Detailed Analysis</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Attempt Dropdown Selector */}
                <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2">
                    <label
                        htmlFor="attempt-history"
                        className="cursor-pointer block text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                        Previous Attempts ({examAttempts.length})
                    </label>

                    <select
                        id="attempt-history"
                        value={selectedAttemptId}
                        onChange={(event) =>
                            setSelectedAttemptId(event.target.value)
                        }
                        className="cursor-pointer w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3.5 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition"
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
                    <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-12">
                        <ThreeDots color="#059669" height={60} width={60} />
                    </div>
                )}

                {error && !resultLoading && (
                    <section className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-sm">
                        <p className="text-sm font-semibold text-rose-700">
                            {error}
                        </p>
                    </section>
                )}

                {result && !resultLoading && !error && (
                    <>
                        {/* Overall Metrics Grid */}
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
                                color="text-emerald-600"
                                className="cursor-pointer"
                            />
                            <StatCard
                                label="Wrong"
                                value={result.wrongAnswers}
                                color="text-rose-600"
                                className="cursor-pointer"
                            />
                            <StatCard
                                label="Accuracy"
                                value={`${result.accuracy}%`}
                                className="cursor-pointer"
                            />
                        </section>

                        {/* Percentage Bar Card */}
                        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                                    Overall Percentage Breakdown
                                </h2>
                                <span className="text-2xl font-extrabold text-emerald-600">
                                    {result.percentage}%
                                </span>
                            </div>

                            <div className="h-3.5 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            Math.max(0, result.percentage)
                                        )}%`,
                                    }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                                Percentile is compared against{" "}
                                <strong className="text-slate-700">{result.percentileComparedCandidates}</strong> other
                                candidates for this exam.
                            </p>
                        </section>
                    </>
                )}

                {/* Footer Navigation */}
                <footer className="flex flex-wrap gap-4 pt-2">
                    <button
                        onClick={() => {
                            const exam = selectedHistoryAttempt?.exam;

                            const category = exam?.category;
                            const examSlug = exam?.exam;
                            console.log("category", "examSlug")
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
                        className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 font-bold text-white shadow-md transition hover:bg-emerald-700"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Exams
                    </button>

                    <button
                        onClick={() => router.push("/")}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                    >
                        <Home className="w-4 h-4" /> Home
                    </button>
                </footer>
            </div>
        </main>
    );
}

function StatCard({
    label,
    value,
    color = "text-slate-900",
    highlight = false,
    className = "",
}) {
    return (
        <div
            className={`rounded-2xl border p-5 shadow-sm transition ${highlight
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-slate-200/80 bg-white"
                } ${className}`}
        >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {label}
            </p>
            <p className={`mt-2 break-words text-2xl font-extrabold ${color}`}>
                {value ?? "—"}
            </p>
        </div>
    );
}
