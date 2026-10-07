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
       
      console.log("data",data)
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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Questions
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage questions for your mock tests.
          </p>
        </div>

        <Button onClick={() => router.push("/questions/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Card className="mb-6 border-destructive/30">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>All Questions</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">
              Loading questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-muted-foreground">
                No questions found.
              </p>

              <Button
                className="mt-4"
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
                  <tr className="border-b text-left">
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
                      className="border-b last:border-0"
                    >
                      <td className="max-w-xl px-4 py-4">
                        <p className="line-clamp-2 font-medium">
                          {question.questionText}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        {question.test?.title || "Unknown Test"}
                      </td>

                      <td className="px-4 py-4">
                        <Badge variant="secondary">
                          {question.difficulty || "Medium"}
                        </Badge>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
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