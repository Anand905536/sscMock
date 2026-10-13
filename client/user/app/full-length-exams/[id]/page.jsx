
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";

const API = "http://localhost:5000/api/full-length-exams";

export default function FullLengthExamPage() {
    const params = useParams();
    const router = useRouter();
    const examId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [exam, setExam] = useState(null);
    const [attemptId, setAttemptId] = useState("");
    const [sectionIndex, setSectionIndex] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    // modal
    const [showConfirmation, setShowConfirmation] = useState(false);

    const currentSection = exam?.sections?.[sectionIndex];
    const currentQuestion = currentSection?.questions?.[questionIndex];

    const submitExam = useCallback(async () => {
        if (!attemptId || submitting) return;

        setSubmitting(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            const formattedAnswers = Object.entries(answers).map(
                ([key, selectedAnswer]) => {
                    const [s, q] = key.split("-").map(Number);

                    return {
                        sectionIndex: s,
                        questionIndex: q,
                        selectedAnswer,
                    };
                }
            );

            const response = await fetch(
                `${API}/attempts/${attemptId}/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ answers: formattedAnswers }),
                }
            );

            const data = await response.json();


            if (!response.ok) {
                throw new Error(data.message || "Exam submit nahi hua.");
            }

            sessionStorage.setItem(
                "fullLengthExamResult",
                JSON.stringify(data)
            );

            router.push(`/ full - length - exams / result / ${attemptId} `);


            router.push(`/full-length-exams/result/${attemptId}`);
        } catch (err) {
            setError(err.message || "Submit karne mein error aaya.");
            setSubmitting(false);
        }
    }, [attemptId, answers, router, submitting]);

    useEffect(() => {
        let cancelled = false;

        async function loadExam() {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                if (!examId || examId === "ssc-cgl") {
                    throw new Error(
                        "Exam URL mein MongoDB exam ID nahi mili. Start Exam link check karo."
                    );
                }

                const examResponse = await fetch(`${API}/${examId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: "no-store",
                });

                const examData = await examResponse.json();

                if (!examResponse.ok) {
                    throw new Error(
                        examData.message || "Exam load nahi hua."
                    );
                }

                // API direct exam object return karti hai.
                const examObject = examData;

                if (
                    !examObject ||
                    typeof examObject !== "object" ||
                    !Array.isArray(examObject.sections) ||
                    examObject.sections.length === 0
                ) {
                    throw new Error(
                        "API response mein sections nahi mile. Response: " +
                        JSON.stringify(examData)
                    );
                }

                const hasQuestions = examObject.sections.some(
                    (section) =>
                        Array.isArray(section.questions) &&
                        section.questions.length > 0
                );

                if (!hasQuestions) {
                    throw new Error(
                        "Is exam ke sections mein questions add nahi hain."
                    );
                }

                const startResponse = await fetch(`${API}/attempts/start`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ examId }),
                });

                const startData = await startResponse.json();

                if (!startResponse.ok) {
                    throw new Error(
                        startData.message || "Exam start nahi hua."
                    );
                }

                if (!startData.attemptId) {
                    throw new Error(
                        "Attempt ID nahi mili. Backend start API ka response check karo."
                    );
                }

                if (cancelled) return;

                setExam(examObject);
                setAttemptId(startData.attemptId);
                setSectionIndex(0);
                setQuestionIndex(0);
                setAnswers({});
                setSecondsLeft(
                    Math.max(
                        1,
                        Number(examObject.sections[0].durationMinutes) || 1
                    ) * 60
                );
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Exam load nahi hua.");
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
            setError("URL se exam ID nahi mili.");
            setLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [examId, router]);

    useEffect(() => {
        if (!exam || !attemptId || submitting) return;

        if (secondsLeft <= 0) {
            if (sectionIndex < exam.sections.length - 1) {
                const nextIndex = sectionIndex + 1;

                setSectionIndex(nextIndex);
                setQuestionIndex(0);
                setSecondsLeft(
                    Math.max(
                        1,
                        Number(exam.sections[nextIndex].durationMinutes) || 1
                    ) * 60
                );
            } else {
                submitExam();
            }

            return;
        }

        const timer = setTimeout(() => {
            setSecondsLeft((previous) => previous - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [
        secondsLeft,
        exam,
        attemptId,
        sectionIndex,
        submitting,
        submitExam,
    ]);

    if (loading) {
        return (
            <main className="flex justify-center p-8">
                <ThreeDots />
            </main>
        );
    }

    if (error && !exam) {
        return (
            <main className="mx-auto max-w-3xl space-y-4 p-6">
                <h1 className="text-xl font-bold">Exam load nahi hua</h1>
                <p className="text-red-600">{error}</p>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-lg border px-4 py-2"
                >
                    Back
                </button>
            </main>
        );
    }

    if (!exam || !currentSection || !currentQuestion) {
        return (
            <main className="mx-auto max-w-3xl space-y-3 p-6">
                <h1 className="text-xl font-bold">Question load nahi hua</h1>
                <p className="text-red-600">
                    {error ||
                        `Section ${sectionIndex + 1} mein question ${questionIndex + 1} nahi mila.`}
                </p>
            </main>
        );
    }

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const answerKey = `${sectionIndex}-${questionIndex}`;
    const selectedAnswer = answers[answerKey] || "";
    const questions = currentSection.questions;


    const sectionSummary = exam.sections.map((section, sIndex) => {
        const totalQuestions = section.questions.length;

        const attemptedQuestions = section.questions.reduce(
            (count, question, qIndex) => {
                const answer = answers[`${sIndex}-${qIndex}`];
                return count + (answer !== undefined && answer !== "" ? 1 : 0);
            },
            0
        );

        return {
            name: section.name,
            totalQuestions,
            attemptedQuestions,
            unattemptedQuestions: totalQuestions - attemptedQuestions,
        };
    });

    const totalQuestions = sectionSummary.reduce(
        (sum, section) => sum + section.totalQuestions,
        0
    );

    const totalAttempted = sectionSummary.reduce(
        (sum, section) => sum + section.attemptedQuestions,
        0
    );

    return (
        <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">{exam.title}</h1>
                    <p className="text-gray-600">
                        Section {sectionIndex + 1} of {exam.sections.length}:{" "}
                        {currentSection.name}
                    </p>
                </div>

                <div className="rounded-lg border px-4 py-3 text-center">
                    <p className="text-sm text-gray-500">Section Time Left</p>
                    <p className="text-2xl font-bold tabular-nums">
                        {String(minutes).padStart(2, "0")}:
                        {String(seconds).padStart(2, "0")}
                    </p>
                </div>
            </header>

            <div className="flex flex-wrap gap-2">
                {exam.sections.map((section, index) => (
                    <span
                        key={section._id || index}
                        className={`rounded-full border px-3 py-1 text-sm ${index === sectionIndex
                            ? "border-indigo-600 bg-indigo-50 font-semibold text-indigo-700"
                            : "text-gray-500"
                            }`}
                    >
                        {section.name}
                    </span>
                ))}
            </div>

            <section className="space-y-5 rounded-xl border bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">
                        Question {questionIndex + 1} of {questions.length}
                    </p>
                    <p className="text-sm text-gray-500">
                        +{currentSection.marksPerQuestion} / -
                        {currentSection.negativeMarks}
                    </p>
                </div>

                <h2 className="text-lg font-semibold">
                    {currentQuestion.questionText}
                </h2>

                <div className="space-y-3">
                    {(currentQuestion.options || []).map((option, index) => (
                        <label
                            key={index}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${selectedAnswer === option
                                ? "border-indigo-600 bg-indigo-50"
                                : "border-gray-200"
                                }`}
                        >
                            <input
                                type="radio"
                                name={`question-${sectionIndex}-${questionIndex}`}
                                checked={selectedAnswer === option}
                                onChange={() =>
                                    setAnswers((previous) => ({
                                        ...previous,
                                        [answerKey]: option,
                                    }))
                                }
                            />
                            <span>{option}</span>
                        </label>
                    ))}
                </div>
            </section>

            {error && <p className="text-red-600">{error}</p>}

            <footer className="flex flex-wrap justify-between gap-3">
                <button
                    type="button"
                    disabled={questionIndex === 0}
                    onClick={() => setQuestionIndex((previous) => previous - 1)}
                    className="rounded-lg border px-4 py-2 disabled:opacity-40"
                >
                    Previous
                </button>

                {questionIndex < questions.length - 1 ? (
                    <button
                        type="button"
                        onClick={() => setQuestionIndex((previous) => previous + 1)}
                        className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white"
                    >
                        Next
                    </button>
                ) : sectionIndex < exam.sections.length - 1 ? (
                    <button
                        type="button"
                        onClick={() => {
                            const nextIndex = sectionIndex + 1;
                            setSectionIndex(nextIndex);
                            setQuestionIndex(0);
                            setSecondsLeft(
                                Math.max(
                                    1,
                                    Number(exam.sections[nextIndex].durationMinutes) || 1
                                ) * 60
                            );
                        }}
                        className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white"
                    >
                        Next Section
                    </button>
                ) : (
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={() => setShowConfirmation(true)}
                        className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white disabled:opacity-50"
                    >
                        {submitting ? "Submitting..." : "Submit Exam"}
                    </button>
                )}
            </footer>
            {/* modal  */}
            {showConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-xl">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Confirm Exam Submission
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Submit karne se pehle apne answers ka summary check kar lo.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <div className="rounded-lg border p-3">
                                <p className="text-sm text-gray-500">Total Questions</p>
                                <p className="text-2xl font-bold">{totalQuestions}</p>
                            </div>

                            <div className="rounded-lg border p-3">
                                <p className="text-sm text-gray-500">Attempted</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {totalAttempted}
                                </p>
                            </div>

                            <div className="rounded-lg border p-3">
                                <p className="text-sm text-gray-500">Unattempted</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {totalQuestions - totalAttempted}
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="p-3">Section</th>
                                        <th className="p-3">Total</th>
                                        <th className="p-3">Attempted</th>
                                        <th className="p-3">Unattempted</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {sectionSummary.map((section, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-3 font-medium">
                                                {section.name}
                                            </td>
                                            <td className="p-3">
                                                {section.totalQuestions}
                                            </td>
                                            <td className="p-3 text-green-700">
                                                {section.attemptedQuestions}
                                            </td>
                                            <td className="p-3 text-red-600">
                                                {section.unattemptedQuestions}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p className="text-sm text-gray-600">
                            Confirm submit karne ke baad answers change nahi kar paoge.
                        </p>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setShowConfirmation(false)}
                                className="rounded-lg border px-5 py-3 font-semibold disabled:opacity-50"
                            >
                                Back to Exam
                            </button>

                            <button
                                type="button"
                                disabled={submitting}
                                onClick={submitExam}
                                className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "Confirm Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </main>
    );
}
