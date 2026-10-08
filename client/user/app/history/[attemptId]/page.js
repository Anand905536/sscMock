"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AttemptDetailsPage() {
  const { attemptId } = useParams();
  const router = useRouter();

  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttemptDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const resultResponse = await fetch(
          `http://localhost:5000/api/attempts/${attemptId}/result`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const resultData = await resultResponse.json();

        if (!resultResponse.ok) {
          alert(
            resultData.message ||
              "Failed to load attempt"
          );
          return;
        }

        setResult(resultData.result);

        const testId = resultData.result.test._id;

        const questionsResponse = await fetch(
          `http://localhost:5000/api/questions/test/${testId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const questionsData =
          await questionsResponse.json();

        if (!questionsResponse.ok) {
          alert(
            questionsData.message ||
              "Failed to load questions"
          );
          return;
        }

        setQuestions(questionsData);
      } catch (error) {
        console.error(error);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      fetchAttemptDetails();
    }
  }, [attemptId, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-500">
          Loading attempt...
        </p>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-500">
          Attempt not found.
        </p>
      </main>
    );
  }

  const questionResults =
    result.questionResults || [];

  const resultMap = new Map(
    questionResults.map((item) => [
      item.questionId.toString(),
      item,
    ])
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <button
          type="button"
          onClick={() => router.push("/history")}
          className="text-sm text-gray-500 hover:text-black"
        >
          ← Back to History
        </button>

        <div className="mt-6">
          <p className="text-sm text-gray-500">
            Previous Attempt
          </p>

          <h1 className="mt-1 text-3xl font-bold text-black">
            {result.test.title}
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {result.test.category}
          </p>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Score
            </p>

            <p className="mt-2 text-2xl font-semibold text-black">
              {result.score}/{result.maximumMarks}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Percentage
            </p>

            <p className="mt-2 text-2xl font-semibold text-black">
              {result.percentage}%
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Correct
            </p>

            <p className="mt-2 text-2xl font-semibold text-black">
              {result.correctAnswers}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Wrong
            </p>

            <p className="mt-2 text-2xl font-semibold text-black">
              {result.incorrectAnswers}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Unanswered
            </p>

            <p className="mt-2 text-2xl font-semibold text-black">
              {result.unanswered}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Rank
            </p>

            <p className="mt-2 text-2xl font-semibold text-black">
              #{result.rank}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm text-gray-500">
              Percentile
            </p>

            <p className="mt-2 text-2xl font-semibold text-black">
              {result.percentile}%
            </p>
          </div>
        </div>

        {/* Marking */}
        <div className="mt-6 rounded-lg border border-gray-200 p-5">
          <p className="text-sm font-medium text-black">
            Marking Scheme
          </p>

          <p className="mt-2 text-sm text-gray-500">
            +{result.marksPerQuestion} for correct answer
            {" • "}
            -{result.negativeMarks} for wrong answer
          </p>
        </div>

        {/* Questions */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-black">
            Attempted Questions
          </h2>

          <div className="mt-5 space-y-6">
            {questions.map((question, index) => {
              const questionResult =
                resultMap.get(
                  question._id.toString()
                );

              const status =
                questionResult?.status ||
                "unanswered";

              return (
                <div
                  key={question._id}
                  className="rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-medium text-black">
                      {index + 1}.{" "}
                      {question.questionText}
                    </h3>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        status === "correct"
                          ? "bg-green-100 text-green-700"
                          : status === "incorrect"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {status === "correct"
                        ? "Solved"
                        : status === "incorrect"
                        ? "Wrong"
                        : "Left"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-2">
                    {question.options.map(
                      (option) => {
                        const isCorrect =
                          option ===
                          questionResult?.correctAnswer;

                        const isSelected =
                          option ===
                          questionResult?.selectedAnswer;

                        return (
                          <div
                            key={option}
                            className={`rounded-lg border p-3 text-sm ${
                              isCorrect
                                ? "border-green-500 bg-green-50 text-green-700"
                                : isSelected
                                ? "border-red-500 bg-red-50 text-red-700"
                                : "border-gray-200 text-gray-700"
                            }`}
                          >
                            {option}

                            {isCorrect && (
                              <span className="ml-2 text-xs font-medium">
                                Correct Answer
                              </span>
                            )}

                            {isSelected &&
                              !isCorrect && (
                                <span className="ml-2 text-xs font-medium">
                                  Your Answer
                                </span>
                              )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}