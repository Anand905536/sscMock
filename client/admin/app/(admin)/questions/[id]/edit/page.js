
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { apiRequest } from "../../../../../lib/api";
import { Button } from "../../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";

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
  "flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500";

const textareaClasses =
  "w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-emerald-500";

const getLanguageValue = (value, language) => {
  if (typeof value === "string") return value;
  return value?.[language] || "";
};

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        // 1. Get all tests
        const testsData = await apiRequest("/tests", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("TESTS:", testsData);

        setTests(testsData || []);

        // 2. Get the question
        const question = await apiRequest(
          `/questions/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("QUESTION:", question);

        const options = question.options || [];

        // Support both bilingual objects and older string values
        const optionA = options[0] || {};
        const optionB = options[1] || {};
        const optionC = options[2] || {};
        const optionD = options[3] || {};

        // Numeric correctAnswer: 0 = A, 1 = B, 2 = C, 3 = D
        // Also supports older records where correctAnswer was stored as text.
        let correctAnswerIndex = "";

        if (
          Number.isInteger(question.correctAnswer) &&
          question.correctAnswer >= 0 &&
          question.correctAnswer <= 3
        ) {
          correctAnswerIndex = String(question.correctAnswer);
        } else if (
          typeof question.correctAnswer === "string" &&
          question.correctAnswer.trim()
        ) {
          const oldAnswerIndex = options.findIndex((option) => {
            const optionText =
              typeof option === "string" ? option : option?.en;

            return optionText === question.correctAnswer;
          });

          if (oldAnswerIndex !== -1) {
            correctAnswerIndex = String(oldAnswerIndex);
          }
        }

        setForm({
          test:
            typeof question.test === "object"
              ? question.test?._id || ""
              : question.test || "",

          questionTextEn: getLanguageValue(
            question.questionText,
            "en"
          ),
          questionTextHi: getLanguageValue(
            question.questionText,
            "hi"
          ),

          optionAEn: getLanguageValue(optionA, "en"),
          optionAHi: getLanguageValue(optionA, "hi"),

          optionBEn: getLanguageValue(optionB, "en"),
          optionBHi: getLanguageValue(optionB, "hi"),

          optionCEn: getLanguageValue(optionC, "en"),
          optionCHi: getLanguageValue(optionC, "hi"),

          optionDEn: getLanguageValue(optionD, "en"),
          optionDHi: getLanguageValue(optionD, "hi"),

          correctAnswer: correctAnswerIndex,

          explanationEn: getLanguageValue(
            question.explanation,
            "en"
          ),
          explanationHi: getLanguageValue(
            question.explanation,
            "hi"
          ),

          difficulty: question.difficulty || "medium",
        });
      } catch (err) {
        console.error("EDIT QUESTION ERROR:", err);

        setError(err.message || "Failed to load question");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, router]);

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

      if (!form.test) {
        setError("Please select a test.");
        return;
      }

      if (form.correctAnswer === "") {
        setError("Please select a correct answer.");
        return;
      }

      if (
        !form.questionTextEn.trim() ||
        !form.questionTextHi.trim() ||
        options.some((option) => !option.en || !option.hi)
      ) {
        setError(
          "Please fill in both English and Hindi question and options."
        );
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

      await apiRequest(`/questions/${params.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      router.push("/questions");
    } catch (err) {
      setError(err.message || "Failed to update question");
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

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-zinc-950 p-6 text-zinc-100 md:p-8">
        <p className="text-zinc-400">Loading question...</p>
      </div>
    );
  }

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
            Edit Question
          </h1>

          <p className="mt-1 text-zinc-400">
            Update this question in English and Hindi.
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
                className={selectClasses}
              >
                <option value="">Select a test</option>

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
                  Update the question in both languages.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionTextEn" className="text-zinc-300">
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
                  className={textareaClasses}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionTextHi" className="text-zinc-300">
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
                  className={textareaClasses}
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Answer Options
                </h3>

                <p className="text-sm text-zinc-400">
                  Update all four options in English and Hindi.
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
                        English
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
                        हिंदी
                      </Label>

                      <Input
                        id={option.hi}
                        name={option.hi}
                        value={form[option.hi]}
                        onChange={handleChange}
                        placeholder={`विकल्प ${option.letter} हिंदी में लिखें`}
                        required
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

                {optionFields.map((option, index) => (
                  <option key={option.letter} value={String(index)}>
                    Option {option.letter} -{" "}
                    {form[option.en] || "English option"} /{" "}
                    {form[option.hi] || "Hindi option"}
                  </option>
                ))}
              </select>

              <p className="text-xs text-zinc-500">
                Select the correct option. The selection remains the same
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
                  Update the explanation in both languages.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanationEn" className="text-zinc-300">
                  Explanation (English)
                </Label>

                <textarea
                  id="explanationEn"
                  name="explanationEn"
                  value={form.explanationEn}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Explain the correct answer in English..."
                  className={textareaClasses}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanationHi" className="text-zinc-300">
                  व्याख्या (हिंदी)
                </Label>

                <textarea
                  id="explanationHi"
                  name="explanationHi"
                  value={form.explanationHi}
                  onChange={handleChange}
                  rows={3}
                  placeholder="सही उत्तर की व्याख्या हिंदी में लिखें..."
                  className={textareaClasses}
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
                disabled={saving}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {saving ? "Saving..." : "Update Question"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
