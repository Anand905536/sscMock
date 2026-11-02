
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const createQuestion = () => ({
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
});

const createSection = () => ({
  name: "",
  durationMinutes: 20,
  marksPerQuestion: 2,
  negativeMarks: 0.5,
  questions: [createQuestion()],
});

export default function CreateFullLengthExamPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    category: "SSC",
    exam: "ssc-cgl",
    type: "mock",
    status: "draft",
  });

  const [sections, setSections] = useState([
    {
      ...createSection(),
      name: "Reasoning",
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateSection = (sectionIndex, field, value) => {
    setSections((prev) =>
      prev.map((section, index) =>
        index === sectionIndex
          ? { ...section, [field]: value }
          : section
      )
    );
  };

  const addSection = () => {
    setSections((prev) => [
      ...prev,
      {
        ...createSection(),
        name: `Section ${prev.length + 1}`,
      },
    ]);
  };

  const removeSection = (sectionIndex) => {
    setSections((prev) =>
      prev.filter((_, index) => index !== sectionIndex)
    );
  };

  const addQuestion = (sectionIndex) => {
    setSections((prev) =>
      prev.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              questions: [...section.questions, createQuestion()],
            }
          : section
      )
    );
  };

  const removeQuestion = (sectionIndex, questionIndex) => {
    setSections((prev) =>
      prev.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              questions: section.questions.filter(
                (_, qIndex) => qIndex !== questionIndex
              ),
            }
          : section
      )
    );
  };

  const updateQuestion = (
    sectionIndex,
    questionIndex,
    field,
    value
  ) => {
    setSections((prev) =>
      prev.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              questions: section.questions.map((question, qIndex) =>
                qIndex === questionIndex
                  ? { ...question, [field]: value }
                  : question
              ),
            }
          : section
      )
    );
  };

  const updateOption = (
    sectionIndex,
    questionIndex,
    optionIndex,
    value
  ) => {
    setSections((prev) =>
      prev.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              questions: section.questions.map((question, qIndex) => {
                if (qIndex !== questionIndex) return question;

                const options = [...question.options];
                const oldOption = options[optionIndex];
                options[optionIndex] = value;

                return {
                  ...question,
                  options,
                  correctAnswer:
                    question.correctAnswer === oldOption &&
                    oldOption !== value
                      ? ""
                      : question.correctAnswer,
                };
              }),
            }
          : section
      )
    );
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Exam title enter karo.");
      return;
    }

    if (sections.length === 0) {
      setError("Kam se kam ek section add karo.");
      return;
    }

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      if (!section.name.trim() || Number(section.durationMinutes) < 1) {
        setError(`Section ${i + 1} ka naam aur valid timer bharo.`);
        return;
      }

      if (section.questions.length === 0) {
        setError(`${section.name} mein kam se kam ek question add karo.`);
        return;
      }

      for (let j = 0; j < section.questions.length; j++) {
        const question = section.questions[j];

        if (
          !question.questionText.trim() ||
          question.options.some((option) => !option.trim()) ||
          !question.correctAnswer ||
          !question.options.includes(question.correctAnswer)
        ) {
          setError(
            `${section.name}, Question ${j + 1}: question, chaar options aur correct answer bharo.`
          );
          return;
        }
      }
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        sections: sections.map((section) => ({
          ...section,
          durationMinutes: Number(section.durationMinutes),
          marksPerQuestion: Number(section.marksPerQuestion),
          negativeMarks: Number(section.negativeMarks),
          questions: section.questions.map((question) => ({
            ...question,
            options: question.options.map((option) => option.trim()),
            questionText: question.questionText.trim(),
            correctAnswer: question.correctAnswer.trim(),
          })),
        })),
      };

      const response = await fetch(
        "http://localhost:5000/api/full-length-exams",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Exam create nahi hua.");
      }

      setSuccess("Exam successfully create ho gaya!");
      router.push("/full-length-exams");
    } catch (err) {
      setError(err.message || "Kuch galat hua.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-zinc-100 placeholder:text-zinc-500 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  const labelClass =
    "block space-y-2 text-sm font-medium text-zinc-300";

  const cardClass =
    "space-y-5 rounded-xl border border-zinc-800 bg-zinc-900 p-5";

  const secondaryButtonClass =
    "rounded-lg border border-zinc-700 px-4 py-2 font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white";

  return (
    <main className="min-h-screen w-full space-y-6 bg-zinc-950 p-6 text-zinc-100 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl">
          Create Full-Length Exam
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Create exam sections, configure timers and add questions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exam Details */}
        <div className={cardClass}>
          <h2 className="text-lg font-bold text-white">
            Exam Details
          </h2>

          <label className={labelClass}>
            Exam Title
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => updateForm("title", e.target.value)}
              placeholder="SSC CGL Full Mock Test 1"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Category
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
              >
                <option value="SSC">SSC</option>
                <option value="Banking">Banking</option>
                <option value="Railway">Railway</option>
                <option value="UPSC">UPSC</option>
              </select>
            </label>

            <label className={labelClass}>
              Exam Slug
              <input
                className={inputClass}
                value={form.exam}
                onChange={(e) => updateForm("exam", e.target.value)}
                placeholder="ssc-cgl"
                required
              />
            </label>

            <label className={labelClass}>
              Exam Type
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => updateForm("type", e.target.value)}
              >
                <option value="mock">Mock Test</option>
                <option value="pyq">Previous Year Paper (PYQ)</option>
              </select>
            </label>

            <label className={labelClass}>
              Publish Status
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => updateForm("status", e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">
                Sections & Timers
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Add sections and configure their exam settings.
              </p>
            </div>

            <button
              type="button"
              onClick={addSection}
              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
            >
              + Add Section
            </button>
          </div>

          {sections.map((section, sectionIndex) => (
            <section
              key={sectionIndex}
              className={cardClass}
            >
              <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Section {sectionIndex + 1}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Configure section and questions
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeSection(sectionIndex)}
                  className="rounded-lg border border-rose-500/30 px-3 py-2 text-sm text-rose-400 transition hover:bg-rose-500/10"
                >
                  Remove Section
                </button>
              </div>

              {/* Section Settings */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Section Name
                  <input
                    className={inputClass}
                    value={section.name}
                    onChange={(e) =>
                      updateSection(sectionIndex, "name", e.target.value)
                    }
                    placeholder="Reasoning"
                    required
                  />
                </label>

                <label className={labelClass}>
                  Timer (minutes)
                  <input
                    className={inputClass}
                    type="number"
                    min="1"
                    value={section.durationMinutes}
                    onChange={(e) =>
                      updateSection(
                        sectionIndex,
                        "durationMinutes",
                        e.target.value
                      )
                    }
                    required
                  />
                </label>

                <label className={labelClass}>
                  Marks Per Correct Answer
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.25"
                    value={section.marksPerQuestion}
                    onChange={(e) =>
                      updateSection(
                        sectionIndex,
                        "marksPerQuestion",
                        e.target.value
                      )
                    }
                    required
                  />
                </label>

                <label className={labelClass}>
                  Negative Marks Per Wrong Answer
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="0.25"
                    value={section.negativeMarks}
                    onChange={(e) =>
                      updateSection(
                        sectionIndex,
                        "negativeMarks",
                        e.target.value
                      )
                    }
                    required
                  />
                </label>
              </div>

              {/* Questions */}
              <div className="space-y-4 border-t border-zinc-800 pt-5">
                <h3 className="font-semibold text-white">
                  Section Questions
                </h3>

                {section.questions.map((question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="space-y-4 rounded-xl border border-zinc-700 bg-zinc-950 p-4"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                      <h4 className="font-semibold text-emerald-400">
                        Question {questionIndex + 1}
                      </h4>

                      <button
                        type="button"
                        onClick={() =>
                          removeQuestion(sectionIndex, questionIndex)
                        }
                        className="text-sm font-medium text-rose-400 transition hover:text-rose-300"
                      >
                        Remove Question
                      </button>
                    </div>

                    <label className={labelClass}>
                      Question Text
                      <textarea
                        className={inputClass}
                        rows={3}
                        value={question.questionText}
                        onChange={(e) =>
                          updateQuestion(
                            sectionIndex,
                            questionIndex,
                            "questionText",
                            e.target.value
                          )
                        }
                        placeholder="Enter your question"
                        required
                      />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {question.options.map((option, optionIndex) => (
                        <label className={labelClass} key={optionIndex}>
                          Option {String.fromCharCode(65 + optionIndex)}
                          <input
                            className={inputClass}
                            value={option}
                            onChange={(e) =>
                              updateOption(
                                sectionIndex,
                                questionIndex,
                                optionIndex,
                                e.target.value
                              )
                            }
                            placeholder={`Enter option ${optionIndex + 1}`}
                            required
                          />
                        </label>
                      ))}
                    </div>

                    <label className={labelClass}>
                      Correct Answer
                      <select
                        className={inputClass}
                        value={question.correctAnswer}
                        onChange={(e) =>
                          updateQuestion(
                            sectionIndex,
                            questionIndex,
                            "correctAnswer",
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value="">Select the correct option</option>
                        {question.options.map((option, optionIndex) => (
                          <option
                            key={optionIndex}
                            value={option}
                            disabled={!option.trim()}
                          >
                            {String.fromCharCode(65 + optionIndex)}
                            {option.trim() ? ` - ${option}` : " - Empty option"}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={labelClass}>
                      Explanation (optional)
                      <textarea
                        className={inputClass}
                        rows={2}
                        value={question.explanation}
                        onChange={(e) =>
                          updateQuestion(
                            sectionIndex,
                            questionIndex,
                            "explanation",
                            e.target.value
                          )
                        }
                        placeholder="Explain the correct answer"
                      />
                    </label>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addQuestion(sectionIndex)}
                  className={secondaryButtonClass}
                >
                  + Add Question
                </button>
              </div>
            </section>
          ))}
        </div>

        {/* Messages */}
        {error && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
            {success}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Creating Exam..." : "Create Exam"}
        </button>
      </form>
    </main>
  );
}
