
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";

const API_BASE = "http://localhost:5000/api/full-length-exams";

export default function FullLengthExamAnalysisPage() {
    const params = useParams();
    const router = useRouter();

    const attemptedId = params?.attemptedId;
    const attemptId=attemptedId

    const [result, setResult] = useState(null);
    const [sectionIndex, setSectionIndex] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();

        async function loadAnalysis() {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }


                const response = await fetch(
                    `${API_BASE}/attempts/${encodeURIComponent(
                        attemptId
                    )}/result`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal,
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok || data.success === false) {
                    throw new Error(
                        data.message || "Could not load detailed analysis."
                    );
                }

                if (!cancelled) {
                    setResult(data.result);
                    setSectionIndex(0);
                    setQuestionIndex(0);
                }
            } catch (err) {
                if (!cancelled && err.name !== "AbortError") {
                    setError(
                        err.message || "Could not load detailed analysis."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (attemptId) {
            loadAnalysis();
        } else {
            setError("Attempt ID is missing from the URL.");
            setLoading(false);
        }

        return () => {
            cancelled = true;
            controller.abort();
        };
    }, [attemptId, router]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <ThreeDots color="#2563eb" height={70} width={70} />
            </main>
        );
    }

    if (error || !result) {
        return (
            <main className="mx-auto max-w-3xl space-y-4 p-6">
                <h1 className="text-xl font-bold">
                    Detailed analysis unavailable
                </h1>
                <p className="text-red-600">
                    {error || "No result data was returned."}
                </p>
                <button
                    onClick={() => router.back()}
                    className="cursor-pointer rounded-lg bg-blue-700 px-4 py-2 text-white"
                >
                    Back to Result
                </button>
            </main>
        );
    }

    const sections = result.sections || [];
    const currentSection = sections[sectionIndex];
    const questions = currentSection?.questions || [];
    const currentQuestion = questions[questionIndex];

    if (!currentSection || !currentQuestion) {
        return (
            <main className="space-y-4 p-6">
                <p>No questions are available for this section.</p>
                <button
                    onClick={() => router.back()}
                    className="cursor-pointer rounded-lg border px-4 py-2"
                >
                    Back to Result
                </button>
            </main>
        );
    }

    const statusStyle = {
        correct: "border-green-500 bg-green-50 text-green-800",
        wrong: "border-red-500 bg-red-50 text-red-800",
        unanswered: "border-gray-300 bg-gray-50 text-gray-700",
    };

    const goToSection = (index) => {
        setSectionIndex(index);
        setQuestionIndex(0);
    };

    const goPrevious = () => {
        if (questionIndex > 0) {
            setQuestionIndex((previous) => previous - 1);
        } else if (sectionIndex > 0) {
            const previousSection = sectionIndex - 1;
            setSectionIndex(previousSection);
            setQuestionIndex(
                Math.max(0, sections[previousSection].questions.length - 1)
            );
        }
    };

    const goNext = () => {
        if (questionIndex < questions.length - 1) {
            setQuestionIndex((previous) => previous + 1);
        } else if (sectionIndex < sections.length - 1) {
            setSectionIndex((previous) => previous + 1);
            setQuestionIndex(0);
        }
    };

    const status = currentQuestion.status || "unanswered";

    return (
        <div className="min-h-screen bg-white text-sm">
            {/* Header */}
            <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 shadow-sm">
                <div>
                    <div className="text-xl font-black text-cyan-500">
                        TopicWise
                    </div>
                    <h1 className="font-semibold text-gray-800">
                        {result.examTitle || "Exam"} — Detailed Analysis
                    </h1>
                </div>

                <button
                    onClick={() =>
                        router.push(`/full-length-exams/result/${attemptId}`)
                    }
                    className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 font-semibold hover:bg-gray-50"
                >
                    ← Back to Result
                </button>
            </header>

            {/* Score strip */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-b bg-gray-50 px-4 py-3">
                <span>
                    Score: <strong>{result.score} / {result.totalMarks}</strong>
                </span>
                <span>
                    Percentage: <strong>{result.percentage}%</strong>
                </span>
                <span>
                    Correct: <strong className="text-green-700">
                        {result.correctAnswers}
                    </strong>
                </span>
                <span>
                    Wrong: <strong className="text-red-700">
                        {result.wrongAnswers}
                    </strong>
                </span>
                <span>
                    Unanswered: <strong>{result.unattemptedQuestions}</strong>
                </span>
            </div>

            {/* Section tabs */}
            <nav className="flex gap-2 overflow-x-auto border-b p-3">
                {sections.map((section, index) => (
                    <button
                        key={section.sectionIndex ?? index}
                        onClick={() => goToSection(index)}
                        className={`cursor-pointer shrink-0 rounded px-4 py-2 font-bold ${
                            index === sectionIndex
                                ? "bg-green-600 text-white"
                                : "border bg-gray-50 text-gray-700"
                        }`}
                    >
                        {section.name}
                    </button>
                ))}
            </nav>

            {/* Question workspace and palette */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
                <section className="flex min-h-[60vh] flex-col justify-between border-r p-4 sm:p-6">
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="font-bold text-gray-800">
                                Question {questionIndex + 1} of {questions.length}
                            </h2>

                            <span
                                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                                    statusStyle[status] ||
                                    statusStyle.unanswered
                                }`}
                            >
                                {status === "correct"
                                    ? "Correct"
                                    : status === "wrong"
                                    ? "Incorrect"
                                    : "Unanswered"}
                            </span>
                        </div>

                        {/* Same question panel concept as the exam page */}
                        <div className="rounded border border-gray-200 bg-white p-4 font-medium text-gray-900">
                            {currentQuestion.questionText}
                        </div>

                        {/* Read-only options */}
                        <div className=" space-y-3">
                            {(currentQuestion.options || []).map(
                                (option, index) => {
                                    const isSelected =
                                        option === currentQuestion.selectedAnswer;
                                    const isCorrect =
                                        option === currentQuestion.correctAnswer;

                                    let style =
                                        "border-gray-200 bg-white text-gray-800";

                                    if (isCorrect && isSelected) {
                                        style =
                                            "cursor-pointer border-green-500 bg-green-50 text-green-800";
                                    } else if (isCorrect) {
                                        style =
                                            " border-green-500 bg-green-50 text-green-800";
                                    } else if (isSelected) {
                                        style =
                                            "border-red-500 bg-red-50 text-red-800";
                                    }

                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-start gap-3 rounded border p-3 ${style}`}
                                        >
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
                                                {String.fromCharCode(65 + index)}
                                            </span>

                                            <div className="flex-1">
                                                {option}
                                                <div className="mt-1 flex flex-wrap gap-2 text-xs font-bold">
                                                    {isSelected && (
                                                        <span>
                                                            Your answer
                                                        </span>
                                                    )}
                                                    {isCorrect && (
                                                        <span>
                                                            Correct answer
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>

                        {/* Explanation */}
                        <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
                            <p>
                                <strong>Your answer: </strong>
                                {currentQuestion.selectedAnswer || "Not answered"}
                            </p>

                            <p className="text-green-700">
                                <strong>Correct answer: </strong>
                                {currentQuestion.correctAnswer || "Not available"}
                            </p>

                            <p>
                                <strong>Marks awarded: </strong>
                                {currentQuestion.marksAwarded ?? 0}
                            </p>

                            {currentQuestion.explanation && (
                                <div className="rounded-lg bg-blue-50 p-3 text-gray-800">
                                    <p className="mb-1 font-bold">
                                        Explanation
                                    </p>
                                    {currentQuestion.explanation}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Previous / Next navigation */}
                    <div className="mt-8 flex justify-between gap-3 border-t pt-4">
                        <button
                            onClick={goPrevious}
                            disabled={sectionIndex === 0 && questionIndex === 0}
                            className="cursor-pointer rounded bg-blue-700 px-5 py-2 font-semibold text-white disabled:opacity-40"
                        >
                            ← Previous
                        </button>

                        <button
                            onClick={goNext}
                            disabled={
                                sectionIndex === sections.length - 1 &&
                                questionIndex === questions.length - 1
                            }
                            className="cursor-pointer rounded bg-blue-700 px-5 py-2 font-semibold text-white disabled:opacity-40"
                        >
                            Next →
                        </button>
                    </div>
                </section>

                {/* Right-side question palette */}
                <aside className="border-t bg-white p-4 lg:border-l lg:border-t-0">
                    <h2 className="mb-3 font-bold text-gray-800">
                        {currentSection.name} — Questions
                    </h2>

                    <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
                        {questions.map((question, index) => {
                            const isCurrent = questionIndex === index;
                            const questionStatus =
                                question.status || "unanswered";

                            let style =
                                "border-gray-300 bg-gray-100 text-gray-700";

                            if (questionStatus === "correct") {
                                style =
                                    "border-green-600 bg-green-600 text-white";
                            } else if (questionStatus === "wrong") {
                                style =
                                    "border-red-600 bg-red-600 text-white";
                            }

                            return (
                                <button
                                    key={question.questionIndex ?? index}
                                    onClick={() => setQuestionIndex(index)}
                                    title={`Question ${index + 1}: ${questionStatus}`}
                                    className={`h-9 cursor-pointer rounded border font-bold ${style} ${
                                        isCurrent
                                            ? "ring-2 ring-blue-500 ring-offset-2"
                                            : ""
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-5 space-y-2 text-xs text-gray-600">
                        <p>
                            <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-green-600" />
                            Correct
                        </p>
                        <p>
                            <span className="mr-2 inline-block h-3 w-3 rounded-sm bg-red-600" />
                            Incorrect
                        </p>
                        <p>
                            <span className="mr-2 inline-block h-3 w-3 rounded-sm border border-gray-300 bg-gray-100" />
                            Unanswered
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
