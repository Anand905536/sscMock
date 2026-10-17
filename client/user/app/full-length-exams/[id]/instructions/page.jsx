
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";

const API = "http://localhost:5000/api/full-length-exams";

export default function ExamInstructionsPage() {
    const params = useParams();
    const router = useRouter();
    const examId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [exam, setExam] = useState(null);
    const [accepted, setAccepted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadExam() {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                const response = await fetch(`${API}/${examId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Exam doesn't load");
                }

                if (!Array.isArray(data.sections)) {
                    throw new Error("Exam sections doesn't load");
                }

                if (!cancelled) setExam(data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (examId) loadExam();

        return () => {
            cancelled = true;
        };
    }, [examId, router]);

    if (loading) {
        return <main className="p-8 flex justify-center"><div><ThreeDots/></div></main>;
    }

    if (error || !exam) {
        return (
            <main className="mx-auto max-w-3xl p-6">
                <p className="text-red-600">{error || "Exam nahi mila."}</p>
                <button
                    onClick={() => {
                        if (exam?.category && exam?.exam) {
                            router.push(`/tests/exam/${encodeURIComponent(exam.category.trim().toLowerCase())}/${encodeURIComponent(exam.exam.trim().toLowerCase())}`);
                        } else {
                            router.push("/tests");
                        }
                    }}
                    className="mt-4 rounded-lg border px-4 py-2"
                >
                    Go Back
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
        <main className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="mx-auto max-w-3xl space-y-6">
                <header className="rounded-2xl bg-indigo-700 p-6 text-white sm:p-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
                        {exam.category} • {exam.exam}
                    </p>
                    <h1 className="mt-2 text-3xl font-bold">{exam.title}</h1>
                    <p className="mt-2 text-indigo-100">
                        Test shuru karne se pehle instructions dhyan se padhein.
                    </p>
                </header>

                <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <InfoCard label="Total Questions" value={totalQuestions} />
                    <InfoCard label="Total Duration" value={`${totalMinutes} min`} />
                    <InfoCard label="Total Sections" value={exam.sections.length} />
                    <InfoCard label="Maximum Marks" value={totalMarks} />
                </section>

                <section className="space-y-4 rounded-2xl border bg-white p-5 sm:p-7">
                    <h2 className="text-xl font-bold">Exam Instructions</h2>

                    <ol className="list-decimal space-y-3 pl-5 text-gray-700">
                        <li>Test start karne ke baad timer chalna shuru ho jayega.</li>
                        <li>Har section ka apna time limit hai.</li>
                        <li>Section ka time khatam hone par agle section par jaana pad sakta hai.</li>
                        <li>Har question ke liye ek option select kar sakte hain.</li>
                        <li>Negative marking section ke marking scheme ke according hogi.</li>
                        <li>Submit karne se pehle answers ka summary aur attempted questions check kar sakte hain.</li>
                        <li>Final submission ke baad answers change nahi kar sakte.</li>
                    </ol>

                    <div className="border-t pt-5">
                        <h3 className="font-semibold">Section-wise marking scheme</h3>

                        <div className="mt-3 space-y-2">
                            {exam.sections.map((section, index) => (
                                <div
                                    key={section._id || index}
                                    className="flex flex-wrap justify-between gap-2 rounded-lg bg-gray-50 p-3 text-sm"
                                >
                                    <span className="font-medium">{section.name}</span>
                                    <span className="text-gray-600">
                                        {section.durationMinutes} min · +
                                        {section.marksPerQuestion} correct · -
                                        {section.negativeMarks} incorrect
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border bg-white p-5 sm:p-7">
                    <h2 className="text-xl font-bold">Terms and Conditions</h2>

                    <label className="mt-4 flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(event) => setAccepted(event.target.checked)}
                            className="mt-1 h-5 w-5 accent-indigo-600"
                        />
                        <span className="text-sm leading-6 text-gray-700">
                            Main confirm karta/karti hoon ki maine exam instructions
                            padh li hain aur main test ke rules, timer, marking scheme
                            aur final submission conditions ko samajhta/samajhti hoon.
                            Main test shuru karne ke liye sahmat hoon.
                        </span>
                    </label>
                </section>

                <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                    <button
                        type="button"
                        onClick={() => {
                            if (exam?.category && exam?.exam) {
                                router.push(`/tests/exam/${encodeURIComponent(exam.category.trim().toLowerCase())}/${encodeURIComponent(exam.exam.trim().toLowerCase())}`);
                            } else {
                                router.push("/tests");
                            }
                        }}
                        className="rounded-lg border bg-white px-5 py-3 font-semibold"
                    >
                        Back to Exams
                    </button>

                    <button
                        type="button"
                        disabled={!accepted}
                        onClick={() =>
                            router.push(`/full-length-exams/${exam._id}`)
                        }
                        className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Accept & Start Test
                    </button>
                </footer>
            </div>
        </main>
    );
}

function InfoCard({ label, value }) {
    return (
        <div className="rounded-xl border bg-white p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-xl font-bold">{value}</p>
        </div>
    );
}
