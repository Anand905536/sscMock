
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function FullLengthExamResultPage() {
    const params = useParams();
    const router = useRouter();
    const attemptId = Array.isArray(params.attemptId)
        ? params.attemptId[0]
        : params.attemptId;

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        try {
            const savedResult = sessionStorage.getItem(
                "fullLengthExamResult"
            );

            if (!savedResult) {
                setError(
                    "Result data nahi mila. Please exam submit karne ke baad result page kholo."
                );
                return;
            }

            const parsed = JSON.parse(savedResult);
            setResult(parsed);
        } catch {
            setError("Result load nahi ho saka.");
        } finally {
            setLoading(false);
        }
    }, [attemptId]);

    if (loading) {
        return <main className="p-8 text-center">Result load ho raha hai...</main>;
    }

    if (error || !result) {
        return (
            <main className="mx-auto max-w-2xl space-y-4 p-6">
                <h1 className="text-2xl font-bold">Result unavailable</h1>
                <p className="text-red-600">
                    {error || "Result data nahi mila."}
                </p>
                <button
                    onClick={() => router.push("/full-length-exams")}
                    className="rounded-lg bg-indigo-600 px-5 py-3 text-white"
                >
                    Back to Exams
                </button>
            </main>
        );
    }

    // Backend ke possible response structures ko handle karo.
    const attempt = result.attempt || result.result || result;
    const sections =
        result.sectionResults ||
        result.sections ||
        attempt.sectionResults ||
        attempt.sections ||
        [];

    const totalQuestions =
        result.totalQuestions ??
        attempt.totalQuestions ??
        sections.reduce(
            (sum, section) =>
                sum + Number(section.totalQuestions ?? section.total ?? 0),
            0
        );

    const attemptedQuestions =
        result.attemptedQuestions ??
        result.attempted ??
        attempt.attemptedQuestions ??
        sections.reduce(
            (sum, section) =>
                sum +
                Number(
                    section.attemptedQuestions ??
                    section.attempted ??
                    0
                ),
            0
        );

    const correctAnswers =
        result.correctAnswers ??
        result.correct ??
        attempt.correctAnswers ??
        sections.reduce(
            (sum, section) =>
                sum + Number(section.correctAnswers ?? section.correct ?? 0),
            0
        );

    const wrongAnswers =
        result.wrongAnswers ??
        result.incorrectAnswers ??
        result.wrong ??
        attempt.wrongAnswers ??
        sections.reduce(
            (sum, section) =>
                sum +
                Number(
                    section.wrongAnswers ??
                    section.incorrectAnswers ??
                    section.wrong ??
                    0
                ),
            0
        );

    const score =
        result.score ??
        result.totalScore ??
        attempt.score ??
        attempt.totalScore ??
        sections.reduce(
            (sum, section) =>
                sum + Number(section.score ?? section.marksObtained ?? 0),
            0
        );

    const totalMarks =
        result.totalMarks ??
        attempt.totalMarks ??
        sections.reduce(
            (sum, section) =>
                sum + Number(section.totalMarks ?? section.maxMarks ?? 0),
            0
        );

    const accuracy =
        attemptedQuestions > 0
            ? ((correctAnswers / attemptedQuestions) * 100).toFixed(2)
            : "0.00";

    return (
        <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
            <header className="rounded-2xl bg-indigo-600 p-6 text-white">
                <p className="text-sm font-medium text-indigo-100">
                    FULL-LENGTH MOCK TEST
                </p>
                <h1 className="mt-2 text-3xl font-bold">
                    Exam Submitted Successfully!
                </h1>
                <p className="mt-2 text-indigo-100">
                    Tumhara exam submit ho gaya hai. Neeche performance summary hai.
                </p>
            </header>

            <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <StatCard
                    label="Score"
                    value={
                        totalMarks > 0
                            ? `${score} / ${totalMarks}`
                            : score
                    }
                />
                <StatCard label="Total Questions" value={totalQuestions} />
                <StatCard label="Attempted" value={attemptedQuestions} />
                <StatCard
                    label="Unattempted"
                    value={Math.max(0, totalQuestions - attemptedQuestions)}
                />
                <StatCard label="Correct Answers" value={correctAnswers} />
                <StatCard label="Wrong Answers" value={wrongAnswers} />
            </section>

            <section className="rounded-xl border bg-white p-5">
                <h2 className="text-xl font-bold">Accuracy</h2>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                    {accuracy}%
                </p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-gray-200">
                    <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{
                            width: `${Math.min(100, Number(accuracy))}%`,
                        }}
                    />
                </div>
            </section>

            {sections.length > 0 && (
                <section className="space-y-4">
                    <h2 className="text-xl font-bold">
                        Section-wise Performance
                    </h2>

                    <div className="overflow-x-auto rounded-xl border bg-white">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-3">Section</th>
                                    <th className="p-3">Total</th>
                                    <th className="p-3">Attempted</th>
                                    <th className="p-3">Correct</th>
                                    <th className="p-3">Wrong</th>
                                    <th className="p-3">Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sections.map((section, index) => (
                                    <tr
                                        key={section._id || section.name || index}
                                        className="border-t"
                                    >
                                        <td className="p-3 font-medium">
                                            {section.name || `Section ${index + 1}`}
                                        </td>
                                        <td className="p-3">
                                            {section.totalQuestions ??
                                                section.total ??
                                                section.questions?.length ??
                                                "—"}
                                        </td>
                                        <td className="p-3">
                                            {section.attemptedQuestions ??
                                                section.attempted ??
                                                "—"}
                                        </td>
                                        <td className="p-3 text-green-700">
                                            {section.correctAnswers ??
                                                section.correct ??
                                                "—"}
                                        </td>
                                        <td className="p-3 text-red-600">
                                            {section.wrongAnswers ??
                                                section.incorrectAnswers ??
                                                section.wrong ??
                                                "—"}
                                        </td>
                                        <td className="p-3 font-semibold">
                                            {section.score ??
                                                section.marksObtained ??
                                                "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            <footer className="flex flex-wrap gap-3">
                <button
                    onClick={() => router.push("/full-length-exams")}
                    className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white"
                >
                    Back to Exams
                </button>

                <button
                    onClick={() => router.push("/")}
                    className="rounded-lg border px-5 py-3 font-semibold"
                >
                    Home
                </button>
            </footer>
        </main>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
                {value ?? "—"}
            </p>
        </div>
    );
}
