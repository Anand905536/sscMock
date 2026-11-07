"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { ThreeDots } from "react-loader-spinner";
import { apiRequest } from "@/lib/api";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import SafeRichText from "@/components/SafeRichText";

// Separates the shared Cloze passage from the instruction for the current blank.
function splitClozeQuestion(html) {
  if (typeof html !== "string" || !html.trim()) {
    return { passage: "", prompt: "" };
  }

  const promptPattern =
    /(fill\s+in\s+the\s+blank|identify\s+the\s+correct|choose\s+the\s+correct|select\s+the\s+correct|which\s+(?:word|preposition|option|phrase)|correct\s+(?:word|preposition|option))/i;
  const paragraphs = [...html.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)];
  const lastParagraph = paragraphs[paragraphs.length - 1];

  if (lastParagraph && promptPattern.test(lastParagraph[0])) {
    const paragraphHtml = lastParagraph[0];
    const keywordMatch = promptPattern.exec(paragraphHtml);
    const breakIndex = paragraphHtml.lastIndexOf("<br", keywordMatch.index);

    // Passage and instruction are sometimes stored in one paragraph with a <br>.
    if (breakIndex >= 0) {
      const passagePart = paragraphHtml.slice(0, breakIndex).trim();
      const promptPart = paragraphHtml
        .slice(breakIndex)
        .replace(/^<br\s*\/?\s*>/i, "")
        .replace(/<\/p>\s*$/i, "")
        .trim();
      return {
        passage: `${html.slice(0, lastParagraph.index)}${passagePart}`.trim(),
        prompt: promptPart,
      };
    }

    if (lastParagraph.index === 0) {
      return { passage: html, prompt: "" };
    }

    return {
      passage: html.slice(0, lastParagraph.index).trim(),
      prompt: paragraphHtml.trim(),
    };
  }

  // Some question records append the instruction after a line break
  // instead of wrapping it in its own paragraph.
  const keywordMatch = promptPattern.exec(html);
  if (keywordMatch) {
    const breakIndex = html.lastIndexOf("<br", keywordMatch.index);
    if (breakIndex >= 0) {
      return {
        passage: html.slice(0, breakIndex).trim(),
        prompt: html.slice(breakIndex).replace(/^<br\s*\/?\s*>/i, "").trim(),
      };
    }
  }

  return { passage: html, prompt: "" };
}

export default function AnalysisPage() {
  const { id, attemptId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { darkMode, isThemeReady } = useTheme();

  const language =
    searchParams.get("language") === "hi" ? "hi" : "en";

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

        const data = await apiRequest(
          `/attempts/${attemptId}/result`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setResult(data.result);
      } catch (error) {
        console.error(error);
        alert(error.message || "Something went wrong");

        router.push(
          `/tests/${id}/result?attemptId=${attemptId}&language=${language}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId, id, router, language]);

  if (!isThemeReady) {
    return <main className="theme-loading" />;
  }

  if (loading) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center ${
          darkMode
            ? "bg-zinc-950 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <ThreeDots color={darkMode ? "#10b981" : "#059669"} />
      </main>
    );
  }

  if (!result) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center ${
          darkMode
            ? "bg-zinc-950 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <p className={darkMode ? "text-zinc-400" : "text-gray-500"}>
          Analysis not found.
        </p>
      </main>
    );
  }

  const questionResults = result.questionResults || [];
  const isClozeTest = [
    result.test?.topic,
    result.test?.title,
  ].some((value) => String(value || "").toLowerCase().includes("cloze"));

  const getLanguageText = (value) => {
    if (typeof value === "string") {
      return value;
    }

    if (!value || typeof value !== "object") {
      return "";
    }

    return value[language] || value.en || value.hi || "";
  };

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-white"
          : "bg-gray-50 text-gray-900 selection:bg-emerald-500 selection:text-white"
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 ${
          darkMode
            ? "bg-zinc-900/90 border-b border-zinc-800 text-white"
            : "border-b border-gray-200 bg-white/90 text-gray-900"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div>
            <h1 className="font-bold text-sm sm:text-base tracking-tight">
              {result.test?.title}
            </h1>

            <p
              className={`text-[11px] font-medium ${
                darkMode ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              Detailed Question Analysis
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/tests/${id}/result?attemptId=${attemptId}&language=${language}`
              )
            }
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-xs ${
              darkMode
                ? "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Result</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Question Analysis */}
          <section
            className={`rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-950/40 transition-colors duration-300 ${
              darkMode
                ? "bg-zinc-900 text-zinc-100"
                : "border border-gray-200 bg-white text-gray-900"
            }`}
          >
            {(() => {
              const question = questionResults[currentQuestion];

              if (!question) {
                return (
                  <p className={darkMode ? "text-zinc-400" : "text-gray-500"}>
                    Question not found.
                  </p>
                );
              }

              const clozeContent = isClozeTest
                ? splitClozeQuestion(getLanguageText(question.questionText))
                : { passage: getLanguageText(question.questionText), prompt: "" };

              return (
                <>
                  {/* Top Navigation Strip */}
                  <div
                    className={`mb-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium px-5 py-3 rounded-2xl ${
                      darkMode
                        ? "bg-zinc-950/60 text-zinc-300"
                        : "bg-gray-50 border border-gray-200 text-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>
                        Question{" "}
                        <strong className={darkMode ? "text-white" : "text-gray-900"}>
                          {currentQuestion + 1}
                        </strong>{" "}
                        of{" "}
                        <strong className={darkMode ? "text-white" : "text-gray-900"}>
                          {questionResults.length}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={currentQuestion === 0}
                        onClick={() =>
                          setCurrentQuestion((previous) => previous - 1)
                        }
                        className={`cursor-pointer flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none ${
                          darkMode
                            ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                            : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>

                      <button
                        type="button"
                        disabled={
                          currentQuestion === questionResults.length - 1
                        }
                        onClick={() =>
                          setCurrentQuestion((previous) => previous + 1)
                        }
                        className="cursor-pointer flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <style jsx global>{`
                    .chatgpt-text,
                    .chatgpt-text * {
                      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
                      font-size: 16px !important;
                      line-height: 1.5 !important;
                    }
                    .cloze-passage {
                      width: 100%;
                      text-align: justify;
                      text-justify: inter-word;
                      overflow-wrap: anywhere;
                    }
                    .cloze-passage p {
                      margin: 0 0 0.45rem;
                    }
                    .cloze-passage p:last-child {
                      margin-bottom: 0;
                    }
                    .hide-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                    .hide-scrollbar {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                  `}</style>

                  {/* Question and answer panels */}
                  <div
                    className={
                      isClozeTest
                        ? "grid grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1 gap-4 h-[calc(100vh-300px)] min-h-[360px] overflow-hidden"
                        : "max-h-[calc(100vh-340px)] overflow-y-auto hide-scrollbar pr-1"
                    }
                  >
                    {/* Question panel */}
                    <div
                      className={
                        isClozeTest
                          ? `min-h-0 min-w-0 overflow-y-auto hide-scrollbar overscroll-contain rounded-2xl p-3 sm:p-4 ${darkMode ? "bg-zinc-950/35" : "bg-gray-50"}`
                          : ""
                      }
                    >
                    {isClozeTest ? (
                      <div className="w-full min-w-0">
                        <SafeRichText
                          html={clozeContent.passage}
                          className={`chatgpt-text cloze-passage ${
                            darkMode ? "text-white" : "text-black"
                          }`}
                        />
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <SafeRichText
                            html={getLanguageText(question.questionText)}
                            className={`chatgpt-text ${
                              darkMode ? "text-white" : "text-black"
                            }`}
                          />
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                            question.status === "correct"
                              ? darkMode
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-green-100 text-green-700"
                              : question.status === "incorrect"
                                ? darkMode
                                  ? "bg-rose-500/15 text-rose-400"
                                  : "bg-red-100 text-red-700"
                                : darkMode
                                  ? "bg-zinc-800 text-zinc-400"
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
                    )}
                    </div>

                    {/* Answer panel */}
                    <div
                      className={
                        isClozeTest
                          ? `min-h-0 min-w-0 overflow-y-auto hide-scrollbar overscroll-contain rounded-2xl p-3 sm:p-4 ${darkMode ? "bg-zinc-950/35" : "bg-gray-50"}`
                          : ""
                      }
                    >
                    {isClozeTest && (
                      <div className={`mb-4 rounded-xl p-3 sm:p-4 ${darkMode ? "bg-zinc-900/80 text-zinc-100" : "bg-white text-gray-900 border border-gray-200"}`}>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <p className={`text-xs font-bold uppercase tracking-wide ${darkMode ? "text-emerald-400" : "text-emerald-700"}`}>
                            Question {currentQuestion + 1}
                          </p>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                              question.status === "correct"
                                ? darkMode
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-green-100 text-green-700"
                                : question.status === "incorrect"
                                  ? darkMode
                                    ? "bg-rose-500/15 text-rose-400"
                                    : "bg-red-100 text-red-700"
                                  : darkMode
                                    ? "bg-zinc-800 text-zinc-400"
                                    : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {question.status === "correct" ? "Solved" : question.status === "incorrect" ? "Wrong" : "Left"}
                          </span>
                        </div>
                        {clozeContent.prompt ? (
                          <SafeRichText html={clozeContent.prompt} className="chatgpt-text" />
                        ) : (
                          <p className="chatgpt-text">Review the correct option for this blank.</p>
                        )}
                      </div>
                    )}

                    {/* Options */}
                    <div className={`${isClozeTest ? "" : "mt-6"} space-y-3`}>
                      {question.options?.map((option, index) => {
                        const isCorrect =
                          index === Number(question.correctAnswer);

                        const isSelected =
                          index === Number(question.selectedAnswer);

                        return (
                          <div
                            key={index}
                            className={`rounded-2xl px-4 py-3.5 text-base font-medium transition-all ${
                              isCorrect
                                ? darkMode
                                  ? "bg-emerald-500/20 text-emerald-300 font-semibold shadow-xs"
                                  : "border border-green-300 bg-green-50 text-green-800 font-semibold"
                                : isSelected
                                  ? darkMode
                                    ? "bg-rose-500/20 text-rose-300 font-semibold shadow-xs"
                                    : "border border-red-300 bg-red-50 text-red-800 font-semibold"
                                  : darkMode
                                    ? "bg-zinc-950/70 text-zinc-300"
                                    : "border border-gray-200 text-gray-700"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex min-w-0 items-center gap-3">
                                <span
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                                    isCorrect
                                      ? "bg-emerald-500 text-zinc-950"
                                      : isSelected
                                        ? "bg-rose-500 text-white"
                                        : darkMode
                                          ? "bg-zinc-900 text-zinc-400"
                                          : "border border-gray-200 bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {String.fromCharCode(65 + index)}
                                </span>

                                <span className="chatgpt-text min-w-0">
                                  {getLanguageText(option)}
                                </span>
                              </span>

                              <div className="shrink-0 text-xs font-bold">
                                {isCorrect && (
                                  <span
                                    className={
                                      darkMode
                                        ? "text-emerald-400"
                                        : "text-green-700"
                                    }
                                  >
                                    Correct Answer
                                  </span>
                                )}

                                {isSelected && !isCorrect && (
                                  <span
                                    className={
                                      darkMode
                                        ? "text-rose-400"
                                        : "text-red-700"
                                    }
                                  >
                                    Your Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  {/* Explanation */}
                  {getLanguageText(question.explanation) && (
                    <div
                      className={`mt-6 rounded-2xl p-5 ${
                        darkMode
                          ? "bg-zinc-950/60 text-zinc-300 border border-zinc-800/80"
                          : "border border-gray-200 bg-gray-50 text-gray-700"
                      }`}
                    >
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${
                          darkMode ? "text-emerald-400" : "text-slate-700"
                        }`}
                      >
                        Explanation
                      </p>

                      <SafeRichText
                        html={getLanguageText(question.explanation)}
                        className={`chatgpt-text mt-2 ${
                          darkMode ? "text-zinc-300" : "text-gray-600"
                        }`}
                      />
                    </div>
                  )}
                    </div>
                  </div>
                </>
              );
            })()}
          </section>

          {/* Questions Navigation Sidebar */}
          <aside
            className={`rounded-3xl p-5 shadow-xl shadow-zinc-950/40 self-start sticky top-24 transition-colors duration-300 ${
              darkMode
                ? "bg-zinc-900 text-zinc-100"
                : "border border-gray-200 bg-white text-gray-900"
            }`}
          >
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">
              Questions Navigation
            </h2>

            <div className="mt-3.5 grid grid-cols-5 gap-1.5 max-h-[calc(100vh-280px)] overflow-y-auto hide-scrollbar">
              {questionResults.map((question, index) => (
                <button
                  key={question.questionId || index}
                  type="button"
                  onClick={() => setCurrentQuestion(index)}
                  className={`cursor-pointer flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                    index === currentQuestion
                      ? "ring-2 ring-emerald-500 ring-offset-1 scale-105 font-extrabold " +
                        (darkMode
                          ? "ring-offset-zinc-900"
                          : "ring-offset-white")
                      : ""
                  } ${
                    question.status === "correct"
                      ? darkMode
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-green-100 text-green-700"
                      : question.status === "incorrect"
                        ? darkMode
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-red-100 text-red-700"
                        : darkMode
                          ? "bg-zinc-950 text-zinc-400"
                          : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div
              className={`mt-6 space-y-2 pt-4 text-[11px] font-medium ${
                darkMode
                  ? "border-t border-zinc-800 text-zinc-400"
                  : "border-t border-gray-100 text-gray-500"
              }`}
            >
              <p className="flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-sm ${
                    darkMode ? "bg-emerald-500/30" : "bg-green-100"
                  }`}
                />
                <span className={darkMode ? "text-zinc-300" : "text-gray-700"}>
                  Solved
                </span>
              </p>

              <p className="flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-sm ${
                    darkMode ? "bg-rose-500/30" : "bg-red-100"
                  }`}
                />
                <span className={darkMode ? "text-zinc-300" : "text-gray-700"}>
                  Wrong
                </span>
              </p>

              <p className="flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-sm ${
                    darkMode ? "bg-zinc-950" : "bg-gray-100"
                  }`}
                />
                <span className={darkMode ? "text-zinc-300" : "text-gray-700"}>
                  Left
                </span>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}