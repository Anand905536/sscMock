"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function ResultPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const attemptId = searchParams.get("attemptId");

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [attempts, setAttempts] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    const selectedAttempt = attempts.find(
        (attempt) => attempt.attemptId === attemptId
    );

    useEffect(() => {
        const fetchResult = async () => {
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
                    `http://localhost:5000/api/attempts/${attemptId}/result`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message || "Failed to load result");
                    router.push("/");
                    return;
                }

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

                if (historyResponse.ok) {
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
                alert("Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchResult();
    }, [attemptId, id, router]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center">
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
            <main className="flex min-h-screen items-center justify-center">
                <p>Result not found.</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="text-center">
                    <p className="text-sm text-gray-500">
                        Test Completed
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-black">
                        {result.test.title}
                    </h1>

                    <p className="mt-2 text-gray-500">
                        {result.test.category}
                    </p>

                    {/* drop down for attemptted history */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-black">
                            Attempt History
                        </h2>

                        <div className="mt-5">
                            <select
                                value={attemptId}
                                onChange={(event) => {
                                    router.push(
                                        `/tests/${id}/result?attemptId=${event.target.value}`
                                    );
                                }}
                                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-black outline-none focus:border-black"
                            >
                                {attempts.map((attempt, index) => (
                                    <option
                                        key={attempt.attemptId}
                                        value={attempt.attemptId}
                                    >
                                        Attempt {attempts.length - index} —{" "}
                                        {attempt.score}/{attempt.maximumMarks} —{" "}
                                        {attempt.percentage}%
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {selectedAttempt && (
                        <div className="mt-4 rounded-xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Selected Attempt
                                    </p>

                                    <h3 className="mt-1 text-lg font-semibold text-black">
                                        Attempt{" "}
                                        {attempts.findIndex(
                                            (attempt) =>
                                                attempt.attemptId ===
                                                selectedAttempt.attemptId
                                        ) !== -1
                                            ? attempts.length -
                                            attempts.findIndex(
                                                (attempt) =>
                                                    attempt.attemptId ===
                                                    selectedAttempt.attemptId
                                            )
                                            : ""}
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        {selectedAttempt.score}/
                                        {selectedAttempt.maximumMarks}
                                        {" • "}
                                        {selectedAttempt.percentage}%
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            `/tests/${id}/analysis/${selectedAttempt.attemptId}`
                                        )
                                    }
                                    className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
                                >
                                    Detailed Analysis →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* detailed analysis page */}
                    {/* <div className="mt-8">
                        <div>
                            <h2 className="text-2xl font-bold text-black">
                                Attempt History
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                View the detailed analysis of your previous attempts.
                            </p>
                        </div>

                        <div className="mt-5 space-y-3">
                            {attempts.map((attempt, index) => (
                                <button
                                    key={attempt.attemptId}
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            `/tests/${id}/analysis/${attempt.attemptId}`
                                        )
                                    }
                                    className="group flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white p-5 text-left transition hover:border-black"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-black">
                                            Attempt {attempts.length - index}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {attempt.completedAt
                                                ? new Date(
                                                    attempt.completedAt
                                                ).toLocaleString()
                                                : "Completed"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-black">
                                                {attempt.score}/{attempt.maximumMarks}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {attempt.percentage}%
                                            </p>
                                        </div>

                                        <span className="text-sm font-medium text-black transition-transform group-hover:translate-x-1">
                                            Detailed Analysis →
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div> */}
                </div>

                <div className="mt-10 rounded-xl border border-gray-200 p-8">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Your Score
                        </p>

                        <p className="mt-2 text-5xl font-bold text-black">
                            {result.score}
                            <span className="text-2xl text-gray-400">
                                /{result.maximumMarks}
                            </span>
                        </p>

                        <p className="mt-3 text-lg text-gray-600">
                            {result.percentage}%
                        </p>

                        <p className="mt-2 text-sm text-gray-500">
                            {result.marksPerQuestion} marks per question
                            {" • "}
                            {result.negativeMarks} negative marks for wrong answer
                        </p>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-lg border border-gray-200 p-5 text-center">
                            <p className="text-sm text-gray-500">
                                Correct
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-black">
                                {result.correctAnswers}
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-5 text-center">
                            <p className="text-sm text-gray-500">
                                Incorrect
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-black">
                                {result.incorrectAnswers}
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-5 text-center">
                            <p className="text-sm text-gray-500">
                                Unanswered
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-black">
                                {result.unanswered}
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 p-5 text-center">
                            <p className="text-sm text-gray-500">
                                Rank
                            </p>

                            <p className="mt-2 text-2xl font-semibold text-black">
                                #{result.rank}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-lg border border-gray-200 p-5 text-center">
                        <p className="text-sm text-gray-500">
                            Percentile
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-black">
                            {result.percentile}%
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Among {result.totalCandidates} candidates
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="flex-1 rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-black"
                    >
                        Back to Home
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push(`/subjects/${result.test.subject?.toLowerCase() || "english"}/${result.test.topic || ""}`)}
                        className="flex-1 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white"
                    >
                        Try Another Test
                    </button>
                </div>
            </div>
        </main>
    );
}