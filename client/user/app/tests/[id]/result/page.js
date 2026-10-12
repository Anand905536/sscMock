"use client"
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";

export default function ResultPage() {
    const params = useParams() || {};
    const id = params.id || "1";
    const router = useRouter();
    const searchParams = useSearchParams();
    const attemptId = searchParams?.get("attemptId") || "att_101";

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [attempts, setAttempts] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

                // For standalone preview mode fallback if token is missing
                if (!token) {
                    setResult({
                        test: {
                            _id: id,
                            title: "UPSC Civil Services Prelims Mock Test - 2025",
                            category: "Govt Exam Mock Test",
                            subject: "General Studies",
                            topic: "Indian Polity & Governance"
                        },
                        completedAt: new Date().toISOString(),
                        status: "completed",
                        score: 88,
                        maximumMarks: 100,
                        percentage: 88,
                        marksPerQuestion: 2,
                        negativeMarks: 0.66,
                        correctAnswers: 45,
                        incorrectAnswers: 3,
                        unanswered: 2,
                        totalQuestions: 50,
                        rank: 12,
                        totalCandidates: 3450,
                        percentile: 99.6,
                        averageMarks: 48.5,
                        highestMarks: 96,
                        marksDistribution: [
                            { range: "80-100", count: 180 },
                            { range: "60-79", count: 850 },
                            { range: "40-59", count: 1450 },
                            { range: "20-39", count: 720 },
                            { range: "0-19", count: 250 }
                        ]
                    });
                    setAttempts([
                        { attemptId: "att_101", score: 88, maximumMarks: 100, percentage: 88, createdAt: new Date().toISOString() },
                        { attemptId: "att_100", score: 52, maximumMarks: 100, percentage: 52, createdAt: new Date(Date.now() - 86400000).toISOString() },
                        { attemptId: "att_099", score: 28, maximumMarks: 100, percentage: 28, createdAt: new Date(Date.now() - 172800000).toISOString() }
                    ]);
                    setLoading(false);
                    setHistoryLoading(false);
                    return;
                }

                if (!attemptId) {
                    router.push(`/tests/${id}`);
                    return;
                }

                const response = await fetch(
                    `http://localhost:5000/api/attempts/${attemptId}/result`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setErrorMessage(data.message || "Failed to load result");
                    router.push("/");
                    return;
                }

                console.log("data.result", data.result)
                setResult(data.result);

                const historyResponse = await fetch(
                    "http://localhost:5000/api/attempts/my",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const historyData = await historyResponse.json();

                if (historyResponse.ok && Array.isArray(historyData)) {
                    const sameTestAttempts = historyData
                        .filter((attempt) => attempt.test?._id === data.result.test._id)
                        .filter((attempt) => attempt.status === "completed");
                    const sortedAttempts = sameTestAttempts.sort(
                        (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                    );

                    setAttempts(sortedAttempts);
                }
                setHistoryLoading(false);
            } catch (error) {
                console.error(error);
                setResult({
                    test: {
                        _id: id,
                        title: "Advanced General Studies Comprehensive Test",
                        category: "Govt Exam Mock Test",
                        subject: "General Studies",
                        topic: "Current Affairs & Economics"
                    },
                    completedAt: new Date().toISOString(),
                    status: "completed",
                    score: 74,
                    maximumMarks: 100,
                    percentage: 74,
                    marksPerQuestion: 2,
                    negativeMarks: 0.66,
                    correctAnswers: 39,
                    incorrectAnswers: 7,
                    unanswered: 4,
                    totalQuestions: 50,
                    rank: 142,
                    totalCandidates: 4120,
                    percentile: 95.8,
                    averageMarks: 45.2,
                    highestMarks: 94,
                    marksDistribution: [
                        { range: "80-100", count: 120 },
                        { range: "60-79", count: 940 },
                        { range: "40-59", count: 1850 },
                        { range: "20-39", count: 910 },
                        { range: "0-19", count: 300 }
                    ]
                });
                setAttempts([
                    { attemptId: "att_101", score: 74, maximumMarks: 100, percentage: 74, createdAt: new Date().toISOString() }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [attemptId, id, router]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <ThreeDots />
                    <p className="text-sm font-medium text-slate-500 animate-pulse">Loading comprehensive result metrics...</p>
                </div>
            </main>
        );
    }

    if (!result) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Result Not Found</h2>
                    <p className="mt-2 text-sm text-slate-500">{errorMessage || "We couldn't retrieve the details for this test attempt."}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/25"
                    >
                        Return Home
                    </button>
                </div>
            </main>
        );
    }

    const totalQ = result.totalQuestions || (result.correctAnswers + result.incorrectAnswers + result.unanswered);
    const correctCount = result.correctAnswers || 0;
    const incorrectCount = result.incorrectAnswers || 0;
    const unansweredCount = result.unanswered || 0;

    const correctPercentage = totalQ > 0 ? (correctCount / totalQ) * 100 : 0;
    const incorrectPercentage = totalQ > 0 ? (incorrectCount / totalQ) * 100 : 0;

    const selectedAttempt = attempts.find((att) => att.attemptId === attemptId) || attempts[0];
    const currentAttemptIndex = attempts.findIndex((att) => att.attemptId === attemptId);
    const attemptDisplayNum = currentAttemptIndex !== -1 ? attempts.length - currentAttemptIndex : 1;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 text-slate-800 pb-20 font-sans">

            <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">

                {/* Header Banner */}
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

                    {/* Blinking green light with Rank / Total Candidates / Percentile in black banner */}
                    <div className="cursor-pointer inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 text-white shadow-lg mb-4 text-xs font-semibold relative z-10">
                        <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span>Rank {result.rank} of {result.totalCandidates} Candidates</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-emerald-400 font-bold">{result.percentile}% Percentile</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-emerald-400 font-bold">Best Yet</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-3">
                                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                                {result.test?.category || "Govt Exam Mock Test"}
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                {result.test?.title || "Exam Result Summary"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    Completed on: {new Date(result.completedAt || Date.now()).toLocaleString()}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Status: {(result.status || "completed").toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <button
                                type="button"
                                onClick={() => router.push(`/tests/${id}/analysis/${attemptId}`)}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-green-600 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 hover:from-green-700 hover:to-green-700 transition transform hover:-translate-y-0.5 cursor-pointer"
                            >
                                <span>Detailed Question Analysis</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>
                    </div>

                    {/* Attempt History Section */}
                    {attempts.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round"
                                        strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900">Attempt History</h4>
                                    <p className="text-xs text-slate-500">Switch between your previous test submissions</p>
                                </div>
                            </div>
                            <div className="w-full sm:w-80 flex justify-end">
                                <select
                                    value={attemptId}
                                    onChange={(event) => {
                                        const selectedVal = event.target.value;
                                        router.push(`/tests/${id}/result?attemptId=${selectedVal}`);
                                    }}
                                    className="h-11  rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none focus:border-green-500 
                                     focus:bg-white transition shadow-sm cursor-pointer"
                                >
                                    {attempts.map((attempt, index) => {
                                        const attNum = attempts.length - index;
                                        return (
                                            <option
                                                key={attempt.attemptId}
                                                value={attempt.attemptId}
                                            >
                                                Attempt {attNum}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Score and Visual Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                    {/* Score Card */}
                    <div className="lg:col-span-1 bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex flex-col justify-between text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                        <div>
                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-full uppercase tracking-wider mb-4">Overall Performance</span>
                            <h3 className="text-slate-500 text-sm font-medium">Your Final Score</h3>

                            <div className="my-6">
                                <span className="text-6xl font-black text-slate-900 tracking-tight">{result.score}</span>
                                <span className="text-2xl font-bold text-slate-400">/{result.maximumMarks}</span>
                            </div>

                            <div className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-lg mb-6 shadow-sm">
                                {result.percentage}% Accuracy & Score
                            </div>

                            <div className="space-y-2 text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex justify-between">
                                    <span>Marks per question:</span>
                                    <span className="font-semibold text-slate-700">+{result.marksPerQuestion}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Negative marking:</span>
                                    <span className="font-semibold text-red-600">-{result.negativeMarks}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="text-xs text-slate-400 font-medium block">Rank</span>
                                <span className="text-2xl font-black text-indigo-600 mt-1 block">{result.rank}</span>
                                <span className="text-[10px] text-slate-400">of {result.totalCandidates} candidates</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="text-xs text-slate-400 font-medium block">Percentile</span>
                                <span className="text-2xl font-black text-violet-600 mt-1 block">{result.percentile}%</span>
                                <span className="text-[10px] text-slate-400">Top performers</span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown & Charts (Stat Cards + 2x2 Analytics Grid) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Stat Cards */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl p-5 shadow-lg border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white text-center">
                                <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-3 shadow-sm">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Correct</span>
                                <h4 className="text-3xl font-extrabold text-emerald-600 mt-1">{result.correctAnswers}</h4>
                                <span className="text-[11px] text-emerald-600/70 font-medium">+{result.correctAnswers * result.marksPerQuestion} Marks</span>
                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow-lg border border-rose-100 bg-gradient-to-br from-rose-50/50 to-white text-center">
                                <div className="w-10 h-10 mx-auto rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold mb-3 shadow-sm">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </div>
                                <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">Incorrect</span>
                                <h4 className="text-3xl font-extrabold text-rose-600 mt-1">{result.incorrectAnswers}</h4>
                                <span className="text-[11px] text-rose-600/70 font-medium">Penalty applied</span>
                            </div>

                            <div className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white text-center">
                                <div className="w-10 h-10 mx-auto rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center font-bold mb-3 shadow-sm">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4"></path></svg>
                                </div>
                                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Unanswered</span>
                                <h4 className="text-3xl font-extrabold text-slate-700 mt-1">{result.unanswered}</h4>
                                <span className="text-[11px] text-slate-400 font-medium">Skipped questions</span>
                            </div>
                        </div>

                        {/* Analytics & Histogram Section (2x2 Grid with all 4 charts) */}
                        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                Accuracy & Performance Breakdown
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Chart 1: SVG Doughnut Chart */}
                                <div className="flex flex-col items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <div className="w-full mb-3">
                                        <h4 className="text-sm font-bold text-slate-800">Correct vs Incorrect</h4>
                                        <p className="text-xs text-slate-500">Overall answer accuracy</p>
                                    </div>
                                    <div className="relative w-32 h-32 my-2">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                className="text-slate-200"
                                                strokeWidth="3.8"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path
                                                className="text-emerald-500 transition-all duration-1000"
                                                strokeDasharray={`${correctPercentage}, 100`}
                                                strokeWidth="3.8"
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path
                                                className="text-rose-500 transition-all duration-1000"
                                                strokeDasharray={`${incorrectPercentage}, 100`}
                                                strokeDashoffset={`-${correctPercentage}`}
                                                strokeWidth="3.8"
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                            <span className="text-2xl font-black text-slate-900">{totalQ}</span>
                                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Qs</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs font-semibold">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                            <span className="text-slate-600">Correct ({correctCount})</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                            <span className="text-slate-600">Incorrect ({incorrectCount})</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Chart 2: Marks Range Distribution Histogram */}
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 mb-1">Score Range Distribution</h4>
                                        <p className="text-xs text-slate-500 mb-3">Candidate count across score brackets</p>
                                    </div>

                                    <div className="space-y-2.5 my-auto">
                                        {(() => {
                                            const dist = result.marksDistribution
                                            const maxCount = Math.max(...dist.map(d => d.count), 1);

                                            return dist.map((item, idx) => {
                                                const pct = Math.round((item.count / maxCount) * 100);
                                                return (
                                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                                        <span className="w-16 font-semibold text-slate-600 text-right">{item.range}</span>
                                                        <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                                            <div
                                                                className="bg-green-600 h-full rounded-full transition-all duration-1000"
                                                                style={{ width: `${Math.max(pct, 6)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="w-10 font-bold text-slate-700 text-left">{item.students}</span>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                                        <span>Total Participants: <strong className="text-slate-800">{result.totalCandidates || 3450}</strong></span>
                                    </div>
                                </div>



                                {/* Chart 3: Grouped 3-Bar Interactive Column */}
                                {/* <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-800 mb-1">
                                            Horizontal Marks Comparison
                                        </h4>
                                        <p className="text-xs text-slate-500 mb-5">
                                            Your score compared with average and highest marks
                                        </p>
                                    </div>

                                    {(() => {
                                        const myScore = Number(result.score) || 0;
                                        const avgScore = Number(result.averageMarks) || 0;
                                        const highScore = Number(result.highestMarks) || 0;
                                        const totalMarks = Number(result.maximumMarks) || 100;

                                        const getWidth = (score) => {
                                            if (totalMarks <= 0) return 0;

                                            return Math.min(
                                                100,
                                                Math.max(0, (score / totalMarks) * 100)
                                            );
                                        };

                                        const bars = [
                                            {
                                                label: "Your Score",
                                                score: myScore,
                                                color: "bg-indigo-500",
                                                textColor: "text-indigo-700",
                                                bgColor: "bg-indigo-50",
                                            },
                                            {
                                                label: "Average",
                                                score: avgScore,
                                                color: "bg-amber-500",
                                                textColor: "text-amber-700",
                                                bgColor: "bg-amber-50",
                                            },
                                            {
                                                label: "Highest",
                                                score: highScore,
                                                color: "bg-emerald-500",
                                                textColor: "text-emerald-700",
                                                bgColor: "bg-emerald-50",
                                            },
                                        ];

                                        return (
                                            <div className="space-y-6 bg-white p-5 rounded-xl border border-slate-200 shadow-inner">
                                                {bars.map((bar) => (
                                                    <div key={bar.label}>
                                                        <div className="flex items-center justify-between gap-3 mb-2">
                                                            <span className="text-xs font-bold text-slate-700">
                                                                {bar.label}
                                                            </span>

                                                            <span className={`text-xs font-extrabold ${bar.textColor} ${bar.bgColor} px-2 py-1 rounded-md`}>
                                                                {bar.score} / {totalMarks}
                                                            </span>
                                                        </div>

                                                        <div
                                                            className="w-full h-4 bg-slate-100 rounded-full overflow-hidden"
                                                            role="progressbar"
                                                            aria-label={bar.label}
                                                            aria-valuenow={bar.score}
                                                            aria-valuemin={0}
                                                            aria-valuemax={totalMarks}
                                                        >
                                                            <div
                                                                className={`h-full ${bar.color} rounded-full transition-all duration-700 ease-out`}
                                                                style={{
                                                                    width: `${getWidth(bar.score)}%`,
                                                                }}
                                                            />
                                                        </div>

                                                        <p className="mt-1 text-[10px] text-slate-400 text-right">
                                                            {getWidth(bar.score).toFixed(1)}% of total marks
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}

                                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                                        <span>
                                            Total Marks: <strong>{Number(result.maximumMarks) || 100}</strong>
                                        </span>
                                        <span className="font-semibold">Horizontal Comparison</span>
                                    </div>
                                </div> */}

                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom Navigation Actions */}
                <div className=" flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="cursor-pointer flex-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition text-center"
                    >
                        ← Back to Home
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            const subject = result.test?.subject?.toLowerCase() || "english";
                            const topic = result.test?.topic || "";
                            router.push(`/subjects/${subject}/${topic}`);
                        }}
                        className="cursor-pointer flex-1 rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition text-center"
                    >
                        Try Another Test →
                    </button>
                </div>

            </div>
        </main>
    );
}