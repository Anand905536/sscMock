
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { apiRequest } from "../../../lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

export default function QuestionsPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await apiRequest("/questions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("data", data);
      setQuestions(data || []);
    } catch (err) {
      setError(err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      await apiRequest(`/questions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuestions((currentQuestions) =>
        currentQuestions.filter((question) => question._id !== id)
      );
    } catch (err) {
      alert(err.message || "Failed to delete question");
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 p-6 text-zinc-100 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Questions
          </h1>
          <p className="mt-1 text-zinc-400">
            Manage questions for your mock tests.
          </p>
        </div>

        <Button
          onClick={() => router.push("/questions/new")}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="mb-6 border-rose-500/30 bg-zinc-900 text-zinc-100">
          <CardContent className="pt-6">
            <p className="text-sm text-rose-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card className="border-zinc-800 bg-zinc-900 text-zinc-100 shadow-lg">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="text-white">
            All Questions
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          {loading ? (
            <div className="py-10 text-center text-zinc-400">
              Loading questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-zinc-400">
                No questions found.
              </p>

              <Button
                className="mt-4 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => router.push("/questions/new")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Question
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-400">
                    <th className="px-4 py-3 font-medium">
                      Question
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Test
                    </th>
                    <th className="px-4 py-3 font-medium">
                      Difficulty
                    </th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {questions.map((question) => (
                    <tr
                      key={question._id}
                      className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40"
                    >
                      <td className="max-w-xl px-4 py-4">
                        <p className="line-clamp-2 font-medium text-zinc-100">
                          {typeof question.questionText === "string"
                            ? question.questionText
                            : question.questionText?.en ||
                              question.questionText?.hi ||
                              "No question text"}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-zinc-300">
                        {question.test?.title || "Unknown Test"}
                      </td>

                      <td className="px-4 py-4">
                        <Badge
                          variant="secondary"
                          className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        >
                          {question.difficulty || "Medium"}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 bg-zinc-950 text-zinc-200 hover:border-emerald-500 hover:bg-zinc-800 hover:text-emerald-400"
                            onClick={() =>
                              router.push(
                                `/questions/${question._id}/edit`
                              )
                            }
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            className="bg-rose-600 text-white hover:bg-rose-700"
                            onClick={() =>
                              handleDelete(question._id)
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
