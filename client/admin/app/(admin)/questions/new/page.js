"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { apiRequest } from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

const initialForm = {
  test: "",

  questionTextEn: "",
  questionTextHi: "",

  optionAEn: "",
  optionAHi: "",
  optionBEn: "",
  optionBHi: "",
  optionCEn: "",
  optionCHi: "",
  optionDEn: "",
  optionDHi: "",

  correctAnswer: "",
  explanationEn: "",
  explanationHi: "",

  difficulty: "medium",
};

export default function NewQuestionPage() {
  const router = useRouter();

  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        const data = await apiRequest("/tests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTests(data || []);
      } catch (err) {
        setError(err.message || "Failed to load tests");
      } finally {
        setLoadingTests(false);
      }
    };

    fetchTests();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const options = [
        {
          en: form.optionAEn.trim(),
          hi: form.optionAHi.trim(),
        },
        {
          en: form.optionBEn.trim(),
          hi: form.optionBHi.trim(),
        },
        {
          en: form.optionCEn.trim(),
          hi: form.optionCHi.trim(),
        },
        {
          en: form.optionDEn.trim(),
          hi: form.optionDHi.trim(),
        },
      ];

      if (!form.correctAnswer) {
        setError("Please select the correct answer.");
        return;
      }

      if (
        !form.questionTextEn.trim() ||
        !form.questionTextHi.trim() ||
        options.some((option) => !option.en || !option.hi)
      ) {
        setError("Please fill in both English and Hindi question and options.");
        return;
      }

      const payload = {
        test: form.test,

        questionText: {
          en: form.questionTextEn.trim(),
          hi: form.questionTextHi.trim(),
        },

        options,

        // Option A = 0, B = 1, C = 2, D = 3
        correctAnswer: Number(form.correctAnswer),

        explanation: {
          en: form.explanationEn.trim(),
          hi: form.explanationHi.trim(),
        },

        difficulty: form.difficulty,
      };

      await apiRequest("/questions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      router.push("/questions");
    } catch (err) {
      setError(err.message || "Failed to create question");
    } finally {
      setSaving(false);
    }
  };

  const optionFields = [
    { letter: "A", en: "optionAEn", hi: "optionAHi" },
    { letter: "B", en: "optionBEn", hi: "optionBHi" },
    { letter: "C", en: "optionCEn", hi: "optionCHi" },
    { letter: "D", en: "optionDEn", hi: "optionDHi" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/questions")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Add Question
          </h1>
          <p className="mt-1 text-muted-foreground">
            Create a bilingual question for your mock test.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="mb-6 border-destructive/30">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-7">

            {/* Test */}
            <div className="space-y-2">
              <Label htmlFor="test">Test</Label>

              <select
                id="test"
                name="test"
                value={form.test}
                onChange={handleChange}
                required
                disabled={loadingTests}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  {loadingTests ? "Loading tests..." : "Select a test"}
                </option>

                {tests.map((test) => (
                  <option key={test._id} value={test._id}>
                    {test.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Question */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">Question</h3>
                <p className="text-sm text-muted-foreground">
                  Enter the question in both languages.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questionTextEn">
                    Question (English)
                  </Label>

                  <textarea
                    id="questionTextEn"
                    name="questionTextEn"
                    value={form.questionTextEn}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Enter question in English..."
                    className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionTextHi">
                    प्रश्न (हिंदी)
                  </Label>

                  <textarea
                    id="questionTextHi"
                    name="questionTextHi"
                    value={form.questionTextHi}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="प्रश्न हिंदी में लिखें..."
                    className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold">Answer Options</h3>
                <p className="text-sm text-muted-foreground">
                  Add all four options in English and Hindi.
                </p>
              </div>

              {optionFields.map((option) => (
                <div
                  key={option.letter}
                  className="rounded-xl border border-border p-4 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {option.letter}
                    </span>

                    <h4 className="text-sm font-semibold">
                      Option {option.letter}
                    </h4>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={option.en}>
                        English
                      </Label>

                      <Input
                        id={option.en}
                        name={option.en}
                        value={form[option.en]}
                        onChange={handleChange}
                        placeholder={`Enter option ${option.letter} in English`}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={option.hi}>
                        हिंदी
                      </Label>

                      <Input
                        id={option.hi}
                        name={option.hi}
                        value={form[option.hi]}
                        onChange={handleChange}
                        placeholder={`विकल्प ${option.letter} हिंदी में लिखें`}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Correct Answer */}
            <div className="space-y-2">
              <Label htmlFor="correctAnswer">
                Correct Answer
              </Label>

              <select
                id="correctAnswer"
                name="correctAnswer"
                value={form.correctAnswer}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select correct answer</option>
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
                <option value="3">Option D</option>
              </select>

              <p className="text-xs text-muted-foreground">
                Select the correct option. This selection remains the same
                in both languages.
              </p>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>

              <select
                id="difficulty"
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Explanation */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">
                  Explanation (Optional)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Provide the explanation in both languages.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanationEn">
                  Explanation (English)
                </Label>

                <textarea
                  id="explanationEn"
                  name="explanationEn"
                  value={form.explanationEn}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Explain the correct answer in English..."
                  className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanationHi">
                  व्याख्या (हिंदी)
                </Label>

                <textarea
                  id="explanationHi"
                  name="explanationHi"
                  value={form.explanationHi}
                  onChange={handleChange}
                  rows={3}
                  placeholder="सही उत्तर की व्याख्या हिंदी में लिखें..."
                  className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/questions")}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={saving || loadingTests}>
                {saving ? "Saving..." : "Create Question"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}