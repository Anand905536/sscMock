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

export default function NewTestPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    durationMinutes: "",
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
          durationMinutes: Number(form.durationMinutes),
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

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

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