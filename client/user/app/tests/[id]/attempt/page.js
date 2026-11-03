"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";
import { apiRequest } from "@/lib/api";
import {
  Clock,
  Maximize,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
  BookOpen,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import SafeRichText from "@/components/SafeRichText";

export default function AttemptPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const attemptId = searchParams.get("attemptId");
  const initialLanguage = searchParams.get("language") === "hi" ? "hi" : "en";

  const [language, setLanguage] = useState(initialLanguage);

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const { darkMode, isThemeReady } = useTheme();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [visitedQuestions, setVisitedQuestions] = useState([0]);

  const autoSubmitTriggered = useRef(false);

  const storageKey = `test-answers-${id}-${attemptId}`;
  const timerExpiryKey = `test-timer-expiry-${id}-${attemptId}`;

  const answeredCount = Object.values(answers).filter(
    (answer) => Number.isInteger(answer) && answer >= 0 && answer <= 3
  ).length;

  // Update language in URL without creating a new attempt.
  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);

    const params = new URLSearchParams(searchParams.toString());
    params.set("language", nextLanguage);

    router.replace(`/tests/${id}/attempt?${params.toString()}`, {
      scroll: false,
    });
  };

  useEffect(() => {
    setVisitedQuestions((previous) =>
      previous.includes(currentIndex)
        ? previous
        : [...previous, currentIndex]
    );
  }, [currentIndex]);

  // Load questions, saved answers and timer.
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

        const savedAnswers = localStorage.getItem(storageKey);

        if (savedAnswers) {
          try {
            setAnswers(JSON.parse(savedAnswers));
          } catch (error) {
            console.error("Failed to parse saved answers", error);
          }
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

        const durationMinutes =
          testData.test?.durationMinutes ||
          testData.durationMinutes ||
          0;

        const totalDurationSeconds = durationMinutes * 60;
        const savedExpiry = localStorage.getItem(timerExpiryKey);
        const now = Date.now();

        if (savedExpiry) {
          const remainingSeconds = Math.max(
            0,
            Math.round((parseInt(savedExpiry, 10) - now) / 1000)
          );

          setTimeLeft(remainingSeconds);
        } else {
          const expiryTime = now + totalDurationSeconds * 1000;

          localStorage.setItem(timerExpiryKey, expiryTime.toString());
          setTimeLeft(totalDurationSeconds);
        }
      } catch (error) {
        console.error(error);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [id, attemptId, router, storageKey, timerExpiryKey]);

  // Countdown timer.
  useEffect(() => {
    if (loading || questions.length === 0 || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      const savedExpiry = localStorage.getItem(timerExpiryKey);

      if (savedExpiry) {
        const remaining = Math.max(
          0,
          Math.round((parseInt(savedExpiry, 10) - Date.now()) / 1000)
        );

        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, questions.length, timeLeft, timerExpiryKey]);

  // Automatically submit when timer expires.
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

  // Store option index, not translated option text.
  const handleAnswer = (optionIndex) => {
    const question = questions[currentIndex];

    setAnswers((previous) => {
      const updated = {
        ...previous,
        [question._id]: optionIndex,
      };

      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      const formattedAnswers = questions.map((question) => ({
        question: question._id,
        selectedAnswer: answers[question._id] ?? -1,
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

      localStorage.removeItem(storageKey);
      localStorage.removeItem(timerExpiryKey);

      router.replace(
        `/tests/${id}/result?attemptId=${attemptId}&language=${language}`
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

  if (!isThemeReady) {
    return <main className="theme-loading" />;
  }

  if (loading) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center ${
          darkMode
            ? "bg-zinc-950 text-white"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        <ThreeDots color={darkMode ? "#10b981" : "#059669"} />
      </main>
    );
  }

  if (!questions.length) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center ${
          darkMode
            ? "bg-zinc-950 text-zinc-400"
            : "bg-gray-50 text-gray-700"
        }`}
      >
        <p>No questions found.</p>
      </main>
    );
  }

  const question = questions[currentIndex];
  const selectedAnswer = answers[question._id];

  const questionText =
    typeof question.questionText === "string"
      ? question.questionText
      : question.questionText?.[language] ||
        question.questionText?.en ||
        "";

  const getOptionText = (option) => {
    if (typeof option === "string") return option;
    return option?.[language] || option?.en || "";
  };

  return (
    <main
      className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
        darkMode
          ? "bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-white"
          : "bg-gray-50/70 text-gray-900 selection:bg-emerald-500 selection:text-white"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-40 flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-2 backdrop-blur-md transition-colors duration-300 ${
          darkMode
            ? "bg-zinc-900/90 text-white"
            : "border-b border-gray-200 bg-white/90 text-gray-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center font-bold ${
              darkMode
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-emerald-50 border border-emerald-200 text-emerald-600"
            }`}
          >
            <BookOpen className="w-4 h-4" />
          </div>

          <div>
            <h1 className="text-sm font-bold tracking-tight">
              SubjectWise Quiz
            </h1>
            <p
              className={`text-[11px] font-medium ${
                darkMode ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              Live Test Session
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Timer */}
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-xs font-bold ${
              darkMode
                ? "bg-zinc-800/80 text-emerald-400"
                : "bg-emerald-50 border border-emerald-200 text-emerald-700"
            }`}
          >
            <Clock
              className={`w-3.5 h-3.5 animate-pulse ${
                darkMode ? "text-emerald-400" : "text-emerald-600"
              }`}
            />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Submit */}
          <button
            type="button"
            onClick={() => setShowSubmitModal(true)}
            className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit Test</span>
          </button>

          {/* Fullscreen */}
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
            className={`cursor-pointer hidden md:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              darkMode
                ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Maximize className="w-3.5 h-3.5 text-gray-400" />
            <span>Fullscreen</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto flex max-w-7xl w-full gap-6 px-4 sm:px-6 py-6 flex-1">
        {/* Question Area */}
        <div className="min-w-0 flex-1 flex flex-col justify-between">
          <div>
            {/* Question Status, Language Toggle & Navigation */}
            <div
              className={`mb-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium px-5 py-3 rounded-2xl ${
                darkMode
                  ? "bg-zinc-900 text-zinc-300 shadow-xl shadow-zinc-950/40"
                  : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-2 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Question{" "}
                  <strong className={darkMode ? "text-white" : "text-gray-900"}>
                    {currentIndex + 1}
                  </strong>{" "}
                  of{" "}
                  <strong className={darkMode ? "text-white" : "text-gray-900"}>
                    {questions.length}
                  </strong>
                </span>

                <span
                  className={`hidden sm:flex items-center gap-1.5 font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                    darkMode
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Answered {answeredCount} / {questions.length}
                </span>
              </div>

              {/* Language Toggle */}
              <div
                className={`inline-flex rounded-xl p-1 border shadow-xs ${
                  darkMode
                    ? "bg-zinc-950 border-zinc-800"
                    : "bg-gray-100 border-gray-200/80"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleLanguageChange("en")}
                  aria-pressed={language === "en"}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    language === "en"
                      ? "bg-emerald-600 text-white shadow-sm scale-105"
                      : darkMode
                        ? "text-zinc-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  English
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageChange("hi")}
                  aria-pressed={language === "hi"}
                  className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    language === "hi"
                      ? "bg-emerald-600 text-white shadow-sm scale-105"
                      : darkMode
                        ? "text-zinc-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  हिंदी
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((previous) => previous - 1)}
                  className={`cursor-pointer flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none ${
                    darkMode
                      ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={currentIndex === questions.length - 1}
                  onClick={() => setCurrentIndex((previous) => previous + 1)}
                  className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <style jsx global>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>

            {/* Question and Options */}
            <div
              className={`rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-950/40 transition-colors duration-300 max-h-[calc(100vh-210px)] overflow-y-auto hide-scrollbar ${
                darkMode
                  ? "bg-zinc-900 text-zinc-100"
                  : "border border-gray-200 bg-white text-gray-900"
              }`}
            >
              <SafeRichText
                html={questionText}
                className="text-base sm:text-lg font-bold"
              />

              <div className="mt-6 space-y-3">
                {question.options.map((option, index) => {
                  const optionText = getOptionText(option);
                  const isSelected = selectedAnswer === index;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAnswer(index)}
                      className={`cursor-pointer w-full rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition-all flex items-center gap-3.5 ${
                        isSelected
                          ? darkMode
                            ? "bg-emerald-500/20 text-white font-semibold shadow-xs"
                            : "border border-emerald-600 bg-emerald-50/90 text-emerald-950 shadow-xs font-semibold"
                          : darkMode
                            ? "bg-zinc-950/70 text-zinc-300 hover:bg-zinc-800/80 hover:text-white"
                            : "border border-gray-200 bg-white text-gray-700 hover:border-emerald-400 hover:bg-gray-50/60 hover:text-gray-900"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                          isSelected
                            ? "bg-emerald-500 text-zinc-950 shadow-xs font-black"
                            : darkMode
                              ? "bg-zinc-900 text-zinc-400"
                              : "border border-gray-200 bg-gray-100 text-gray-600"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </span>

                      <span className="flex-1">
                        {optionText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Question Palette */}
          <div
            className={`mt-4 rounded-2xl p-4 lg:hidden shadow-xl shadow-zinc-950/40 ${
              darkMode
                ? "bg-zinc-900 text-white"
                : "border border-gray-200 bg-white text-gray-900"
            }`}
          >
            <h2
              className={`text-[11px] font-bold uppercase tracking-wider mb-2.5 ${
                darkMode ? "text-zinc-400" : "text-gray-500"
              }`}
            >
              Questions Navigation
            </h2>

            <div className="flex flex-wrap gap-1.5">
              {questions.map((item, index) => {
                const answered =
                  Number.isInteger(answers[item._id]) &&
                  answers[item._id] >= 0;

                const current = index === currentIndex;

                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`cursor-pointer flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      answered
                        ? "bg-emerald-600 text-white shadow-xs"
                        : darkMode
                          ? "bg-zinc-950 text-zinc-300"
                          : "border border-gray-200 bg-white text-gray-700"
                    } ${
                      current
                        ? "ring-2 ring-emerald-500 ring-offset-1 " +
                          (darkMode
                            ? "ring-offset-zinc-900"
                            : "ring-offset-white")
                        : ""
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Desktop Question Palette */}
        <aside
          className={`hidden w-56 shrink-0 rounded-3xl p-4 lg:flex shadow-xl shadow-zinc-950/40 flex-col justify-between self-start sticky top-24 transition-colors duration-300 ${
            darkMode
              ? "bg-zinc-900 text-white"
              : "border border-gray-200 bg-white text-gray-900"
          }`}
        >
          <div>
            <div
              className={`flex items-center justify-between pb-2.5 ${
                darkMode
                  ? "border-b border-zinc-800"
                  : "border-b border-gray-100"
              }`}
            >
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">
                Questions
              </h2>

              <span className="text-[11px] font-semibold opacity-60">
                Total: {questions.length}
              </span>
            </div>

            <div className="mt-3.5 grid grid-cols-5 gap-1.5 max-h-[calc(100vh-280px)] overflow-y-auto hide-scrollbar">
              {questions.map((item, index) => {
                const answered =
                  Number.isInteger(answers[item._id]) &&
                  answers[item._id] >= 0;

                const current = index === currentIndex;

                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`cursor-pointer flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                      answered
                        ? "bg-emerald-600 text-white shadow-xs"
                        : darkMode
                          ? "bg-zinc-950 text-zinc-300 hover:bg-zinc-800"
                          : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                    } ${
                      current
                        ? "ring-2 ring-emerald-500 ring-offset-1 scale-105 font-extrabold " +
                          (darkMode
                            ? "ring-offset-zinc-900"
                            : "ring-offset-white")
                        : ""
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={`mt-4 pt-3 space-y-1.5 text-[11px] font-medium ${
              darkMode
                ? "border-t border-zinc-800 text-zinc-400"
                : "border-t border-gray-100 text-gray-600"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" />
                <span>Answered</span>
              </div>

              <span
                className={`font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {answeredCount}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-sm ${
                    darkMode
                      ? "bg-zinc-950"
                      : "border border-gray-300 bg-gray-50"
                  }`}
                />
                <span>Not Answered</span>
              </div>

              <span
                className={`font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {questions.length - answeredCount}
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-xs">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-modal-title"
            className={`w-full max-w-md rounded-3xl p-6 shadow-2xl transition-colors duration-300 ${
              darkMode
                ? "bg-zinc-900 text-white shadow-zinc-950"
                : "border border-gray-200 bg-white text-gray-900 shadow-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 ${
                darkMode
                  ? "border-b border-zinc-800"
                  : "border-b border-gray-100"
              }`}
            >
              <h2
                id="submit-modal-title"
                className="text-lg font-bold flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5 text-emerald-500" />
                Ready to Submit Test?
              </h2>

              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p
              className={`mt-2.5 text-xs ${
                darkMode ? "text-zinc-400" : "text-gray-500"
              }`}
            >
              Please review your summary below before final submission. Once
              submitted, answers cannot be modified.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div
                className={`rounded-2xl p-3 ${
                  darkMode
                    ? "bg-zinc-950/60"
                    : "border border-gray-200 bg-gray-50"
                }`}
              >
                <p
                  className={`text-[11px] font-medium ${
                    darkMode ? "text-zinc-400" : "text-gray-500"
                  }`}
                >
                  Total Questions
                </p>
                <p
                  className={`mt-1 text-xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {questions.length}
                </p>
              </div>

              <div
                className={`rounded-2xl p-3 ${
                  darkMode
                    ? "bg-emerald-950/30 text-emerald-400"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                <p className="text-[11px] font-medium opacity-80">Attempted</p>
                <p className="mt-1 text-xl font-bold">{answeredCount}</p>
              </div>

              <div
                className={`rounded-2xl p-3 ${
                  darkMode
                    ? "bg-rose-950/30 text-rose-400"
                    : "border border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                <p className="text-[11px] font-medium opacity-80">
                  Not Attempted
                </p>
                <p className="mt-1 text-xl font-bold">
                  {questions.length - answeredCount}
                </p>
              </div>

              <div
                className={`rounded-2xl p-3 ${
                  darkMode
                    ? "bg-zinc-950/60"
                    : "border border-gray-200 bg-gray-50"
                }`}
              >
                <p
                  className={`text-[11px] font-medium ${
                    darkMode ? "text-zinc-400" : "text-gray-500"
                  }`}
                >
                  Not Visited
                </p>
                <p
                  className={`mt-1 text-xl font-bold ${
                    darkMode ? "text-zinc-300" : "text-gray-700"
                  }`}
                >
                  {questions.length - visitedQuestions.length}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-2.5">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowSubmitModal(false)}
                className={`cursor-pointer flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all disabled:opacity-50 ${
                  darkMode
                    ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Resume Test
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(false)}
                className="cursor-pointer flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {submitting ? (
                  <span className="inline-flex items-center justify-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white" />
                  </span>
                ) : (
                  <>
                    <span>Confirm Submit</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}