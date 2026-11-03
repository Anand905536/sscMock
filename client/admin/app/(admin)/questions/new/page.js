"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { apiRequest } from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import RichTextEditor from "../../../../components/RichTextEditor";

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

const inputClasses =
  "border-zinc-700 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500";

const selectClasses =
  "flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50";

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

  const handleRichTextChange = (name, value) => {
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

      if (!form.test) {
        setError("Please select a test.");
        return;
      }

      if (!form.correctAnswer) {
        setError("Please select the correct answer.");
        return;
      }

      // Only English question and options are required.
      if (
        !form.questionTextEn.replace(/<[^>]*>/g, "").trim() ||
        options.some((option) => !option.en)
      ) {
        setError(
          "Please fill in the English question and all four English options."
        );
        return;
      }

      const payload = {
        test: form.test,

        // Rich-text HTML is stored in the existing string fields.
        questionText: {
          en: form.questionTextEn.trim(),
          hi: form.questionTextHi.trim(),
        },

        // Options remain plain text.
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
    <div className="min-h-screen w-full bg-zinc-950 p-6 text-zinc-100 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-emerald-500 hover:bg-zinc-800 hover:text-emerald-400"
          onClick={() => router.push("/questions")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Add Question
          </h1>
          <p className="mt-1 text-zinc-400">
            Create a question in English. Hindi translation is optional.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="mb-6 border-rose-500/30 bg-zinc-900 text-zinc-100">
          <CardContent className="pt-6">
            <p className="text-sm text-rose-400">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="max-w-4xl border-zinc-800 bg-zinc-900 text-zinc-100 shadow-lg">
        <CardHeader className="border-b border-zinc-800">
          <CardTitle className="text-white">
            Question Details
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Test */}
            <div className="space-y-2">
              <Label htmlFor="test" className="text-zinc-300">
                Test
              </Label>

              <select
                id="test"
                name="test"
                value={form.test}
                onChange={handleChange}
                required
                disabled={loadingTests}
                className={selectClasses}
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
                <h3 className="text-sm font-semibold text-white">
                  Question
                </h3>
                <p className="text-sm text-zinc-400">
                  English is required. Hindi is optional.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">
                    Question (English) *
                  </Label>

                  <RichTextEditor
                    value={form.questionTextEn}
                    onChange={(value) =>
                      handleRichTextChange("questionTextEn", value)
                    }
                    placeholder="Enter question in English..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300">
                    प्रश्न (हिंदी) (Optional)
                  </Label>

                  <RichTextEditor
                    value={form.questionTextHi}
                    onChange={(value) =>
                      handleRichTextChange("questionTextHi", value)
                    }
                    placeholder="प्रश्न हिंदी में लिखें (वैकल्पिक)..."
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Answer Options
                </h3>
                <p className="text-sm text-zinc-400">
                  All four English options are required. Hindi is optional.
                </p>
              </div>

              {optionFields.map((option) => (
                <div
                  key={option.letter}
                  className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-400">
                      {option.letter}
                    </span>

                    <h4 className="text-sm font-semibold text-zinc-100">
                      Option {option.letter}
                    </h4>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={option.en} className="text-zinc-300">
                        English *
                      </Label>

                      <Input
                        id={option.en}
                        name={option.en}
                        value={form[option.en]}
                        onChange={handleChange}
                        placeholder={`Enter option ${option.letter} in English`}
                        required
                        className={inputClasses}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={option.hi} className="text-zinc-300">
                        हिंदी (Optional)
                      </Label>

                      <Input
                        id={option.hi}
                        name={option.hi}
                        value={form[option.hi]}
                        onChange={handleChange}
                        placeholder={`विकल्प ${option.letter} हिंदी में लिखें (वैकल्पिक)`}
                        className={inputClasses}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Correct Answer */}
            <div className="space-y-2">
              <Label htmlFor="correctAnswer" className="text-zinc-300">
                Correct Answer
              </Label>

              <select
                id="correctAnswer"
                name="correctAnswer"
                value={form.correctAnswer}
                onChange={handleChange}
                required
                className={selectClasses}
              >
                <option value="">Select correct answer</option>
                <option value="0">Option A</option>
                <option value="1">Option B</option>
                <option value="2">Option C</option>
                <option value="3">Option D</option>
              </select>

              <p className="text-xs text-zinc-500">
                Select the correct option. This selection remains the same
                in both languages.
              </p>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-zinc-300">
                Difficulty
              </Label>

              <select
                id="difficulty"
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className={selectClasses}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Explanation */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Explanation (Optional)
                </h3>
                <p className="text-sm text-zinc-400">
                  Explanation is optional. You can enter English, Hindi, or both.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">
                  Explanation (English)
                </Label>

                <RichTextEditor
                  value={form.explanationEn}
                  onChange={(value) =>
                    handleRichTextChange("explanationEn", value)
                  }
                  placeholder="Explain the correct answer in English..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">
                  व्याख्या (हिंदी) (Optional)
                </Label>

                <RichTextEditor
                  value={form.explanationHi}
                  onChange={(value) =>
                    handleRichTextChange("explanationHi", value)
                  }
                  placeholder="सही उत्तर की व्याख्या हिंदी में लिखें (वैकल्पिक)..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-zinc-800 pt-6">
              <Button
                type="button"
                variant="outline"
                className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
                onClick={() => router.push("/questions")}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving || loadingTests}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {saving ? "Saving..." : "Create Question"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}