"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ThreeDots } from "react-loader-spinner";
import { apiRequest } from "@/lib/api";


export default function FullLengthExamPage() {
    const params = useParams();
    const router = useRouter();
    const examId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [exam, setExam] = useState(null);
    const [attemptId, setAttemptId] = useState("");
    const [sectionIndex, setSectionIndex] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    // modal states
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSectionConfirmation, setShowSectionConfirmation] = useState(false);
    const [showLastQuestionModal, setShowLastQuestionModal] = useState(false); // New modal for last question save & next
    const [visitedQuestions, setVisitedQuestions] = useState({});
    const [markedForReview, setMarkedForReview] = useState({});
    const [savedAnswers, setSavedAnswers] = useState({});
    const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const currentSection = exam?.sections?.[sectionIndex];
    const currentQuestion = currentSection?.questions?.[questionIndex];

    const startAttemptPromiseRef = useRef(null)
    const writeQueueRef = useRef(Promise.resolve());

    const enqueueWrite = useCallback((operation) => {
        const pending = writeQueueRef.current.then(operation, operation);

        // Keep the queue usable even if an individual request fails.
        writeQueueRef.current = pending.catch(() => { });

        return pending;
    }, []);


    const persistProgress = useCallback(
        async (overrides = {}) => {
            if (!attemptId) return null;

            // Only committed answers are saved by Save & Next.
            // Current option selections remain local React state and disappear on refresh.
            const payload = {
                sectionIndex,
                questionIndex,
                markedForReview: Object.keys(markedForReview).filter(
                    (key) => markedForReview[key]
                ),
                visitedQuestions: Object.keys(visitedQuestions).filter(
                    (key) => visitedQuestions[key]
                ),
                ...overrides,
            };

            const data = await enqueueWrite(() =>
                apiRequest(
                    `/full-length-exams/attempts/${attemptId}/progress`,
                    {
                        method: "PATCH",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        body: JSON.stringify(payload),
                    }
                )
            );

            return data;
        },
        [
            attemptId,
            sectionIndex,
            questionIndex,
            markedForReview,
            visitedQuestions,
            enqueueWrite,
        ]
    );

    const saveCommittedAnswer = useCallback(
        async (s, q, selectedAnswer) => {
            if (!attemptId) throw new Error("Attempt is not ready");

            const data = await enqueueWrite(() =>
                apiRequest(
                    `/full-length-exams/attempts/${attemptId}/answers`,
                    {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                        body: JSON.stringify({
                            sectionIndex: s,
                            questionIndex: q,
                            selectedAnswer,
                        }),
                    }
                )
            );
            return data;
        },
        [attemptId, enqueueWrite]
    );

    const submitLockRef = useRef(false);

    const submitExam = useCallback(async () => {

        if (!attemptId || submitLockRef.current) return;
        submitLockRef.current = true;

        setSubmitting(true);
        setError("");

        try {
            // 1. Force clear any pending writes/saves before submitting
            await writeQueueRef.current;

            const data = await apiRequest(
                `/full-length-exams/attempts/${attemptId}/submit`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({}),
                }
            );

            // 2. Clear out local navigation state to avoid stale session cache
            localStorage.removeItem(`exam_timer_${attemptId}`);

            sessionStorage.setItem(
                "fullLengthExamResult",
                JSON.stringify({
                    ...data,
                    category: exam.category,
                    exam: exam.exam,
                })
            );

            // 3. Use replace instead of push so the user cannot back-button into a submitted attempt
            router.replace(`/full-length-exams/result/${attemptId}`);
        } catch (err) {
            setError(err.message || "Error in submission");
            submitLockRef.current = false;
            setSubmitting(false);
        }
    }, [attemptId, router, exam]);

    useEffect(() => {
        const question = exam?.sections?.[sectionIndex]?.questions?.[questionIndex];
        if (!question) return;

        const key = `${sectionIndex}-${questionIndex}`;
        setVisitedQuestions((previous) => ({
            ...previous,
            [key]: true,
        }));
    }, [exam, sectionIndex, questionIndex]);


    useEffect(() => {
        let cancelled = false;

        async function loadExam() {
            try {
                setLoading(true);
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                    router.push("/login");
                    return;
                }

                if (!examId || examId === "ssc-cgl") {
                    throw new Error("ExamId is unavailable");
                }

                const examData = await apiRequest(
                    `/full-length-exams/${examId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                const examObject = examData;

                if (
                    !examObject ||
                    typeof examObject !== "object" ||
                    !Array.isArray(examObject.sections) ||
                    examObject.sections.length === 0
                ) {
                    throw new Error("Exam sections are not available");
                }

                const hasQuestions = examObject.sections.some(
                    (section) =>
                        Array.isArray(section.questions) &&
                        section.questions.length > 0
                );

                if (!hasQuestions) {
                    throw new Error(
                        "Is exam ke sections mein questions add nahi hain."
                    );
                }

                // 2. Start the attempt only once per in-flight request
                if (!startAttemptPromiseRef.current) {
                    const startRequest = (async () => {
                        const data = await apiRequest(
                            "/full-length-exams/attempts/start",
                            {
                                method: "POST",
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({ examId }),
                            }
                        );

                        if (!data.attemptId) {
                            throw new Error(
                                "Attempt ID nahi mili. Backend response check karo."
                            );
                        }

                        return data;
                    })();

                    startAttemptPromiseRef.current = startRequest;
                }

                let startData;

                try {
                    startData = await startAttemptPromiseRef.current;
                } catch (err) {
                    startAttemptPromiseRef.current = null;
                    throw err;
                }

                // Don't update state if this effect has been cleaned up
                if (cancelled) return;

                // 3. Restore saved answers
                const restoredSavedAnswers = {};
                const restoredAnswers = {};

                for (const item of startData.answers || []) {
                    const key = `${item.sectionIndex}-${item.questionIndex}`;

                    if (item.selectedAnswer) {
                        restoredSavedAnswers[key] = item.selectedAnswer;

                        const options =
                            examObject.sections[item.sectionIndex]
                                ?.questions?.[item.questionIndex]?.options || [];

                        const optionIndex = options.indexOf(
                            item.selectedAnswer
                        );

                        if (optionIndex >= 0) {
                            restoredAnswers[key] = optionIndex;
                        }
                    }
                }

                const restoredMarkedForReview = Object.fromEntries(
                    (startData.markedForReview || []).map(
                        (key) => [key, true]
                    )
                );

                const restoredVisitedQuestions = Object.fromEntries(
                    (startData.visitedQuestions || []).map(
                        (key) => [key, true]
                    )
                );

                // 4. Update exam state
                setExam(examObject);
                setAttemptId(startData.attemptId);
                setSectionIndex(startData.currentSectionIndex ?? 0);
                setQuestionIndex(startData.currentQuestionIndex ?? 0);
                setAnswers(restoredAnswers);
                setSavedAnswers(restoredSavedAnswers);
                setMarkedForReview(restoredMarkedForReview);
                setVisitedQuestions(restoredVisitedQuestions);
                setSecondsLeft(
                    Math.max(0, Number(startData.secondsLeft) || 0)
                );
                setIsPaused(Boolean(startData.paused));
                setShowResumeModal(Boolean(startData.paused));

            } catch (err) {
                if (!cancelled) {
                    setError(err.message || "Exam didn't load");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        if (examId) {
            loadExam();
        } else {
            setError("ExamId is unavailable");
            setLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [examId, router]);

    useEffect(() => {
        if (!exam || !attemptId || loading || submitting || isPaused) return;

        const pauseOnLeave = () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            const payload = {
                sectionIndex,
                questionIndex,
                paused: true,
                secondsLeft,
                markedForReview: Object.keys(markedForReview).filter((key) => markedForReview[key]),
                visitedQuestions: Object.keys(visitedQuestions).filter((key) => visitedQuestions[key]),
            };

            apiRequest(
                `/full-length-exams/attempts/${attemptId}/progress`,
                {
                    method: "PATCH",
                    keepalive: true,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            ).catch(() => { });
        };

        window.addEventListener("pagehide", pauseOnLeave);
        window.addEventListener("beforeunload", pauseOnLeave);

        return () => {
            window.removeEventListener("pagehide", pauseOnLeave);
            window.removeEventListener("beforeunload", pauseOnLeave);
        };
    }, [
        exam, attemptId, loading, submitting, isPaused,
        sectionIndex, questionIndex, secondsLeft, markedForReview, visitedQuestions
    ]);

    useEffect(() => {
        if (!exam || !attemptId || loading || submitting) return;

        persistProgress().catch((syncError) => {
            console.error("Progress sync failed:", syncError);
        });
    }, [
        exam,
        attemptId,
        loading,
        submitting,
        sectionIndex,
        questionIndex,
        markedForReview,
        visitedQuestions,
        persistProgress,
    ]);

    useEffect(() => {
        if (!exam || !attemptId || submitting || isPaused) return;
        if (secondsLeft <= 0) {
            if (sectionIndex < exam.sections.length - 1) {
                const nextIndex = sectionIndex + 1;
                setSectionIndex(nextIndex);
                setQuestionIndex(0);
                setSecondsLeft(
                    Math.max(1, Number(exam.sections[nextIndex].durationMinutes) || 1) * 60
                );
            } else {
                submitExam();
            }
            return;
        }
        const timer = setTimeout(() => {
            setSecondsLeft((previous) => previous - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [secondsLeft, exam, attemptId, sectionIndex, submitting, submitExam, isPaused]);

    if (loading) {
        return (
            <main className="flex justify-center p-8">
                <ThreeDots />
            </main>
        );
    }

    if (error && !exam) {
        return (
            <main className="mx-auto max-w-3xl space-y-4 p-6">
                <h1 className="text-xl font-bold">Exam load nahi hua</h1>
                <p className="text-red-600">{error}</p>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-lg border px-4 py-2"
                >
                    Back
                </button>
            </main>
        );
    }

    if (!exam || !currentSection || !currentQuestion) {
        return (
            <main className="mx-auto max-w-3xl space-y-3 p-6">
                <h1 className="text-xl font-bold">Question load nahi hua</h1>
                <p className="text-red-600">
                    {error ||
                        `Section ${sectionIndex + 1} mein question ${questionIndex + 1} nahi mila.`}
                </p>
            </main>
        );
    }

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const answerKey = `${sectionIndex}-${questionIndex}`;
    const selectedAnswerIndex = answers[answerKey];
    const isCurrentMarked = !!markedForReview[answerKey];
    const questions = currentSection.questions;

    const sectionSummary = exam.sections.map((section, sIndex) => {
        const totalQ = section.questions.length;
        const attemptedQ = section.questions.reduce((count, _, qIndex) => {
            const ans = savedAnswers[`${sIndex}-${qIndex}`];
            return count + (ans !== undefined && ans !== "" ? 1 : 0);
        }, 0);
        const markedQ = section.questions.reduce((count, _, qIndex) => {
            return count + (markedForReview[`${sIndex}-${qIndex}`] ? 1 : 0);
        }, 0);
        const leftQ = totalQ - attemptedQ;

        return {
            name: section.name,
            totalQuestions: totalQ,
            attemptedQuestions: attemptedQ,
            markedQuestions: markedQ,
            leftQuestions: leftQ,
        };
    });

    const totalQuestionsCount = sectionSummary.reduce((sum, s) => sum + s.totalQuestions, 0);
    const totalAttemptedCount = sectionSummary.reduce((sum, s) => sum + s.attemptedQuestions, 0);
    const totalMarkedCount = sectionSummary.reduce((sum, s) => sum + s.markedQuestions, 0);
    const totalLeftCount = totalQuestionsCount - totalAttemptedCount;

    const answeredQuestionsCount = questions.filter((_, qIndex) => {
        const ans = savedAnswers[`${sectionIndex}-${qIndex}`];
        return ans !== undefined && ans !== "";
    }).length;

    const notAnsweredQuestionsCount = questions.length - answeredQuestionsCount;
    const markedCount = questions.filter((_, qIndex) => !!markedForReview[`${sectionIndex}-${qIndex}`]).length;


    // Reusable Palette & Sidebar Content
    const PaletteSidebarContent = () => (
        <aside className="p-4 bg-white flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="text-left font-bold text-gray-800 text-sm">
                        {currentSection.name}
                    </div>
                    <button
                        onClick={() => setIsMobilePaletteOpen(false)}
                        className="lg:hidden font-bold text-gray-600 px-2 py-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Question Grid Palette */}
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 mb-6">
                    {questions.map((question, qIndex) => {
                        const isCurrent = questionIndex === qIndex;
                        const paletteAnswerKey = `${sectionIndex}-${qIndex}`;
                        const ans = savedAnswers[paletteAnswerKey];
                        const isAnswered = ans !== undefined && ans !== null && ans !== "";
                        const isMarked = !!markedForReview[paletteAnswerKey];

                        let btnStyle = "cursor-pointer bg-blue-700 border-gray-300 text-white hover:bg-blue-800";
                        if (isMarked && isAnswered) {
                            btnStyle = "cursor-pointer bg-yellow-400 text-gray-900 border-yellow-600 font-bold";
                        } else if (isMarked) {
                            btnStyle = "cursor-pointer bg-red-900 text-white border-red-500 font-bold";
                        } else if (isAnswered) {
                            btnStyle = "cursor-pointer bg-green-700 text-white border-blue-700";
                        }

                        if (isCurrent) {
                            btnStyle += " ring-2 ring-offset-1 ring-gray-400";
                        }

                        return (
                            <button
                                key={question._id || qIndex}
                                type="button"
                                onClick={() => {
                                    const committed = savedAnswers[paletteAnswerKey];
                                    const optionList = currentSection?.questions?.[qIndex]?.options || [];
                                    const committedIndex = optionList.indexOf(committed);
                                    setAnswers((previous) => {
                                        // If this question has a committed answer, restore it.
                                        // Otherwise preserve any unsaved local selection while navigating.
                                        if (committedIndex < 0) return previous;
                                        return { ...previous, [paletteAnswerKey]: committedIndex };
                                    });
                                    setQuestionIndex(qIndex);
                                    setIsMobilePaletteOpen(false);
                                }}
                                className={`h-9 w-full flex items-center justify-center font-bold text-xs rounded border transition ${btnStyle}`}
                            >
                                {qIndex + 1}
                            </button>
                        );
                    })}
                </div>


                {/* Section Analysis Table */}
                <div className="border border-gray-300 rounded overflow-hidden">
                    <div className="bg-gray-300 text-gray-900 text-center font-bold text-xs py-1.5 border-b border-gray-300 uppercase">
                        {currentSection.name} Analysis
                    </div>
                    <table className="w-full text-xs">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="p-1.5 pl-2 text-gray-700">Answered</td>
                                <td className="p-1.5 pr-2 text-right font-bold bg-green-700 text-white"></td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="p-1.5 pl-2 text-gray-700">Not Answered</td>
                                <td className="p-1.5 pr-2 text-right font-bold bg-blue-700 text-white"></td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="p-1.5 pl-2 text-gray-700">Mark for Review</td>
                                <td className="p-1.5 pr-2 text-right font-bold bg-red-800 text-white"></td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="p-1.5 pl-2 text-gray-700">Mark for Review + answered</td>
                                <td className="p-1.5 pr-2 text-right font-bold bg-yellow-400 text-white"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </aside>
    );

    // for pause/resume of test
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((err) => {
                console.error("Error attempting to enable full-screen mode:", err);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col select-none text-sm pb-14 lg:pb-0">
            {/* Top Bar matching exam interface  */}
            <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black tracking-tight text-[#0ad0f4]">TopicWise</span>
                    </div>
                    <div className="border-l border-gray-300 pl-4">
                        <h1 className="font-semibold text-gray-800 text-sm truncate max-w-[150px] sm:max-w-none">{exam.title}</h1>
                    </div>
                </div>


                <div className="flex items-center gap-2">
                    {/* Full Screen Button */}
                    <button
                        type="button"
                        onClick={toggleFullScreen}
                        className="cursor-pointer border border-gray-300 rounded px-2.5 py-1 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700"
                    >
                        {isFullscreen ? "Exit Fullscreen" : "Full Screen"}
                    </button>

                    {/* Resume / Pause Test Modal Button */}
                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                await persistProgress({ paused: true, secondsLeft });
                                setIsPaused(true);
                                setShowResumeModal(true);
                            } catch (pauseError) {
                                setError(pauseError.message || "Unable to pause the test.");
                            }
                        }}
                        className="cursor-pointer border border-blue-300 rounded px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700"
                    >
                        Pause Test
                    </button>
                </div>



                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-1">
                        <button className="bg-blue-700 text-white text-xs px-2 py-1 rounded font-medium cursor-pointer">Zoom (+)</button>
                        <button className="bg-blue-700 text-white text-xs px-2 py-1 rounded font-medium cursor-pointer">Zoom (-)</button>
                    </div>

                    <div className="cursor-pointer border border-gray-300 rounded px-3 py-1 bg-gray-50 flex items-center gap-2">
                        <span className="text-xs text-gray-600 font-semibold">Section Time</span>
                        <span className="text-red-600 font-bold text-base tabular-nums">
                            {String(minutes).padStart(2, "0")} : {String(seconds).padStart(2, "0")}
                        </span>
                    </div>

                    <div className="cursor-pointer hidden sm:flex items-center gap-1 border-l pl-3">
                        <div className="w-8 h-10 bg-gray-300 rounded border border-gray-400 flex items-center justify-center text-[9px] text-gray-600 font-medium">
                            Photo
                        </div>
                        <div className="w-8 h-10 bg-gray-300 rounded border border-gray-400 flex items-center justify-center text-[9px] text-gray-600 font-medium">
                            Photo
                        </div>
                    </div>
                </div>
            </header>

            {/* Sub-header Navigation Tabs & Section Indicators */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between text-xs font-semibold text-blue-700 overflow-x-auto">
                <div className="flex items-center gap-4 whitespace-nowrap">
                    <span className="cursor-pointer hover:underline text-[#0ad0f4] font-bold">SYMBOLS</span>
                    <span className="cursor-pointer hover:underline text-red-400 font-bold">INSTRUCTIONS</span>
                    <span className="cursor-pointer hover:underline text-red-800 font-bold">OVERALL TEST SUMMARY</span>
                </div>

                <div className="cursor-pointer text-xs font-bold text-gray-800 whitespace-nowrap pl-4">
                    Total Questions Answered: <span className="bg-amber-300 px-2 py-0.5 rounded text-black">{totalAttemptedCount}</span>
                </div>
            </div>

            {/* Action Bar */}
            <div className="border-b border-gray-200 px-4 py-2">
                <div className="flex items-center gap-2 overflow-x-auto">

                    <div className="flex items-center gap-2 w-auto md:w-[30%] shrink-0">
                        {exam.sections.map((section, index) => (
                            <div
                                key={section._id || index}
                                className={`cursor-pointer px-3 py-1 uppercase rounded font-bold text-xs ${index === sectionIndex
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-50 text-gray-600 border border-gray-200"
                                    }`}
                            >
                                {section.name?.toLowerCase() === "reasoning"
                                    ? "PART-A"
                                    : section.name?.toLowerCase() === "gs"
                                        ? "PART-B"
                                        : section.name?.toLowerCase() === "maths"
                                            ? "PART-C"
                                            : section.name?.toLowerCase() === "english"
                                                ? "PART-D"
                                                : section.name}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            disabled={questionIndex === 0}
                            onClick={() => setQuestionIndex((prev) => prev - 1)}
                            className="cursor-pointer px-4 py-1.5 rounded text-xs bg-blue-700 text-white shadow"
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            onClick={async () => {
                                setMarkedForReview((prev) => {
                                    const nextMarkedState = { ...prev };
                                    if (nextMarkedState[answerKey]) {
                                        delete nextMarkedState[answerKey];
                                    } else {
                                        nextMarkedState[answerKey] = true;
                                    }
                                    return nextMarkedState;
                                });
                            }}
                            className={`cursor-pointer px-4 py-1.5 rounded text-xs shadow transition font-semibold ${isCurrentMarked
                                ? "bg-gray-500 text-white border border-yellow-600"
                                : "bg-blue-700 text-white"
                                }`}
                        >
                            {isCurrentMarked ? "Marked for Review" : "Mark for Review"}
                        </button>

                        <button
                            type="button"
                            onClick={async () => {
                                const selectedIdx = answers[answerKey];
                                const optionText =
                                    selectedIdx !== undefined && selectedIdx !== null && selectedIdx !== ""
                                        ? currentQuestion.options[selectedIdx]
                                        : "";

                                try {
                                    await saveCommittedAnswer(sectionIndex, questionIndex, optionText);
                                } catch (saveError) {
                                    setError(saveError.message || "Unable to save answer.");
                                    return;
                                }

                                // Keep the review flag when saving/navigating. The palette
                                // will show yellow for saved + review, and red for review
                                // without a committed answer.

                                if (optionText) {
                                    setSavedAnswers((prev) => ({
                                        ...prev,
                                        [answerKey]: optionText,
                                    }));
                                } else {
                                    setSavedAnswers((prev) => {
                                        const copy = { ...prev };
                                        delete copy[answerKey];
                                        return copy;
                                    });
                                }

                                if (questionIndex < questions.length - 1) {
                                    setQuestionIndex((prev) => prev + 1);
                                } else {
                                    setShowLastQuestionModal(true);
                                }
                            }}
                            className="cursor-pointer px-4 py-1.5 rounded text-xs bg-blue-700 text-white shadow"
                        >
                            Save & Next
                        </button>

                        <button
                            type="button"
                            disabled={sectionIndex >= (exam?.sections?.length ?? 0) - 1}
                            onClick={() => setShowSectionConfirmation(true)}
                            className="cursor-pointer px-4 py-1.5 rounded text-xs bg-blue-700 text-white shadow disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Submit Section
                        </button>

                        <button
                            type="button"
                            disabled={submitting}
                            onClick={() => setShowConfirmation(true)}
                            className="cursor-pointer px-5 py-1.5 bg-blue-700 text-white rounded text-xs hover:bg-blue-800 shadow disabled:opacity-50"
                        >
                            {submitting ? "Submitting..." : "Submit Test"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Quick Bar for Question Palette Drawer */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 p-2 flex items-center justify-between z-40 shadow-lg">
                <button
                    type="button"
                    disabled={questionIndex === 0}
                    onClick={() => setQuestionIndex((prev) => prev - 1)}
                    className="cursor-pointer px-4 py-1.5 rounded text-xs bg-gray-200 text-gray-800 font-semibold disabled:opacity-40"
                >
                    Prev
                </button>
                <button
                    type="button"
                    onClick={() => setIsMobilePaletteOpen(true)}
                    className="cursor-pointer px-4 py-1.5 rounded text-xs bg-amber-500 text-white font-bold shadow"
                >
                    Question Palette ({questionIndex + 1}/{questions.length})
                </button>
                <button
                    type="button"
                    disabled={questionIndex === questions.length - 1}
                    onClick={() => setQuestionIndex((prev) => prev + 1)}
                    className="cursor-pointer px-4 py-1.5 rounded text-xs bg-blue-700 text-white font-semibold"
                >
                    Next
                </button>
            </div>

            {/* Main Content & Right Sidebar Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px]">
                {/* Left Workspace: Question Panel */}
                <div className="p-6 flex flex-col justify-between border-r border-gray-200">
                    <div className="space-y-6">
                        <div className="cursor-pointer flex items-center justify-between text-xs text-gray-700 font-semibold">
                            <span>Question No. {questionIndex + 1}</span>
                            <div className="flex items-center gap-3">
                                <div className="cursor-pointer flex items-center gap-1">
                                    <span>Select Language</span>
                                    <select className="cursor-pointer border border-gray-300 rounded px-2 py-0.5 text-xs bg-white text-gray-800 font-normal">
                                        <option>English</option>
                                    </select>
                                </div>
                                <span className="text-red-600 cursor-pointer flex items-center gap-1 font-medium">⚠️ Report</span>
                            </div>
                        </div>

                        {/* Question Text Box */}
                        <div className="cursor-pointer border border-gray-200 p-4 rounded bg-white text-gray-900 font-medium text-sm">
                            {currentQuestion.questionText}
                        </div>

                        {/* Options List tracked by Option Index */}
                        <div className="space-y-3">
                            {(currentQuestion.options || []).map((option, index) => {
                                const isSelected = selectedAnswerIndex === index;
                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-3 p-3 rounded border transition ${isSelected
                                            ? "border-blue-600 bg-blue-50/30"
                                            : "border-gray-200 bg-white"
                                            }`}
                                    >
                                        <div
                                            onClick={() => {
                                                // Choosing an option does not clear Mark for Review.
                                                // Until Save & Next commits it, the palette stays red.
                                                setAnswers((previous) => ({
                                                    ...previous,
                                                    [answerKey]: isSelected ? undefined : index,
                                                }));
                                            }}
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 cursor-pointer transition ${isSelected ? "border-blue-600 bg-blue-600" : "border-gray-400 bg-white"
                                                }`}
                                        >
                                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                        <span className="text-gray-800 text-sm select-none">{option}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Palette & Analysis Table (Desktop) */}
                <div className="cursor-pointer hidden lg:block">
                    <PaletteSidebarContent />
                </div>
            </div>

            {/* Mobile / Tablet Question Palette Drawer Overlay */}
            {isMobilePaletteOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 lg:hidden flex justify-end">
                    <div className="cursor-pointer w-[85%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col">
                        <PaletteSidebarContent />
                    </div>
                </div>
            )}

            {/* Last Question Modal (Triggered on Save & Next at the end of section) */}
            {showLastQuestionModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 cursor-pointer ">End of Section</h2>
                        <p className="text-sm text-gray-600">
                            This is the last question of the current section. Your answer has been saved. You can proceed to submit the section or review your answers.
                        </p>
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setShowLastQuestionModal(false)}
                                className="cursor-pointer px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold shadow"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Exam Submission Confirmation Modal (Submit Test) */}
            {showConfirmation && (
                <div className="cursor-pointer fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="cursor-pointer w-full max-w-3xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="cursor-pointer px-6 py-4 border-b border-gray-200 font-bold text-lg text-gray-800 flex justify-between items-center bg-gray-50">
                            <span>Exam Summary & Test Submission</span>
                            <span className="cursor-pointer text-xs font-normal text-gray-500">Review your test progress section-wise</span>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* Section-wise breakdown table */}
                            <div className="cursor-pointer border border-gray-200 rounded-lg overflow-hidden">
                                <table className="cursor-pointer w-full text-xs text-left">
                                    <thead className="cursor-pointer bg-gray-100 text-gray-700 uppercase font-semibold border-b">
                                        <tr>
                                            <th className="p-3">Section Name</th>
                                            <th className="p-3 text-center">Total</th>
                                            <th className="p-3 text-center text-green-700">Answered</th>
                                            <th className="p-3 text-center text-yellow-600">Marked for Review</th>
                                            <th className="p-3 text-center text-red-600">Left / Unattempted</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sectionSummary.map((sec, idx) => (
                                            <tr key={idx} className="cursor-pointer border-b hover:bg-gray-50">
                                                <td className="p-3 font-semibold text-gray-800">{sec.name}</td>
                                                <td className="p-3 text-center font-bold">{sec.totalQuestions}</td>
                                                <td className="p-3 text-center font-bold text-green-700 bg-green-50/50">{sec.attemptedQuestions}</td>
                                                <td className="p-3 text-center font-bold text-yellow-600 bg-yellow-50/50">{sec.markedQuestions}</td>
                                                <td className="p-3 text-center font-bold text-red-600 bg-red-50/50">{sec.leftQuestions}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Overall summary stats */}
                            <div className="cursor-pointer grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-gray-50 border p-3 rounded text-center">
                                    <div className="text-xs text-gray-500 font-medium">Total Questions</div>
                                    <div className="text-lg font-bold text-gray-800">{totalQuestionsCount}</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 p-3 rounded text-center">
                                    <div className="text-xs text-green-700 font-medium">Total Answered</div>
                                    <div className="text-lg font-bold text-green-800">{totalAttemptedCount}</div>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-center">
                                    <div className="text-xs text-yellow-700 font-medium">Total Marked</div>
                                    <div className="text-lg font-bold text-yellow-800">{totalMarkedCount}</div>
                                </div>
                                <div className="bg-red-50 border border-red-200 p-3 rounded text-center">
                                    <div className="text-xs text-red-700 font-medium">Total Left</div>
                                    <div className="text-lg font-bold text-red-800">{totalLeftCount}</div>
                                </div>
                            </div>

                            <div className="text-center font-semibold text-gray-800 text-sm pt-2">
                                Are you sure you want to final submit the exam?
                            </div>
                        </div>

                        {/* Modal Footer Buttons */}
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={() => setShowConfirmation(false)}
                                className="cursor-pointer bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded font-semibold text-sm shadow transition disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                disabled={submitting}
                                onClick={submitExam}
                                className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold text-sm shadow transition disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Section Submission Confirmation Modal (Submit Section / Next Section) */}
            {showSectionConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-xl bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col p-6 space-y-4">
                        {/* Timer running at top of modal */}
                        <div className="flex items-center justify-between bg-gray-100 border border-gray-200 px-4 py-2 rounded">
                            <span className="text-xs font-semibold text-gray-700">⏱️ Section Time Left:</span>
                            <span className="text-red-600 font-bold font-mono text-base tabular-nums">
                                {String(minutes).padStart(2, "0")} : {String(seconds).padStart(2, "0")}
                            </span>
                        </div>

                        <h2 className="text-lg font-bold text-gray-900">Summary of {currentSection.name}</h2>
                        <p className="text-xs text-gray-600">
                            You are about to submit this section and proceed. Here is your current status:
                        </p>

                        <div className="cursor-pointer grid grid-cols-2 gap-3 pt-2">
                            <div className="cursor-pointer bg-gray-50 border p-3 rounded flex justify-between items-center">
                                <span className="text-xs text-gray-600 font-medium">Total Questions</span>
                                <span className="font-bold text-gray-900">{questions.length}</span>
                            </div>
                            <div className="cursor-pointer bg-green-50 border border-green-200 p-3 rounded flex justify-between items-center">
                                <span className="text-xs text-green-700 font-medium">Attempted</span>
                                <span className="font-bold text-green-800">{answeredQuestionsCount}</span>
                            </div>
                            <div className="cursor-pointer bg-yellow-50 border border-yellow-200 p-3 rounded flex justify-between items-center">
                                <span className="text-xs text-yellow-700 font-medium">Marked for Review</span>
                                <span className="font-bold text-yellow-800">{markedCount}</span>
                            </div>
                            <div className="cursor-pointer bg-red-50 border border-red-200 p-3 rounded flex justify-between items-center">
                                <span className="text-xs text-red-700 font-medium">Left / Unattempted</span>
                                <span className="font-bold text-red-800">{notAnsweredQuestionsCount}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setShowSectionConfirmation(false)}
                                className="cursor-pointer px-4 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-100 shadow-sm"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    const nextIndex = sectionIndex + 1;
                                    if (nextIndex >= exam.sections.length) {
                                        setShowSectionConfirmation(false);
                                        return;
                                    }
                                    if (nextIndex < exam.sections.length) {
                                        try {
                                            await persistProgress({
                                                sectionIndex: nextIndex,
                                                questionIndex: 0,
                                            });
                                        } catch (progressError) {
                                            setError(progressError.message || "Unable to save section progress.");
                                            return;
                                        }

                                        setShowSectionConfirmation(false);
                                        setSectionIndex(nextIndex);
                                        setQuestionIndex(0);
                                        setSecondsLeft(
                                            Math.max(
                                                1,
                                                Number(exam.sections[nextIndex].durationMinutes) || 1
                                            ) * 60
                                        );
                                    }
                                }}
                                className="cursor-pointer px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold shadow"
                            >
                                {sectionIndex < exam.sections.length - 1 ? "Confirm & Continue" : "Confirm Section"}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* resume model  */}

            {showResumeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col p-6 space-y-4">
                        {/* Timer running / stopped on modal */}
                        <div className="flex items-center justify-between bg-gray-100 border border-gray-200 px-4 py-2 rounded">
                            <span className="text-xs font-semibold text-gray-700">⏱️ Test Time Left:</span>
                            <span className="text-red-600 font-bold font-mono text-base tabular-nums">
                                {String(minutes).padStart(2, "0")} : {String(seconds).padStart(2, "0")} (Paused)
                            </span>
                        </div>

                        <h2 className="text-lg font-bold text-gray-900">Test Paused</h2>

                        <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                            <div className="bg-gray-50 border p-3 rounded flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Solved / Attempted</span>
                                <span className="font-bold text-gray-900">{totalAttemptedCount}</span>
                            </div>
                            <div className="bg-red-50 border border-red-200 p-3 rounded flex justify-between items-center">
                                <span className="text-red-700 font-medium">Left</span>
                                <span className="font-bold text-red-800">{totalLeftCount}</span>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded flex justify-between items-center col-span-2">
                                <span className="text-yellow-700 font-medium">Marked for Review</span>
                                <span className="font-bold text-yellow-800">{totalMarkedCount}</span>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const data = await persistProgress({ paused: false });
                                        setSecondsLeft(Math.max(0, Number(data?.secondsLeft) || 0));
                                        setShowResumeModal(false);
                                        setIsPaused(false);
                                    } catch (resumeError) {
                                        setError(resumeError.message || "Unable to resume the test.");
                                    }
                                }}
                                className="px-4 py-2 border border-gray-300 rounded text-sm font-semibold text-gray-700 hover:bg-gray-100 shadow-sm"
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        const data = await persistProgress({ paused: false });
                                        setSecondsLeft(Math.max(0, Number(data?.secondsLeft) || 0));
                                        setShowResumeModal(false);
                                        setIsPaused(false);
                                    } catch (resumeError) {
                                        setError(resumeError.message || "Unable to resume the test.");
                                    }
                                }}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold shadow"
                            >
                                Resume Test
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}