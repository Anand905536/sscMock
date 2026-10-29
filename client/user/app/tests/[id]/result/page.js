"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";
import {
    Award,
    CheckCircle2,
    ChevronRight,
    Clock,
    HelpCircle,
    XCircle,
    ArrowLeft,
    RotateCcw,
    Zap,
    Target,
    Activity,
    Trophy,
    Percent
} from "lucide-react";
import { apiRequest } from "@/lib/api";


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
                            { range: "80-100", count: 180, students: 180 },
                            { range: "60-79", count: 850, students: 850 },
                            { range: "40-59", count: 1450, students: 1450 },
                            { range: "20-39", count: 720, students: 720 },
                            { range: "0-19", count: 250, students: 250 }
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

                let data;

                try {
                    data = await apiRequest(`/attempts/${attemptId}/result`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                } catch (error) {
                    setErrorMessage(error.message || "Failed to load result");
                    router.push("/");
                    return;
                }
                setResult(data.result);

                let historyData = null;

                try {
                    historyData = await apiRequest("/attempts/my", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                } catch (error) {
                    console.error(error);
                }

                if (Array.isArray(historyData)) {
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
                        { range: "80-100", count: 120, students: 120 },
                        { range: "60-79", count: 940, students: 940 },
                        { range: "40-59", count: 1850, students: 1850 },
                        { range: "20-39", count: 910, students: 910 },
                        { range: "0-19", count: 300, students: 300 }
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
                    <ThreeDots color="#059669" height={70} width={70} />
                    <p className="text-sm font-semibold text-slate-500 animate-pulse">Loading comprehensive result metrics...</p>
                </div>
            </main>
        );
    }

    if (!result) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md mx-auto">
                    <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <XCircle className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Result Not Found</h2>
                    <p className="mt-2 text-sm text-slate-500">{errorMessage || "We couldn't retrieve the details for this test attempt."}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-6 w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 cursor-pointer"
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

    const selectedAttempt = attempts.find((att) => att.attemptId === attemptId) || attempts[0];
    const currentAttemptIndex = attempts.findIndex((att) => att.attemptId === attemptId);
    const attemptDisplayNum = currentAttemptIndex !== -1 ? attempts.length - currentAttemptIndex : 1;

    return (
        <main className="min-h-screen bg-slate-50/60 text-slate-800 pb-20 font-sans">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">

                {/* Compact, Sleek Header Banner */}
                <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] uppercase tracking-wider border border-emerald-200/60">
                                {result.test?.category || "Govt Exam Mock Test"}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-semibold text-slate-500">
                                Status: <strong className="text-slate-700 uppercase">{(result.status || "completed")}</strong>
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                            {result.test?.title || "Exam Result Summary"}
                        </h1>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Completed on: {new Date(result.completedAt || Date.now()).toLocaleString()}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => router.push(`/tests/${id}/analysis/${attemptId}`)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition cursor-pointer"
                        >
                            <span>Detailed Analysis</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Attempt History Selector Bar (with attempt number, marks, and timestamp) */}
                {attempts.length > 0 && (
                    <div className="rounded-2xl bg-white border border-slate-200/80 px-5 py-3 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <RotateCcw className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Attempt Switcher ({attempts.length})</span>
                        </div>
                        <div className="w-full sm:w-80">
                            <select
                                value={attemptId}
                                onChange={(event) => {
                                    const selectedVal = event.target.value;
                                    router.push(`/tests/${id}/result?attemptId=${selectedVal}`);
                                }}
                                className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 transition cursor-pointer"
                            >
                                {attempts.map((attempt, index) => {
                                    const attNum = attempts.length - index;
                                    const formattedDate = attempt.createdAt ? new Date(attempt.createdAt).toLocaleString() : "";
                                    return (
                                        <option key={attempt.attemptId} value={attempt.attemptId}>
                                            Attempt {attNum} — Score: {attempt.score}/{attempt.maximumMarks} — {formattedDate}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                )}

                {/* Clean Individual Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Card 1: Final Score */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Final Score</span>
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Trophy className="w-4 h-4" /></div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900">{result.score} <span className="text-lg font-bold text-slate-400">/{result.maximumMarks}</span></div>
                            <p className="text-xs font-bold text-emerald-600 mt-1">{result.percentage}% Overall Score</p>
                        </div>
                        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                            <span>+{result.marksPerQuestion} Correct</span>
                            <span className="text-rose-600">-{result.negativeMarks} Wrong</span>
                        </div>
                    </div>

                    {/* Card 2: Rank & Percentile */}
                    {/* <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Standing & Percentile</span>
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Zap className="w-4 h-4" /></div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900">{result.rank}</div>
                            <p className="text-xs font-bold text-indigo-600 mt-1">Top {result.percentile}% Candidates</p>
                        </div>
                        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                            Compared to {result.totalCandidates} total applicants
                        </div>
                    </div> */}

                    {/* Card 3: Accuracy Rate */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Accuracy & Attempted</span>
                            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl"><Target className="w-4 h-4" /></div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900">{Math.round((correctCount / (totalQ || 1)) * 100)}%</div>
                            <p className="text-xs font-bold text-teal-600 mt-1">{correctCount} of {totalQ} questions correct</p>
                        </div>
                        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex justify-between">
                            <span>Attempted: {correctCount + incorrectCount}</span>
                            <span>Skipped: {unansweredCount}</span>
                        </div>
                    </div>

                    {/* Card 4: Question Breakdown Summary */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Answers Breakdown</span>
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Activity className="w-4 h-4" /></div>
                        </div>
                        <div className="space-y-1.5 py-1">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Correct</span>
                                <span>{correctCount}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-rose-600 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Incorrect</span>
                                <span>{incorrectCount}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-500 flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> Unanswered</span>
                                <span>{unansweredCount}</span>
                            </div>
                        </div>
                        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                            Total Questions: {totalQ}
                        </div>
                    </div>

                </div>

                {/* Score Range Distribution Card */}
                {/* <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score Brackets & Candidate Distribution</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                        {result.marksDistribution?.map((item, idx) => (
                            <div key={idx} className="rounded-xl border border-slate-200/60 bg-slate-50 p-4 text-center space-y-1">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">{item.range} Marks</span>
                                <span className="text-xl font-black text-slate-900 block">{item.students}</span>
                                <span className="text-[10px] text-slate-400 font-medium">candidates</span>
                            </div>
                        ))}
                    </div>
                </div> */}

                {/* Bottom Navigation Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="cursor-pointer flex-1 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 px-6 py-4 text-xs font-bold text-slate-700 shadow-sm transition text-center flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </button>

                    {/* <button
                        type="button"
                        onClick={() => {
                            const subject = result.test?.subject?.toLowerCase() || "english";
                            const topic = result.test?.topic || "";
                            router.push(`/subjects/${subject}/${topic}`);
                        }}
                        className="cursor-pointer flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-6 py-4 text-xs font-bold text-white shadow-md transition text-center flex items-center justify-center gap-2"
                    >
                        <span>Try Another Test</span>
                        <ChevronRight className="w-4 h-4" />
                    </button> */}
                </div>

            </div>
        </main>
    );
}