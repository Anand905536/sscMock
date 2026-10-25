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
          exam: form.exam, // Added exam
          type: form.type, // Added type
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 space-y-8 p-6 md:p-10 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header Area */}
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4 -ml-3 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          onClick={() => router.push("/tests")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tests
        </Button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Create New Test
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Configure a mesmerizing assessment experience for candidates.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-3xl mx-auto bg-zinc-900/60 border-zinc-800/80 backdrop-blur-xl shadow-2xl shadow-indigo-950/20">
        <CardHeader className="border-b border-zinc-800/60 px-6 py-5">
          <CardTitle className="text-lg font-semibold text-zinc-200">
            Assessment Parameters
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-zinc-300 font-medium">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. SSC CGL Tier 1 Mock Test 1"
                value={form.title}
                onChange={handleChange}
                required
                className="bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-zinc-300 font-medium">Description</Label>
              <textarea
                id="description"
                name="description"
                placeholder="Provide a brief overview of the test content and objectives..."
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="flex w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            {/* Grid Group 1: Category & Exam */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-zinc-300 font-medium">Exam</Label>
                <Input
                  id="exam"
                  name="exam"
                  placeholder="e.g. SSC CGL"
                  value={form.exam}
                  onChange={handleChange}
                  required
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam" className="text-zinc-300 font-medium">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="" className="bg-zinc-900 text-zinc-500">Select Exam</option>
                  <option value="SSC" className="bg-zinc-900">SSC</option>
                  <option value="Banking" className="bg-zinc-900">Banking</option>
                  <option value="Railway" className="bg-zinc-900">Railway</option>
                </select>
              </div>
            </div>

            {/* Grid Group 2: Test Type & Subject */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-zinc-300 font-medium">Test Type</Label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="mock" className="bg-zinc-900">Mock Test</option>
                  <option value="pyq" className="bg-zinc-900">Previous Year Paper (PYQ)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-zinc-300 font-medium">Subject</Label>
                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleSubjectChange}
                  required
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="" className="bg-zinc-900 text-zinc-500">Select subject</option>
                  <option value="English" className="bg-zinc-900">English</option>
                  <option value="General Studies" className="bg-zinc-900">General Studies</option>
                </select>
              </div>
            </div>

            {/* Grid Group 3: Topic & Duration */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-zinc-300 font-medium">Topic</Label>
                <select
                  id="topic"
                  name="topic"
                  value={form.topic}
                  onChange={handleChange}
                  disabled={!form.subject}
                  required
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                >
                  <option value="" className="bg-zinc-900 text-zinc-500">
                    {form.subject ? "Select topic" : "Select subject first"}
                  </option>
                  {form.subject &&
                    subjects[form.subject].map((topic) => (
                      <option key={topic} value={topic} className="bg-zinc-900">
                        {topic}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationMinutes" className="text-zinc-300 font-medium">
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
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Grid Group 4: Marks Per Question & Negative Marking */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="marksPerQuestion" className="text-zinc-300 font-medium">
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
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="negativeMarks" className="text-zinc-300 font-medium">
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
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-zinc-300 font-medium">Status</Label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="draft" className="bg-zinc-900">Draft</option>
                <option value="published" className="bg-zinc-900">Published</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800/60">
              <Button
                type="button"
                variant="outline"
                className="bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white transition-all"
                onClick={() => router.push("/tests")}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all disabled:opacity-50"
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