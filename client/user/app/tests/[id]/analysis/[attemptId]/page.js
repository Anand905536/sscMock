"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AnalysisPage() {
    const { id, attemptId } = useParams();
    const router = useRouter();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
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
                    alert(data.message || "Failed to load analysis");
                    router.push(`/tests/${id}/result?attemptId=${attemptId}`);
                    return;
                }

                setResult(data.result);
            } catch (error) {
                console.error(error);
                alert("Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [attemptId, id, router]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-black [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-black [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-black" />
                </div>
            </main>
        );
    }

    if (!result) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <p className="text-gray-500">
                    Analysis not found.
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                    <div>
                        <h1 className="font-semibold text-black">
                            {result.test.title}
                        </h1>

                        <p className="text-xs text-gray-500">
                            Detailed Analysis
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            router.push(
                                `/tests/${id}/result?attemptId=${attemptId}`
                            )
                        }
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-black"
                    >
                        Back to Result
                    </button>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-6 py-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                    <section className="rounded-xl border border-gray-200 bg-white p-8">
                        {(() => {
                            const question =
                                result.questionResults[currentQuestion];

                            if (!question) {
                                return (
                                    <p className="text-gray-500">
                                        Question not found.
                                    </p>
                                );
                            }

                            return (
                                <>
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Question {currentQuestion + 1} of{" "}
                                                {result.questionResults.length}
                                            </p>

                                            <h2 className="mt-3 text-xl font-semibold leading-8 text-black">
                                                {question.questionText}
                                            </h2>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${question.status === "correct"
                                                    ? "bg-green-100 text-green-700"
                                                    : question.status === "incorrect"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {question.status === "correct"
                                                ? "Solved"
                                                : question.status === "incorrect"
                                                    ? "Wrong"
                                                    : "Left"}
                                        </span>
                                    </div>

                                    <div className="mt-8 space-y-3">
                                        {question.options?.map((option, index) => {
                                            const isCorrect =
                                                option === question.correctAnswer;

                                            const isSelected =
                                                option === question.selectedAnswer;

                                            return (
                                                <div
                                                    key={index}
                                                    className={`rounded-lg border px-4 py-4 text-sm ${isCorrect
                                                            ? "border-green-300 bg-green-50 text-green-800"
                                                            : isSelected
                                                                ? "border-red-300 bg-red-50 text-red-800"
                                                                : "border-gray-200 text-gray-700"
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span>
                                                            {String.fromCharCode(65 + index)}.{" "}
                                                            {option}
                                                        </span>

                                                        <div className="text-xs font-medium">
                                                            {isCorrect && (
                                                                <span>
                                                                    Correct Answer
                                                                </span>
                                                            )}

                                                            {isSelected &&
                                                                !isCorrect && (
                                                                    <span>
                                                                        Your Answer
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                                        <button
                                            type="button"
                                            disabled={currentQuestion === 0}
                                            onClick={() =>
                                                setCurrentQuestion(
                                                    (previous) => previous - 1
                                                )
                                            }
                                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Previous
                                        </button>

                                        <button
                                            type="button"
                                            disabled={
                                                currentQuestion ===
                                                result.questionResults.length - 1
                                            }
                                            onClick={() =>
                                                setCurrentQuestion(
                                                    (previous) => previous + 1
                                                )
                                            }
                                            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </div>

                                    {question.explanation && (
                                        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-5">
                                            <p className="text-sm font-semibold text-black">
                                                Explanation
                                            </p>

                                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                                {question.explanation}
                                            </p>
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </section>

                    <aside className="rounded-xl border border-gray-200 bg-white p-6">
                        <h2 className="font-semibold text-black">
                            Questions
                        </h2>

                        <div className="mt-4 grid grid-cols-5 gap-2">
                            {result.questionResults.map(
                                (question, index) => (
                                    <button
                                        key={question.questionId}
                                        type="button"
                                        onClick={() =>
                                            setCurrentQuestion(index)
                                        }
                                        className={`h-9 rounded-md text-sm font-medium ${index === currentQuestion
                                                ? "ring-2 ring-black ring-offset-1"
                                                : ""
                                            } ${question.status === "correct"
                                                ? "bg-green-100 text-green-700"
                                                : question.status === "incorrect"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-gray-100 text-gray-500"
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                )
                            )}
                        </div>

                        <div className="mt-6 space-y-2 border-t border-gray-100 pt-5 text-xs text-gray-500">
                            <p>
                                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-green-100" />
                                Solved
                            </p>

                            <p>
                                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-red-100" />
                                Wrong
                            </p>

                            <p>
                                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-gray-100" />
                                Left
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}