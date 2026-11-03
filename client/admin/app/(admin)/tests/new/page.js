"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";

import { apiRequest } from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";

const subjects = {
  English: [
     "Synonyms",
  "Spot the Error",
  "Para Jumbles",
  "Fill in the Blanks",
  "Homonyms",
  "Antonyms",
  "Idioms",
  "One Word Substitution",
  "Active & Passive Voice",
  "Reading Comprehension",
  "Cloze Test",
  "Sentence Improvement",
  "Narration",
  "Spelling check",
  ],
  "General Studies": [
    "History",
    "Geography",
    "Indian Polity",
    "Economics",
    "General Science",
    "Current Affairs",
    "Static GK",
    "Environment",
  ],
};

export default function NewTestPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    subject: "",
    exam: "",
    type: "mock",
    topic: "",
    durationMinutes: "",
    marksPerQuestion: "1",
    negativeMarks: "0",
    status: "draft",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Admin login token not found.");
        return;
      }

      await apiRequest("/tests", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          exam: form.exam,
          type: form.type,
          subject: form.subject,
          topic: form.topic,
          durationMinutes: Number(form.durationMinutes),
          marksPerQuestion: form.marksPerQuestion,
          negativeMarks: form.negativeMarks,
          status: form.status,
        }),
      });

      router.push("/tests");
    } catch (err) {
      setError(err.message || "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-xl";

  const selectClass =
    "flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all";

  const labelClass = "text-zinc-300 font-medium text-xs uppercase tracking-wider";

  return (
    <div className="min-h-screen space-y-8 bg-zinc-950 p-6 text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-200 md:p-10">

      {/* Header Area */}
      <div className="mx-auto max-w-3xl">
        <Button
          variant="ghost"
          className="mb-4 -ml-3 text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white rounded-xl cursor-pointer text-xs"
          onClick={() => router.push("/tests")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tests
        </Button>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-400 shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Create New Test
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-zinc-400">
              Configure a seamless assessment experience for candidates.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="mx-auto max-w-3xl border-zinc-800/80 bg-zinc-900 shadow-2xl shadow-zinc-950/45 rounded-3xl">
        <CardHeader className="border-b border-zinc-800/80 px-6 py-5">
          <CardTitle className="text-base font-bold text-white">
            Assessment Parameters
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className={labelClass}>
                Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. SSC CGL Tier 1 Mock Test 1"
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
                placeholder="Provide a brief overview of the test content and objectives..."
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="flex w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Grid Group 1: Category & Exam */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="exam" className={labelClass}>
                  Exam
                </Label>
                <Input
                  id="exam"
                  name="exam"
                  placeholder="e.g. SSC CGL"
                  value={form.exam}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className={labelClass}>
                  Category
                </Label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  <option value="" className="bg-zinc-950 text-zinc-400">Select Exam</option>
                  <option value="SSC" className="bg-zinc-950">SSC</option>
                  <option value="Banking" className="bg-zinc-950">Banking</option>
                  <option value="Railway" className="bg-zinc-950">Railway</option>
                </select>
              </div>
            </div>

            {/* Grid Group 2: Test Type & Subject */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type" className={labelClass}>
                  Test Type
                </Label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className={selectClass}
                >
                  <option value="mock" className="bg-zinc-950">Mock Test</option>
                  <option value="pyq" className="bg-zinc-950">Previous Year Paper (PYQ)</option>
                </select>
              </div>

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
                  <option value="" className="bg-zinc-950 text-zinc-400">Select subject</option>
                  <option value="English" className="bg-zinc-950">English</option>
                  <option value="General Studies" className="bg-zinc-950">General Studies</option>
                </select>
              </div>
            </div>

            {/* Grid Group 3: Topic & Duration */}
            <div className="grid gap-5 md:grid-cols-2">
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
                  className={`${selectClass} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <option value="" className="bg-zinc-950 text-zinc-400">
                    {form.subject ? "Select topic" : "Select subject first"}
                  </option>

                  {form.subject &&
                    subjects[form.subject].map((topic) => (
                      <option key={topic} value={topic} className="bg-zinc-950">
                        {topic}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMinutes" className={labelClass}>
                  Duration (minutes)
                </Label>
                <Input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  min="1"
                  placeholder="e.g. 60"
                  value={form.durationMinutes}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            {/* Grid Group 4: Marks Per Question & Negative Marking */}
            <div className="grid gap-5 md:grid-cols-2">
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
                  placeholder="e.g. 2"
                  required
                  className={inputClass}
                />
              </div>

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
                  placeholder="e.g. 0.50"
                  required
                  className={inputClass}
                />
              </div>
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
                <option value="draft" className="bg-zinc-950">Draft</option>
                <option value="published" className="bg-zinc-950">Published</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-400">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 border-t border-zinc-800/80 pt-6">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-800 bg-transparent text-zinc-300 transition-all hover:bg-zinc-800 hover:text-white rounded-xl cursor-pointer text-xs font-semibold"
                onClick={() => router.push("/tests")}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="bg-emerald-600 font-bold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50 rounded-xl cursor-pointer text-xs px-5"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Test"
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}