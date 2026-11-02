
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { apiRequest } from "../../../../../lib/api";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";

const subjects = {
  English: [
    "Vocabulary",
    "Spot the Error",
    "Para Jumbles",
    "Fill in the Blanks",
    "Grammar",
    "Synonyms",
    "Antonyms",
    "Idioms & Phrases",
    "One Word Substitution",
    "Active & Passive Voice",
  ],

  "General Studies": [
    "Ancient History",
    "Medieval History",
    "Modern History",
    "Geography",
    "Indian Polity",
    "Economics",
    "General Science",
    "Current Affairs",
    "Static GK",
    "Environment",
  ],
};

export default function EditTestPage() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    subject: "",
    topic: "",
    durationMinutes: "",
    marksPerQuestion: 1,
    negativeMarks: 0,
    status: "draft",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Admin login token not found.");
          return;
        }

        const data = await apiRequest(`/tests/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setForm({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "",
          subject: data.subject || "",
          topic: data.topic || "",
          durationMinutes: data.durationMinutes || "",
          marksPerQuestion: data.marksPerQuestion ?? 1,
          negativeMarks: data.negativeMarks ?? 0,
          status: data.status || "draft",
        });
      } catch (err) {
        setError(err.message || "Failed to load test");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTest();
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubjectChange = (e) => {
    setForm({
      ...form,
      subject: e.target.value,
      topic: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      await apiRequest(`/tests/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          subject: form.subject,
          topic: form.topic,
          durationMinutes: Number(form.durationMinutes),
          marksPerQuestion: Number(form.marksPerQuestion),
          negativeMarks: Number(form.negativeMarks),
          status: form.status,
        }),
      });

      router.push("/tests");
    } catch (err) {
      setError(err.message || "Failed to update test");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-emerald-500 focus-visible:ring-emerald-500";

  const selectClass =
    "flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500";

  const labelClass = "font-medium text-zinc-300";

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8 text-zinc-400">
        Loading test...
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-zinc-950 p-6 text-zinc-100 md:p-8">

      {/* Header */}
      <div>
        <Button
          variant="ghost"
          className="-ml-3 mb-4 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          onClick={() => router.push("/tests")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tests
        </Button>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          Edit Test
        </h1>

        <p className="mt-1 text-zinc-400">
          Update the test details.
        </p>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl border-zinc-800 bg-zinc-900 text-zinc-100 shadow-xl">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="text-white">
            Test Details
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          {error ? (
            <p className="text-sm text-rose-400">{error}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className={labelClass}>
                  Title
                </Label>

                <Input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className={labelClass}>
                  Description
                </Label>

                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="flex w-full resize-none rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className={labelClass}>
                  Category
                </Label>

                <Input
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject" className={labelClass}>
                  Subject
                </Label>

                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleSubjectChange}
                  required
                  className={selectClass}
                >
                  <option value="">Select subject</option>
                  <option value="English">English</option>
                  <option value="General Studies">
                    General Studies
                  </option>
                </select>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic" className={labelClass}>
                  Topic
                </Label>

                <select
                  id="topic"
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  disabled={!form.subject}
                  required
                  className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <option value="">
                    {form.subject
                      ? "Select topic"
                      : "Select subject first"}
                  </option>

                  {form.subject &&
                    subjects[form.subject]?.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                </select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="durationMinutes" className={labelClass}>
                  Duration (minutes)
                </Label>

                <Input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  min="1"
                  value={form.durationMinutes}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Marks */}
              <div className="space-y-2">
                <Label htmlFor="marksPerQuestion" className={labelClass}>
                  Marks Per Question
                </Label>

                <Input
                  id="marksPerQuestion"
                  name="marksPerQuestion"
                  type="number"
                  min="0"
                  step="0.25"
                  value={form.marksPerQuestion}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Negative Marks */}
              <div className="space-y-2">
                <Label htmlFor="negativeMarks" className={labelClass}>
                  Negative Marking
                </Label>

                <Input
                  id="negativeMarks"
                  name="negativeMarks"
                  type="number"
                  min="0"
                  step="0.25"
                  value={form.negativeMarks}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className={labelClass}>
                  Status
                </Label>

                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={selectClass}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              {error && (
                <p className="text-sm text-rose-400">
                  {error}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/tests")}
                  className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
