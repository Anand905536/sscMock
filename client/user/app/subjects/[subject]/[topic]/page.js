"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, Clock, Play, HelpCircle, Award } from "lucide-react";
import { ThreeDots } from "react-loader-spinner";

const topicMap = {
  english: {
    "vocabulary": "Vocabulary",
    "spot-the-error": "Spot the Error",
    "para-jumbles": "Para Jumbles",
    "fill-in-the-blanks": "Fill in the Blanks",
    "grammar": "Grammar",
    "synonyms": "Synonyms",
    "antonyms": "Antonyms",
    "idioms-&-phrases": "Idioms & Phrases",
    "one-word-substitution": "One Word Substitution",
    "active-&-passive-voice": "Active & Passive Voice",
    "reading-comprehension": "Reading Comprehension",
    "cloze-test": "Cloze Test",
    "sentence-improvement": "Sentence Improvement",
    "direct-&-indirect-speech": "Direct & Indirect Speech",
    "spelling": "Spelling",
  },

  "general-studies": {
    "ancient-history": "Ancient History",
    "medieval-history": "Medieval History",
    "modern-history": "Modern History",
    "indian-geography": "Indian Geography",
    "world-geography": "World Geography",
    "indian-polity": "Indian Polity",
    "indian-economy": "Indian Economy",
    "general-science": "General Science",
    "physics": "Physics",
    "chemistry": "Chemistry",
    "biology": "Biology",
    "current-affairs": "Current Affairs",
    "static-gk": "Static GK",
    "environment": "Environment",
    "art-&-culture": "Art & Culture",
  },
};

export default function TopicTestsPage() {
  const { subject, topic } = useParams();
  const router = useRouter();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const subjectKey = subject?.toLowerCase();
  const topicName = topicMap[subjectKey]?.[topic];

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        if (!topicName) {
          setError("Topic not found.");
          return;
        }

        const params = new URLSearchParams({
          subject:
            subjectKey === "general-studies"
              ? "General Studies"
              : "English",
          topic: topicName,
        });

        const response = await fetch(
          `http://localhost:5000/api/tests?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch tests"
          );
        }

        setTests(data);
      } catch (err) {
        setError(err.message || "Failed to load tests");
      } finally {
        setLoading(false);
      }
    };

    if (subject && topic) {
      fetchTests();
    }
  }, [subject, topic, topicName, subjectKey, router]);

  const subjectTitle =
    subjectKey === "general-studies"
      ? "General Studies"
      : "English";

  return (
    <main className="min-h-screen bg-slate-50/60 pb-16">
      {/* Content */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <button
          onClick={() => router.push("/")}
          className="hover:cursor-pointer mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm hover:border-emerald-300 hover:text-emerald-700 transition"
        >
          <LayoutGrid className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div className="mb-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200/60">
            {subjectTitle}
          </span>

          <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {topicName || "Topic"} Tests
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Choose a practice test below and start testing your knowledge.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <ThreeDots
              height="50"
              width="50"
              radius="5"
              color="#059669"
              ariaLabel="three-dots-loading"
              wrapperStyle={{ margin: '20px auto' }}
              wrapperClass="custom-loader"
              visible={true}
            />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && tests.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-base font-bold text-slate-800">
              No tests available
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Tests for this topic will appear here once they are published.
            </p>
          </div>
        )}

        {!loading && !error && tests.length > 0 && (
          <div className="space-y-3">
            {tests.map((test) => (
              <div
                key={test._id}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-md"
              >
                {/* Left side details */}
                <div className="min-w-0 flex-1 space-y-1">
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    {test.title}
                  </h2>

                  {test.description && (
                    <p className="line-clamp-1 text-xs text-slate-500">
                      {test.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {test.durationMinutes} minutes
                    </span>
                    {test.totalQuestions && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                          {test.totalQuestions} Questions
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right side start button */}
                <div className="shrink-0 self-end sm:self-center">
                  <Link
                    href={`/tests/${test._id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 hover:shadow-emerald-900/10 transition-all"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    Start Test
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}