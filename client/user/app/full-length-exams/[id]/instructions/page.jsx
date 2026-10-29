"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";
import { Clock, HelpCircle, Layers, Award, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function ExamInstructionsPage() {
    const params = useParams();
    const router = useRouter();
    const examId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [exam, setExam] = useState(null);
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [hasInProgressAttempt, setHasInProgressAttempt] = useState(false);



    useEffect(() => {
        let cancelled = false;

        async function loadExam() {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                // Fetch exam details through the centralized API utility.
                const data = await apiRequest(
                    `/full-length-exams/${examId}`,
                    {
                        headers,
                        cache: "no-store",
                    }
                );

                if (!Array.isArray(data.sections)) {
                    throw new Error("Exam sections could not be loaded.");
                }

                // Fetch previous attempts through the same utility.
                try {
                    const attemptsData = await apiRequest("/full-length-exams/previous", {
                        headers,
                        cache: "no-store",
                    });

                    const activeAttempt = (
                        attemptsData?.attempts || []
                    ).find((item) => {
                        const attemptExamId = item.exam?._id || item.exam;

                        return (
                            String(attemptExamId) === String(data._id) &&
                            item.status === "in-progress"
                        );
                    });

                    if (!cancelled) {
                        setHasInProgressAttempt(Boolean(activeAttempt));
                    }
                } catch (attemptError) {
                    // Preserve the previous behavior: an attempts
                    // request failure should not prevent exam loading.
                    console.error(
                        "Failed to load previous attempts:",
                        attemptError.message
                    );
                }

                if (!cancelled) {
                    setExam(data);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Failed to load exam details.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        if (examId) {
            loadExam();
        } else {
            setError("Exam ID is missing.");
            setLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [examId, router]);


    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-50">
                <ThreeDots color="#059669" height={80} width={80} />
            </main>
        );
    }

    if (error || !exam) {
        return (
            <main className="mx-auto max-w-2xl p-6 pt-16 text-center">
                <h1 className="text-2xl font-bold text-slate-800">Exam Unavailable</h1>
                <p className="mt-2 text-rose-600">{error || "Could not retrieve exam information."}</p>
                <button
                    onClick={() => {
                        if (exam?.category && exam?.exam) {
                            router.push(`/tests/exam/${encodeURIComponent(exam.category.trim().toLowerCase())}/${encodeURIComponent(exam.exam.trim().toLowerCase())}`);
                        } else {
                            router.push("/tests");
                        }
                    }}
                    className="mt-6 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                    Back to Exams
                </button>
            </main>
        );
    }

    const totalQuestions = exam.sections.reduce(
        (sum, section) => sum + (section.questions?.length || 0),
        0
    );

    const totalMinutes = exam.sections.reduce(
        (sum, section) => sum + (Number(section.durationMinutes) || 0),
        0
    );

    const totalMarks = exam.sections.reduce(
        (sum, section) =>
            sum +
            (section.questions?.length || 0) *
            (Number(section.marksPerQuestion) || 0),
        0
    );

    return (
        <main className="min-h-screen bg-slate-50/60 px-4 py-10 sm:px-8">
            <div className="mx-auto max-w-3xl space-y-6">

                {/* Header Banner */}
                <header className="rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white shadow-md sm:p-8">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 px-3.5 py-1 text-xs font-semibold tracking-wider uppercase text-emerald-200 border border-emerald-400/30">
                        {exam.category} • {exam.exam}
                    </span>
                    <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">{exam.title}</h1>
                    <p className="mt-2 text-emerald-100/90 text-sm">
                        Please read the instructions carefully before commencing your exam test session.
                    </p>
                </header>

                {/* Info Cards Grid */}
                <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <InfoCard label="Total Questions" value={totalQuestions} icon={<HelpCircle className="w-4 h-4 text-emerald-600" />} />
                    <InfoCard label="Duration" value={`${totalMinutes} Mins`} icon={<Clock className="w-4 h-4 text-emerald-600" />} />
                    <InfoCard label="Total Sections" value={exam.sections.length} icon={<Layers className="w-4 h-4 text-emerald-600" />} />
                    <InfoCard label="Maximum Marks" value={totalMarks} icon={<Award className="w-4 h-4 text-emerald-600" />} />
                </section>

                {/* Instructions & Marking Scheme Card */}
                <section className="space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
                    <div>
                        <h2 className="text-lg font-extrabold text-slate-900">General Instructions</h2>
                        <ol className="mt-3 list-decimal space-y-2.5 pl-5 text-sm text-slate-600 leading-relaxed">
                            <li>The section timer starts when you first begin the test. If an attempt is already in progress, use Resume Test to continue from its saved time.</li>
                            <li>Each section has its own allocated time limit and question structure.</li>
                            <li>You can navigate between questions and sections within their respective limits.</li>
                            <li>Select one correct option for each question before proceeding or saving.</li>
                            <li>Negative marking applies as per the specific section marking scheme.</li>
                            <li>Review your attempted summaries before finalizing your test submission.</li>
                            <li>Once submitted, answers cannot be modified under any circumstances.</li>
                        </ol>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-base font-bold text-slate-900">Section-wise Marking Scheme</h3>

                        <div className="mt-3 space-y-2.5">
                            {exam.sections.map((section, index) => (
                                <div
                                    key={section._id || index}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 text-xs sm:text-sm"
                                >
                                    <span className="font-bold text-slate-800">{section.name}</span>
                                    <span className="font-medium text-slate-500">
                                        {section.durationMinutes} Mins &nbsp;|&nbsp;
                                        <span className="text-emerald-600 font-bold ml-1">+{section.marksPerQuestion}</span> Correct &nbsp;|&nbsp;
                                        <span className="text-rose-600 font-bold">-{section.negativeMarks}</span> Incorrect
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Terms & Conditions Acceptance Card */}
                <section className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <h2>Declaration</h2>
                    </div>

                    <label className="flex cursor-pointer items-start gap-3.5">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(event) => setAccepted(event.target.checked)}
                            className="mt-1 h-5 w-5 rounded border-slate-300 accent-emerald-600 cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
                            I confirm that I have carefully read and understood all the exam instructions, timer rules, section structures, and marking schemes. I agree to abide by the testing guidelines and terms of submission.
                        </span>
                    </label>
                </section>

                {/* Footer Navigation Buttons */}
                <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between pt-2">
                    <button
                        type="button"
                        onClick={() => {
                            if (exam?.category && exam?.exam) {
                                router.push(`/tests/exam/${encodeURIComponent(exam.category.trim().toLowerCase())}/${encodeURIComponent(exam.exam.trim().toLowerCase())}`);
                            } else {
                                router.push("/tests");
                            }
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Exams
                    </button>

                    <button
                        type="button"
                        disabled={!accepted}
                        onClick={() =>
                            router.push(`/full-length-exams/${exam._id}`)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-7 py-3.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 hover:shadow-emerald-900/10 transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <span>{hasInProgressAttempt ? "Resume Test" : "Accept & Start Test"}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </footer>
            </div>
        </main>
    );
}

function InfoCard({ label, value, icon }) {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                {icon}
            </div>
            <p className="text-xl font-extrabold text-slate-900">{value}</p>
        </div>
    );
}