"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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

      // console.log("FORM DATA:", form);
      // console.log("SUBJECT:", form.subject);
      // console.log("TOPIC:", form.topic);

      await apiRequest("/tests", {
        method: "POST",
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
    <div className="space-y-6 p-8">
      <div>
        <Button
          variant="ghost"
          className="mb-4 -ml-3"
          onClick={() => router.push("/tests")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tests
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">
          Create Test
        </h1>

        <p className="mt-1 text-muted-foreground">
          Create a new mock test.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Test Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>

              <Input
                id="title"
                name="title"
                placeholder="SSC CGL Tier 1 Mock Test 1"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>

              <textarea
                id="description"
                name="description"
                placeholder="Enter test description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>

              <Input
                id="category"
                name="category"
                placeholder="SSC CGL"
                value={form.category}
                onChange={handleChange}
                required
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>

              <select
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleSubjectChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              <Label htmlFor="topic">Topic</Label>

              <select
                id="topic"
                name="topic"
                value={form.topic}
                onChange={handleChange}
                disabled={!form.subject}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {form.subject
                    ? "Select topic"
                    : "Select subject first"}
                </option>

                {form.subject &&
                  subjects[form.subject].map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="durationMinutes">
                Duration (minutes)
              </Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                min="1"
                placeholder="60"
                value={form.durationMinutes}
                onChange={handleChange}
                required
              />
            </div>

            {/* marks per question */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="marksPerQuestion">
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
                />
              </div>


              {/* negative marking */}
              <div className="space-y-2">
                <Label htmlFor="negativeMarks">
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
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/tests")}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Test"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}