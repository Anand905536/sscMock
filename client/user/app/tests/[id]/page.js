"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ThreeDots } from 'react-loader-spinner';
import { Clock, BookOpen, BookmarkCheck, ShieldAlert, ArrowRight, Layers } from "lucide-react";

export default function TestInstructionsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/tests/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load test");
          return;
        }

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

      const response = await fetch(
        "http://localhost:5000/api/attempts/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            test: id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to start test");
        setStarting(false);
        return;
      }

      router.push(`/tests/${id}/attempt?attemptId=${data.attempt.id}`);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while starting the test");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <ThreeDots color="#059669" height={80} width={80} />
      </main>
    );
  }

  if (!test) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-700">Test not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/60 py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* Header Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200/60">
              <Layers className="w-3.5 h-3.5" /> {test.subject}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-500">
              {test.topic}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {test.title}
          </h1>

          {test.description && (
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              {test.description}
            </p>
          )}
        </div>

        {/* Info Grid Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</p>
              <p className="mt-0.5 text-base font-bold text-slate-800">
                {test.durationMinutes} Minutes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject</p>
              <p className="mt-0.5 text-base font-bold text-slate-800 truncate max-w-[150px]">
                {test.subject}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Topic</p>
              <p className="mt-0.5 text-base font-bold text-slate-800 truncate max-w-[150px]">
                {test.topic}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            <h2>General Instructions</h2>
          </div>

          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">1</span>
              <span>Read each question carefully before selecting your answer option.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">2</span>
              <span>You can freely navigate back and forth between questions during the test.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">3</span>
              <span>The test will automatically auto-submit when the allocated timer expires.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">4</span>
              <span>Your performance score and accuracy metrics will be calculated immediately upon submission.</span>
            </li>
          </ul>
        </div>

        {/* Action Button */}
        <button
          onClick={handleStartTest}
          disabled={starting}
          className="cursor-pointer w-full rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-extrabold text-white shadow-md hover:bg-emerald-700 hover:shadow-emerald-900/10 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>{starting ? "Initializing Test..." : "Start Test Now"}</span>
          {!starting && <ArrowRight className="w-4 h-4" />}
        </button>

      </div>
    </main>
  );
}