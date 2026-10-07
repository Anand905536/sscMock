"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { apiRequest } from "../../../../lib/api";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

export default function NewQuestionPage() {
    const router = useRouter();

    const [tests, setTests] = useState([]);
    const [loadingTests, setLoadingTests] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        test: "",
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "",
        explanation: "",
        difficulty: "medium",
    });

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
                form.optionA.trim(),
                form.optionB.trim(),
                form.optionC.trim(),
                form.optionD.trim(),
            ];

            // The select already contains the actual option text
            const correctAnswer = form.correctAnswer.trim();

            console.log("FORM:", form);
            console.log("OPTIONS:", options);
            console.log("CORRECT ANSWER:", correctAnswer);

            if (!correctAnswer) {
                setError("Please select a correct answer.");
                setSaving(false);
                return;
            }

            if (!options.includes(correctAnswer)) {
                setError("Correct answer must be one of the options.");
                setSaving(false);
                return;
            }

            await apiRequest("/questions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    test: form.test,
                    questionText: form.questionText.trim(),
                    options,
                    correctAnswer,
                    explanation: form.explanation.trim(),
                    difficulty: form.difficulty,
                }),
            });

            router.push("/questions");
        } catch (err) {
            setError(err.message || "Failed to create question");
        } finally {
            setSaving(false);
        }
    };

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
                        Create a new question for your mock test.
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
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                    {loadingTests
                                        ? "Loading tests..."
                                        : "Select a test"}
                                </option>

                                {tests.map((test) => (
                                    <option key={test._id} value={test._id}>
                                        {test.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Question */}
                        <div className="space-y-2">
                            <Label htmlFor="questionText">
                                Question
                            </Label>

                            <textarea
                                id="questionText"
                                name="questionText"
                                value={form.questionText}
                                onChange={handleChange}
                                required
                                rows={4}
                                placeholder="Enter the question..."
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        {/* Options */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Options
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Enter four answer options.
                                </p>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="optionA">Option A</Label>
                                    <Input
                                        id="optionA"
                                        name="optionA"
                                        value={form.optionA}
                                        onChange={handleChange}
                                        placeholder="Enter option A"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="optionB">Option B</Label>
                                    <Input
                                        id="optionB"
                                        name="optionB"
                                        value={form.optionB}
                                        onChange={handleChange}
                                        placeholder="Enter option B"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="optionC">Option C</Label>
                                    <Input
                                        id="optionC"
                                        name="optionC"
                                        value={form.optionC}
                                        onChange={handleChange}
                                        placeholder="Enter option C"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="optionD">Option D</Label>
                                    <Input
                                        id="optionD"
                                        name="optionD"
                                        value={form.optionD}
                                        onChange={handleChange}
                                        placeholder="Enter option D"
                                        required
                                    />
                                </div>
                            </div>
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

                                <option value={form.optionA}>
                                    {form.optionA}
                                </option>

                                <option value={form.optionB}>
                                    {form.optionB}
                                </option>

                                <option value={form.optionC}>
                                    {form.optionC}
                                </option>

                                <option value={form.optionD}>
                                    {form.optionD}
                                </option>
                            </select>
                        </div>

                        {/* Difficulty */}
                        <div className="space-y-2">
                            <Label htmlFor="difficulty">
                                Difficulty
                            </Label>

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
                        <div className="space-y-2">
                            <Label htmlFor="explanation">
                                Explanation
                            </Label>

                            <textarea
                                id="explanation"
                                name="explanation"
                                value={form.explanation}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Explain why this is the correct answer..."
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                            />
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

                            <Button type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Create Question"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}