"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";
import {
  Clock,
  BookOpen,
  BookmarkCheck,
  ShieldAlert,
  ArrowRight,
  Layers,
  Languages,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";

export default function TestInstructionsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [language, setLanguage] = useState("en");

  const { darkMode, isThemeReady } = useTheme();

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const data = await apiRequest(`/tests/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTest(data.test || data);
      } catch (error) {
        console.error(error);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id, router]);

  const handleStartTest = async () => {
    try {
      setStarting(true);

      const token = localStorage.getItem("token");

      const data = await apiRequest("/attempts/start", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          test: id,
        }),
      });

      router.push(
        `/tests/${id}/attempt?attemptId=${data.attempt.id}&language=${language}`
      );
    } catch (error) {
      console.error(error);
      alert("Something went wrong while starting the test");
      setStarting(false);
    }
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
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <ThreeDots
          color={darkMode ? "#10b981" : "#059669"}
          height={80}
          width={80}
        />
      </main>
    );
  }

  if (!test) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center ${
          darkMode
            ? "bg-zinc-950 text-white"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <div
          className={`rounded-2xl p-8 text-center shadow-sm ${
            darkMode
              ? "bg-zinc-900 text-zinc-100"
              : "border border-slate-200 bg-white"
          }`}
        >
          <p className="text-sm font-bold">Test not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
        darkMode
          ? "bg-zinc-950 text-zinc-100 selection:bg-emerald-500 selection:text-white"
          : "bg-slate-50/60 text-slate-900 selection:bg-emerald-500 selection:text-white"
      }`}
    >
      <div className="mx-auto max-w-3xl w-full py-12 px-4 sm:px-6 space-y-6 flex-1">
        {/* Header Card */}
        <div
          className={`rounded-2xl p-6 sm:p-8 shadow-sm transition-colors duration-300 ${
            darkMode
              ? "bg-zinc-900 text-zinc-100 shadow-zinc-950/40"
              : "border border-slate-200/80 bg-white text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                darkMode
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> {test.subject}
            </span>

            <span className="opacity-40">•</span>

            <span
              className={`text-xs font-semibold ${
                darkMode ? "text-zinc-400" : "text-slate-500"
              }`}
            >
              {test.topic}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {test.title}
          </h1>

          {test.description && (
            <p
              className={`mt-2 text-sm leading-relaxed ${
                darkMode ? "text-zinc-400" : "text-slate-500"
              }`}
            >
              {test.description}
            </p>
          )}
        </div>

        {/* Enhanced Language Selector */}
        <div
          className={`rounded-2xl p-5 sm:p-6 shadow-sm transition-all ${
            darkMode
              ? "bg-zinc-900 shadow-zinc-950/40 border border-zinc-800/60"
              : "border border-slate-200/80 bg-white"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                }`}
              >
                <Languages className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold">
                  Choose Test Language
                </h2>
                <p
                  className={`mt-0.5 text-xs ${
                    darkMode ? "text-zinc-400" : "text-slate-500"
                  }`}
                >
                  Select your preferred language for questions & options.
                </p>
              </div>
            </div>

            <div
              className={`inline-flex w-full sm:w-auto rounded-xl p-1.5 border ${
                darkMode ? "bg-zinc-950 border-zinc-800" : "bg-slate-100 border-slate-200/60"
              }`}
            >
              <button
                type="button"
                onClick={() => setLanguage("en")}
                aria-pressed={language === "en"}
                className={`cursor-pointer flex-1 sm:flex-none min-w-28 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  language === "en"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.02]"
                    : darkMode
                      ? "text-zinc-400 hover:text-white hover:bg-zinc-900"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white"
                }`}
              >
                English
              </button>

              <button
                type="button"
                onClick={() => setLanguage("hi")}
                aria-pressed={language === "hi"}
                className={`cursor-pointer flex-1 sm:flex-none min-w-28 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  language === "hi"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.02]"
                    : darkMode
                      ? "text-zinc-400 hover:text-white hover:bg-zinc-900"
                      : "text-slate-500 hover:text-slate-900 hover:bg-white"
                }`}
              >
                हिंदी
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            className={`flex items-center gap-4 rounded-2xl p-5 shadow-sm ${
              darkMode
                ? "bg-zinc-900 text-zinc-100 shadow-zinc-950/40"
                : "border border-slate-200/80 bg-white text-slate-900"
            }`}
          >
            <div
              className={`rounded-xl p-3 ${
                darkMode
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? "text-zinc-400" : "text-slate-400"
                }`}
              >
                Duration
              </p>
              <p className="mt-0.5 text-base font-bold">
                {test.durationMinutes} Minutes
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-4 rounded-2xl p-5 shadow-sm ${
              darkMode
                ? "bg-zinc-900 text-zinc-100 shadow-zinc-950/40"
                : "border border-slate-200/80 bg-white text-slate-900"
            }`}
          >
            <div
              className={`rounded-xl p-3 ${
                darkMode
                  ? "bg-teal-500/15 text-teal-400"
                  : "bg-teal-50 text-teal-600"
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? "text-zinc-400" : "text-slate-400"
                }`}
              >
                Subject
              </p>
              <p className="mt-0.5 text-base font-bold truncate max-w-[150px]">
                {test.subject}
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-4 rounded-2xl p-5 shadow-sm ${
              darkMode
                ? "bg-zinc-900 text-zinc-100 shadow-zinc-950/40"
                : "border border-slate-200/80 bg-white text-slate-900"
            }`}
          >
            <div
              className={`rounded-xl p-3 ${
                darkMode
                  ? "bg-indigo-500/15 text-indigo-400"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  darkMode ? "text-zinc-400" : "text-slate-400"
                }`}
              >
                Topic
              </p>
              <p className="mt-0.5 text-base font-bold truncate max-w-[150px]">
                {test.topic}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div
          className={`rounded-2xl p-6 sm:p-8 shadow-sm space-y-4 ${
            darkMode
              ? "bg-zinc-900 text-zinc-100 shadow-zinc-950/40"
              : "border border-slate-200/80 bg-white text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-lg">
            <ShieldAlert
              className={`w-5 h-5 ${
                darkMode ? "text-emerald-400" : "text-emerald-600"
              }`}
            />
            <h2>General Instructions</h2>
          </div>

          <ul
            className={`space-y-3 text-sm ${
              darkMode ? "text-zinc-300" : "text-slate-600"
            }`}
          >
            {[
              "Read each question carefully before selecting your answer option.",
              "You can freely navigate back and forth between questions during the test.",
              "The test will automatically submit when the allocated timer expires.",
              "Your performance score and accuracy metrics will be calculated immediately upon submission.",
            ].map((instruction, index) => (
              <li key={index} className="flex items-start gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    darkMode
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {index + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartTest}
          disabled={starting}
          className="cursor-pointer w-full rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-extrabold text-white shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>
            {starting ? "Initializing Test..." : "Start Test Now"}
          </span>
          {!starting && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </main>
  );
}