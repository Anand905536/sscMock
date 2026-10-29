"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ThreeDots } from 'react-loader-spinner';
import { apiRequest } from "@/lib/api";

export default function AttemptPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    const attemptId = searchParams.get("attemptId");

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [visitedQuestions, setVisitedQuestions] = useState([0]);
    const autoSubmitTriggered = useRef(false);

    useEffect(() => {
        setVisitedQuestions((previous) =>
            previous.includes(currentIndex)
                ? previous
                : [...previous, currentIndex]
        );
    }, [currentIndex]);


    useEffect(() => {
        const handleBeforeUnload = () => {
            sessionStorage.setItem(
                `test-refreshed-${id}`,
                "true"
            );
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        const wasRefreshed = sessionStorage.getItem(
            `test-refreshed-${id}`
        );

        if (wasRefreshed === "true") {
            sessionStorage.removeItem(`test-refreshed-${id}`);
            router.replace(`/tests/${id}`);
        }

        return () => {
            window.removeEventListener(
                "beforeunload",
                handleBeforeUnload
            );
        };
    }, [id, router]);

    useEffect(() => {
        const loadTest = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                if (!attemptId) {
                    router.push(`/tests/${id}`);
                    return;
                }

                const data = await apiRequest(`/questions/test/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const loadedQuestions = Array.isArray(data)
                    ? data
                    : data.questions || [];

                setQuestions(loadedQuestions);
                const testData = await apiRequest(`/tests/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const duration =
                    testData.test?.durationMinutes ||
                    testData.durationMinutes ||
                    0;

                setTimeLeft(duration * 60);
            } catch (error) {
                console.error(error);
                alert("Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        loadTest();
    }, [id, attemptId, router]);

    // Countdown timer
    useEffect(() => {
        if (loading || questions.length === 0 || timeLeft <= 0) {
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft((previous) => Math.max(0, previous - 1));
        }, 1000);

        return () => clearTimeout(timer);
    }, [loading, questions.length, timeLeft]);

    // Automatically submit when the timer reaches zero
    useEffect(() => {
        if (
            loading ||
            questions.length === 0 ||
            timeLeft !== 0 ||
            autoSubmitTriggered.current
        ) {
            return;
        }

        autoSubmitTriggered.current = true;
        handleSubmit(true);
    }, [loading, questions.length, timeLeft]);

    const handleAnswer = (answer) => {
        const question = questions[currentIndex];

        setAnswers((previous) => ({
            ...previous,
            [question._id]: answer,
        }));
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (submitting) return;

        try {
            setSubmitting(true);

            const token = localStorage.getItem("token");

            const formattedAnswers = questions.map((question) => ({
                question: question._id,
                selectedAnswer: answers[question._id] || "",
            }));
            await apiRequest(`/attempts/${attemptId}/submit`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    answers: formattedAnswers,
                }),
            });

            router.replace(
                `/tests/${id}/result?attemptId=${attemptId}`
            );
        } catch (error) {
            console.error("Submit test error:", error);

            if (!autoSubmit) {
                alert("Something went wrong while submitting");
            }

            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <ThreeDots />
            </main>
        );
    }

    if (!questions.length) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p>No questions found.</p>
            </main>
        );
    }

    const question = questions[currentIndex];
    const selectedAnswer = answers[question._id];

    return (
        <main className="min-h-screen bg-white">
            <header className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
                <h1 className="text-lg font-semibold text-black">
                    Test
                </h1>

                <div className="flex items-center gap-5">
                    <div className="font-mono text-sm font-semibold text-black">
                        {formatTime(timeLeft)}
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                if (!document.fullscreenElement) {
                                    await document.documentElement.requestFullscreen();
                                } else {
                                    await document.exitFullscreen();
                                }
                            } catch (error) {
                                console.error("Fullscreen error:", error);
                            }
                        }}
                        className=" cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-600 hover:text-white"
                    >
                        {`Fullscreen`}
                    </button>
                </div>
            </header>

            <div className="mx-auto flex max-w-6xl gap-6 px-6 py-8">



                {/* Question Area */}
                <div className="min-w-0 flex-1">
                    <div className="mb-6 flex justify-between text-sm text-gray-500">
                        <span>
                            Question {currentIndex + 1} of {questions.length}
                        </span>

                        <span>
                            Answered {Object.keys(answers).length}/
                            {questions.length}
                        </span>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-6">
                        <h2 className="cursor-pointer text-lg font-bold leading-7 text-black">
                            {question.questionText}
                        </h2>

                        <div className="mt-6 space-y-3">
                            {question.options.map((option, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleAnswer(option)}
                                    className={`cursor-pointer w-full rounded-lg border px-4 py-3 text-left text-sm ${selectedAnswer === option
                                        ? "border-black bg-gray-400 text-white"
                                        : "border-gray-200 text-gray-700 hover:border-gray-400 "
                                        }`}
                                >
                                    <span className="mr-3 font-medium">
                                        {String.fromCharCode(65 + index)}.
                                    </span>

                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mobile Question Palette */}
                    <div className="mt-6 rounded-xl border border-gray-200 p-5 lg:hidden">
                        <h2 className="text-sm font-semibold text-black">
                            Questions
                        </h2>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {questions.map((item, index) => {
                                const answered =
                                    answers[item._id] !== undefined &&
                                    answers[item._id] !== "";

                                const current = index === currentIndex;

                                return (
                                    <button
                                        key={item._id}
                                        type="button"
                                        onClick={() => setCurrentIndex(index)}
                                        className={`cursor-pointer flex h-9 w-9 items-center justify-center rounded-md border text-xs font-medium ${answered
                                            ? "border-green-600 bg-green-500 text-white"
                                            : "border-gray-300 bg-white text-gray-700"
                                            } ${current
                                                ? "ring-2 ring-black ring-offset-1"
                                                : ""
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="mt-6 flex justify-between">
                        <button
                            type="button"
                            disabled={currentIndex === 0}
                            onClick={() =>
                                setCurrentIndex((previous) => previous - 1)
                            }
                            className="cursor-pointer rounded-lg border border-gray-300 px-5 py-2.5 text-sm disabled:opacity-40"
                        >
                            Previous
                        </button>

                        {currentIndex === questions.length - 1 ? (
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setShowSubmitModal(true)}
                                className="cursor-pointer rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-500 disabled:opacity-50"
                            >
                                Submit Test
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentIndex((previous) => previous + 1)
                                }
                                className="cursor-pointer rounded-lg bg-gray-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-500"
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>


                {/* Question Palette */}
                <aside className="hidden w-64 shrink-0 rounded-xl border border-gray-200 p-5 lg:block">
                    <h2 className="text-sm font-semibold text-black">
                        Questions
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                        Green = Answered
                    </p>

                    <div className="mt-5 grid grid-cols-5 gap-2">
                        {questions.map((item, index) => {
                            const answered =
                                answers[item._id] !== undefined &&
                                answers[item._id] !== "";

                            const current = index === currentIndex;

                            return (
                                <button
                                    key={item._id}
                                    type="button"
                                    onClick={() => setCurrentIndex(index)}
                                    className={`cursor-pointer flex h-9 w-9 items-center justify-center rounded-md border text-xs font-medium ${answered
                                        ? "border-green-400 bg-green-400 text-white"
                                        : "border-gray-300 bg-white text-gray-700"
                                        } ${current
                                            ? "ring-2 ring-black ring-offset-1"
                                            : ""
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 space-y-2 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-sm bg-green-500" />
                            Answered
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-sm border border-gray-300 bg-white" />
                            Not Answered
                        </div>
                    </div>
                </aside>
            </div>

            {/* modal for confirmation */}

            {showSubmitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="submit-modal-title"
                        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-8"
                    >
                        <h2
                            id="submit-modal-title"
                            className="text-2xl font-bold text-black"
                        >
                            Submit Test?
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Review your progress before submitting your test.
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="rounded-xl border border-gray-200 p-4">
                                <p className="text-sm text-gray-500">
                                    Total Questions
                                </p>
                                <p className="mt-2 text-3xl font-bold text-black">
                                    {questions.length}
                                </p>
                            </div>

                            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                                <p className="text-sm text-green-700">
                                    Attempted
                                </p>
                                <p className="mt-2 text-3xl font-bold text-green-700">
                                    {questions.filter(
                                        (question) =>
                                            answers[question._id] !== undefined &&
                                            answers[question._id] !== ""
                                    ).length}
                                </p>
                            </div>

                            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                <p className="text-sm text-red-700">
                                    Not Attempted
                                </p>
                                <p className="mt-2 text-3xl font-bold text-red-700">
                                    {questions.filter(
                                        (question) =>
                                            answers[question._id] === undefined ||
                                            answers[question._id] === ""
                                    ).length}
                                </p>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <p className="text-sm text-gray-600">
                                    Not Visited
                                </p>
                                <p className="mt-2 text-3xl font-bold text-gray-700">
                                    {questions.length - visitedQuestions.length}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setShowSubmitModal(false)}
                                className="cursor-pointer flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-black hover:bg-gray-100 disabled:opacity-50"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => handleSubmit(false)}
                                className="flex-1 rounded-lg bg-gray-600 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 cursor-pointer disabled:opacity-50"
                            >
                                {submitting ? (
                                    <span className="inline-flex items-center justify-center gap-2">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-white" />
                                    </span>
                                ) : (
                                    "Submit Test"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </main>
    );
}