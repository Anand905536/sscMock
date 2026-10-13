"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ExploreExamPage() {
  const router = useRouter();
  const params = useParams();

  const category = String(params.category || "").toLowerCase();
  const examSlug = decodeURIComponent(
    String(params.exam || "")
  ).toLowerCase();

  const [activeTab, setActiveTab] = useState("mock");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const examName = examSlug
    .split("-")
    .map((word) => word.toUpperCase())
    .join(" ");

  useEffect(() => {
    let cancelled = false;

    const fetchTests = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const query = new URLSearchParams({
          exam: examSlug,
        });

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [sectionalResponse, fullLengthResponse] =
          await Promise.all([
            fetch(
              `http://localhost:5000/api/tests?${query.toString()}`,
              { headers }
            ),
            fetch(
              `http://localhost:5000/api/full-length-exams?${query.toString()}`,
              { headers }
            ),
          ]);

        const sectionalData = await sectionalResponse.json();
        const fullLengthData = await fullLengthResponse.json();

        if (!sectionalResponse.ok) {
          throw new Error(
            sectionalData.message ||
              "Failed to fetch sectional tests"
          );
        }

        if (!fullLengthResponse.ok) {
          throw new Error(
            fullLengthData.message ||
              "Failed to fetch full-length exams"
          );
        }

        const sectionalList = Array.isArray(sectionalData)
          ? sectionalData
          : sectionalData.tests || [];

        const fullLengthList = Array.isArray(fullLengthData)
          ? fullLengthData
          : fullLengthData.exams || [];

        const sectionalTests = sectionalList.map((test) => ({
          ...test,
          isFullLength: false,
          duration: test.durationMinutes,
          questionsCount:
            test.questionsCount ??
            test.totalQuestions ??
            (Array.isArray(test.questions)
              ? test.questions.length
              : 0),
        }));

        const fullLengthTests = fullLengthList.map((exam) => {
          const sections = exam.sections || [];

          return {
            ...exam,
            isFullLength: true,
            questionsCount: sections.reduce(
              (sum, section) =>
                sum + (section.questions || []).length,
              0
            ),
            duration: sections.reduce(
              (sum, section) =>
                sum + Number(section.durationMinutes || 0),
              0
            ),
            totalMarks: sections.reduce(
              (sum, section) =>
                sum +
                (section.questions || []).length *
                  Number(section.marksPerQuestion || 0),
              0
            ),
          };
        });

        if (!cancelled) {
          setTests([...sectionalTests, ...fullLengthTests]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load tests");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (category && examSlug) {
      fetchTests();
    }

    return () => {
      cancelled = true;
    };
  }, [category, examSlug, router]);

  const mockTests = useMemo(
    () =>
      tests.filter(
        (test) =>
          String(test.type || "").toLowerCase() === "mock"
      ),
    [tests]
  );

  const pyqTests = useMemo(
    () =>
      tests.filter((test) =>
        ["pyq", "previous-year", "previous_year"].includes(
          String(test.type || "").toLowerCase()
        )
      ),
    [tests]
  );

  const activeList =
    activeTab === "mock" ? mockTests : pyqTests;

  const handleStartTest = (test) => {
    const testId = test._id || test.id;

    if (!testId) return;

    if (test.isFullLength) {
      router.push(`/full-length-exams/${testId}`);
    } else {
      router.push(`/tests/${testId}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
            {category}
          </p>

          <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
            {examName} Tests
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Practice mock tests and previous-year papers for{" "}
            {examName}.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("mock")}
            className={`rounded-2xl px-5 py-3 text-sm font-extrabold transition ${
              activeTab === "mock"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            📝 Mock Tests ({mockTests.length})
          </button>

          <button
            onClick={() => setActiveTab("pyq")}
            className={`rounded-2xl px-5 py-3 text-sm font-extrabold transition ${
              activeTab === "pyq"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            📚 Previous Year Papers ({pyqTests.length})
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-slate-500">
            Loading {examName} tests...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-white p-6 text-rose-700">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 font-bold underline"
            >
              Retry
            </button>
          </div>
        ) : activeList.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="font-bold text-slate-800">
              No{" "}
              {activeTab === "mock"
                ? "mock tests"
                : "previous-year papers"}{" "}
              available
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              No tests have been added for {examName} in this section yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeList.map((test) => {
              const testId = test._id || test.id;

              const totalMarks = Number(
                test.totalMarks ??
                  test.totalMarksPossible ??
                  0
              );

              const questions =
                test.questionsCount ??
                test.totalQuestions ??
                (Array.isArray(test.questions)
                  ? test.questions.length
                  : 0);

              const duration = test.duration
                ? typeof test.duration === "number"
                  ? `${test.duration} Mins`
                  : test.duration
                : "Duration not specified";

              const attempt = test.lastAttempt;
              const score = Number(attempt?.scored ?? 0);
              const hasAttempted = attempt?.scored != null;
              const passingMarks = Number(
                test.passingMarks ?? 0
              );
              const passed = score >= passingMarks;

              const percentage =
                hasAttempted && totalMarks > 0
                  ? Math.min(
                      Math.max(
                        (score / totalMarks) * 100,
                        0
                      ),
                      100
                    )
                  : 0;

              return (
                <article
                  key={testId}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-extrabold text-slate-900">
                        {test.title || test.name || "Untitled Test"}
                      </h2>

                      <p className="mt-2 text-xs font-medium text-slate-500">
                        {questions} Questions ·{" "}
                        {totalMarks || "—"} Total Marks ·{" "}
                        {duration}
                      </p>

                      {hasAttempted ? (
                        <div className="mt-4 max-w-md border-t border-slate-100 pt-3">
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                            <span className="text-slate-600">
                              Previous Score: {score}/
                              {totalMarks || "—"}
                            </span>

                            <span
                              className={`rounded-md px-2 py-1 ${
                                passed
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {passed ? "PASSED" : "NOT PASSED"} (
                              {Math.round(percentage)}%)
                            </span>
                          </div>

                          <div className="h-3.5 overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-0.5">
                            <div
                              style={{ width: `${percentage}%` }}
                              className={`h-full rounded-full ${
                                passed
                                  ? "bg-emerald-500"
                                  : "bg-rose-500"
                              }`}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="mt-3 text-xs font-medium text-slate-400">
                          Not attempted yet. Start this test to check your score.
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                      <button
                        onClick={() => handleStartTest(test)}
                        disabled={!testId}
                        className="rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-black text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {hasAttempted ? "Re-Take Test" : "Attempt Test"}
                      </button>

                      {hasAttempted && attempt.date && (
                        <span className="text-[11px] text-slate-400">
                          Last attempt: {attempt.date}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
