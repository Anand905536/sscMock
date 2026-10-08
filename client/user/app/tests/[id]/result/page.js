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
                <p>Loading result...</p>
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