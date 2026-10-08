"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading test...</p>
      </main>
    );
  }

  if (!test) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Test not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <p className="mb-2 text-sm text-gray-500">
            {test.subject} • {test.topic}
          </p>

          <h1 className="text-3xl font-bold text-black">
            {test.title}
          </h1>

          {test.description && (
            <p className="mt-3 text-gray-600">
              {test.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Duration</p>
            <p className="mt-1 font-semibold text-black">
              {test.durationMinutes} minutes
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Subject</p>
            <p className="mt-1 font-semibold text-black">
              {test.subject}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Topic</p>
            <p className="mt-1 font-semibold text-black">
              {test.topic}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-black">
            Instructions
          </h2>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-600">
            <li>Read each question carefully.</li>
            <li>Select one option for each question.</li>
            <li>You can move between questions.</li>
            <li>The test will be submitted when the timer expires.</li>
            <li>Your score will be calculated automatically.</li>
          </ul>
        </div>

        <button
          onClick={handleStartTest}
          disabled={starting}
          className="mt-8 w-full rounded-lg bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {starting ? "Starting Test..." : "Start Test"}
        </button>
      </div>
    </main>
  );
}