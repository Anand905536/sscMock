"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

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
          console.log("token",token)
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
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-black"
        >
          sscMock
        </Link>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white"
        >
          Logout
        </button>
      </nav>

      {/* Content */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-sm font-medium text-gray-600 hover:text-black"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            {subjectTitle}
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-black">
            {topicName || "Topic"}
          </h1>

          <p className="mt-2 text-gray-500">
            Choose a test and start practicing.
          </p>
        </div>

        {loading && (
          <p className="text-gray-500">
            Loading tests...
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !error && tests.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
            <h2 className="text-lg font-semibold text-black">
              No tests available
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Tests for this topic will appear here once they
              are published.
            </p>
          </div>
        )}

        {!loading && !error && tests.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <div
                key={test._id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-lg font-semibold text-black">
                  {test.title}
                </h2>

                {test.description && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {test.description}
                  </p>
                )}

                <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {test.durationMinutes} minutes
                </div>

                <Link
                  href={`/tests/${test._id}`}
                  className="mt-5 block rounded-md bg-black px-4 py-2.5 text-center text-sm font-medium text-white"
                >
                  Start Test
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}