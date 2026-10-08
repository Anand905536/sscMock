"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function AttemptPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const attemptId = searchParams.get("attemptId");

    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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

                const response = await fetch(
                    `http://localhost:5000/api/questions/test/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message || "Failed to load questions");
                    return;
                }

                const loadedQuestions = Array.isArray(data)
                    ? data
                    : data.questions || [];

                setQuestions(loadedQuestions);

                const testResponse = await fetch(
                    `http://localhost:5000/api/tests/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const testData = await testResponse.json();

                if (testResponse.ok) {
                    const duration =
                        testData.test?.durationMinutes ||
                        testData.durationMinutes ||
                        0;

                    setTimeLeft(duration * 60);
                }
            } catch (error) {
                console.error(error);
                alert("Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        loadTest();
    }, [id, attemptId, router]);

    useEffect(() => {
        if (loading || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((previous) => {
                if (previous <= 1) {
                    clearInterval(timer);
                    handleSubmit(true);
                    return 0;
                }

                return previous - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [loading, timeLeft]);

    const handleAnswer = (answer) => {
        const question = questions[currentIndex];

        setAnswers((previous) => ({
            ...previous,
            [question._id]: answer,
        }));
    };

    const handleSubmit = async (autoSubmit = false) => {
        if (submitting) return;

        if (!autoSubmit) {
            const confirmed = window.confirm(
                "Are you sure you want to submit the test?"
            );

            if (!confirmed) return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem("token");

            const formattedAnswers = questions.map((question) => ({
                question: question._id,
                selectedAnswer: answers[question._id] || "",
            }));

            const response = await fetch(
                `http://localhost:5000/api/attempts/${attemptId}/submit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        answers: formattedAnswers,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to submit test");
                setSubmitting(false);
                return;
            }

            router.push(`/tests/${id}/result?attemptId=${attemptId}`);
        } catch (error) {
            console.error(error);
            alert("Something went wrong while submitting");
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
                <p>Loading test...</p>
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

                <div className="font-mono text-sm font-semibold text-black">
                    {formatTime(timeLeft)}
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
                        <h2 className="text-lg font-medium leading-7 text-black">
                            {question.questionText}
                        </h2>

                        <div className="mt-6 space-y-3">
                            {question.options.map((option, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleAnswer(option)}
                                    className={`w-full rounded-lg border px-4 py-3 text-left text-sm ${selectedAnswer === option
                                            ? "border-black bg-gray-100 text-black"
                                            : "border-gray-200 text-gray-700 hover:border-gray-400"
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
                                        className={`flex h-9 w-9 items-center justify-center rounded-md border text-xs font-medium ${answered
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
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm disabled:opacity-40"
                        >
                            Previous
                        </button>

                        {currentIndex === questions.length - 1 ? (
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => handleSubmit(false)}
                                className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                            >
                                {submitting
                                    ? "Submitting..."
                                    : "Submit Test"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentIndex((previous) => previous + 1)
                                }
                                className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
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
                                    className={`flex h-9 w-9 items-center justify-center rounded-md border text-xs font-medium ${answered
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
        </main>
    );
}