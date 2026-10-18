"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, HelpCircle, Award, CheckCircle2, RotateCcw, Play, BookOpen, Layers } from "lucide-react";

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
  const [inProgressByExamId, setInProgressByExamId] = useState({});

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

        const [sectionalResponse, fullLengthResponse, attemptsResponse] =
          await Promise.all([
            fetch(
              `http://localhost:5000/api/tests?${query.toString()}`,
              { headers }
            ),
            fetch(
              `http://localhost:5000/api/full-length-exams?${query.toString()}`,
              { headers }
            ),
            fetch(
              `http://localhost:5000/api/full-length-exams/previous`,
              { headers }
            ),
          ]);

        const sectionalData = await sectionalResponse.json();
        const fullLengthData = await fullLengthResponse.json();
        const attemptsData = attemptsResponse.ok ? await attemptsResponse.json() : { attempts: [] };

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

        const isAttemptStillActive = (attempt) => {
          const status = String(attempt?.status || "")
            .toLowerCase()
            .replace(/[ _]+/g, "-");
          const hasSubmissionTimestamp = Boolean(
            attempt?.submittedAt || attempt?.completedAt || attempt?.endedAt
          );
          return ["in-progress", "inprogress", "started"].includes(status) && !hasSubmissionTimestamp;
        };
        const activeAttempts = (attemptsData.attempts || []).filter(isAttemptStillActive);
        const activeByExamId = {};
        for (const attempt of activeAttempts) {
          const examRef = attempt.exam?._id || attempt.exam;
          if (examRef && !activeByExamId[String(examRef)]) {
            activeByExamId[String(examRef)] = attempt;
          }
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
          const activeAttempt = activeByExamId[String(exam._id)];

          return {
            ...exam,
            inProgressAttempt: activeAttempt || null,
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
          setInProgressByExamId(activeByExamId);
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
      if (test.inProgressAttempt) {
        // Existing in-progress attempts are resumed directly, without creating a new attempt.
        router.push(`/full-length-exams/${test._id}`);
      } else {
        router.push(`/full-length-exams/${test._id}/instructions`);
      }
    } else {
      router.push(`/tests/${testId}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/60 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Exam Title & Header Banner */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200/60">
            <Layers className="w-3.5 h-3.5" /> {category}
          </span>

          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {examName} Series
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Practice exam-level mock tests and solved previous-year papers tailored for {examName}.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab("mock")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "mock"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Mock Tests ({mockTests.length})
          </button>

          <button
            onClick={() => setActiveTab("pyq")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "pyq"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            <Award className="w-4 h-4" /> Previous Year Papers ({pyqTests.length})
          </button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-semibold text-slate-500">
            Loading {examName} test series...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-rose-700">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 font-bold underline text-xs"
            >
              Retry Loading
            </button>
          </div>
        ) : activeList.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <h2 className="font-bold text-slate-800">
              No {activeTab === "mock" ? "mock tests" : "previous-year papers"} available
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              No tests have been added for {examName} in this section yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
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
                : "Standard Duration";

              const attempt = test.lastAttempt;
              const score = Number(attempt?.scored ?? 0);
              const hasAttempted = attempt?.scored != null;
              const passingMarks = Number(test.passingMarks ?? 0);
              const passed = score >= passingMarks;

              const percentage =
                hasAttempted && totalMarks > 0
                  ? Math.min(
                      Math.max((score / totalMarks) * 100, 0),
                      100
                    )
                  : 0;

              return (
                <article
                  key={testId}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4.5 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-md"
                >
                  {/* Test Info (Left) */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {test.title || test.name || "Untitled Test"}
                      </h2>
                      {test.isFullLength && (
                        <span className="shrink-0 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 border border-indigo-200/60">
                          Full Length
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> {questions} Qs
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-400" /> {totalMarks || "—"} Marks
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {duration}
                      </span>
                    </div>

                    {/* Attempt Status Bar */}
                    {hasAttempted && (
                      <div className="pt-1 flex items-center gap-3 text-xs">
                        <span className="font-semibold text-slate-700">
                          Score: {score}/{totalMarks || "—"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            passed
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                              : "bg-rose-50 text-rose-700 border border-rose-200/60"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" /> {passed ? "PASSED" : "FAILED"} ({Math.round(percentage)}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions (Right) */}
                  <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
                    {hasAttempted && attempt.date && (
                      <span className="hidden lg:inline text-[11px] font-medium text-slate-400">
                        {attempt.date}
                      </span>
                    )}

                    <button
                      onClick={() => handleStartTest(test)}
                      disabled={!testId}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm ${
                        test.isFullLength && test.inProgressAttempt
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : hasAttempted
                            ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-900/10"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {test.isFullLength && test.inProgressAttempt ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" /> Resume Test
                        </>
                      ) : test.isFullLength ? (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" /> Start Test
                        </>
                      ) : hasAttempted ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" /> Re-Take Test
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" /> Start Test
                        </>
                      )}
                    </button>
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