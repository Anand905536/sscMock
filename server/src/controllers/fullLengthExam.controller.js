import FullLengthExam from "../models/FullLengthExam.model.js";
import FullLengthAttempt from "../models/FullLengthAttempt.model.js";

const getRemainingSeconds = (attempt) => {
    if (attempt.paused) {
        return Math.max(
            0,
            Number(attempt.pausedRemainingSeconds ?? 0)
        );
    }

    if (!attempt.sectionDeadlineAt) return 0;

    return Math.max(
        0,
        Math.ceil(
            (new Date(attempt.sectionDeadlineAt).getTime() - Date.now()) /
            1000
        )
    );
};

const getResumeState = (attempt) => ({
    attemptId: attempt._id,
    examId: attempt.exam,
    status: attempt.status,

    currentSectionIndex: attempt.currentSectionIndex ?? 0,
    currentQuestionIndex: attempt.currentQuestionIndex ?? 0,

    answers: attempt.answers ?? [],
    draftSelections: attempt.draftSelections ?? [],

    markedForReview: attempt.markedForReview ?? [],
    visitedQuestions: attempt.visitedQuestions ?? [],

    paused: Boolean(attempt.paused),
    secondsLeft: getRemainingSeconds(attempt),
    sectionDeadlineAt: attempt.sectionDeadlineAt,
});

export const createFullLengthExam = async (req, res) => {
    try {
        const { title, category, exam, type, sections, status } = req.body;

        if (!title || !category || !exam || !Array.isArray(sections) || !sections.length) {
            return res.status(400).json({ message: "Title, category, exam and sections are required" });
        }

        for (const section of sections) {
            if (!section.name || !section.durationMinutes || !Array.isArray(section.questions) || !section.questions.length) {
                return res.status(400).json({ message: "Every section needs a name, duration and questions" });
            }

            for (const question of section.questions) {
                if (
                    !question.questionText ||
                    !Array.isArray(question.options) ||
                    !question.options.length ||
                    !question.options.includes(question.correctAnswer)
                ) {
                    return res.status(400).json({
                        message: "Every question needs text, options and a valid correct answer",
                    });
                }
            }
        }

        const created = await FullLengthExam.create({
            title, category, exam, type, sections, status,
        });

        res.status(201).json({ message: "Full-length exam created", exam: created });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFullLengthExams = async (req, res) => {
    try {
        const filter = {};

        if (req.user.role !== "admin") filter.status = "published";
        if (req.query.category) filter.category = new RegExp(`^${req.query.category}$`, "i");
        if (req.query.exam) filter.exam = req.query.exam.toLowerCase();
        if (req.query.type) filter.type = req.query.type.toLowerCase();

        const exams = await FullLengthExam.find(filter).sort({ createdAt: -1 });

        const safeExams = exams.map((item) => {
            const exam = item.toObject();

            exam.sections = exam.sections.map((section) => {
                const cleanSection = section.toObject
                    ? section.toObject()
                    : { ...section };

                cleanSection.questions = cleanSection.questions.map((question) => {
                    const cleanQuestion = question.toObject
                        ? question.toObject()
                        : { ...question };
                    delete cleanQuestion.correctAnswer;
                    return cleanQuestion;
                });
                return cleanSection;
            });
            return exam;
        });
        res.json(safeExams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFullLengthExamById = async (req, res) => {
    try {
        const exam = await FullLengthExam.findById(req.params.id);

        if (!exam) return res.status(404).json({ message: "Exam not found" });

        if (req.user.role !== "admin" && exam.status !== "published") {
            return res.status(403).json({ message: "Exam is not available" });
        }

        // Never send correct answers to the candidate.
        const safeExam = exam.toObject();
        safeExam.sections.forEach((section) => {
            section.questions.forEach((question) => {
                delete question.correctAnswer;
            });
        });

        res.json(safeExam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const startFullLengthAttempt = async (req, res) => {
    try {
        const { examId } = req.body;

        if (!examId) {
            return res.status(400).json({
                message: "Exam ID is required",
            });
        }

        const exam = await FullLengthExam.findById(examId);

        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        if (req.user.role !== "admin" && exam.status !== "published") {
            return res.status(403).json({
                message: "Exam is not available",
            });
        }

        let attempt = await FullLengthAttempt.findOne({
            user: req.user.userId,
            exam: exam._id,
            status: "in-progress",
        }).sort({ startedAt: -1 });

        if (attempt) {
            // Backfill timer fields for older attempts created before this update.
            if (
                !attempt.sectionDeadlineAt &&
                !attempt.paused
            ) {
                const section =
                    exam.sections[attempt.currentSectionIndex ?? 0];

                if (section) {
                    attempt.sectionDeadlineAt = new Date(
                        Date.now() +
                        Math.max(1, Number(section.durationMinutes) || 1) *
                        60 *
                        1000
                    );

                    await attempt.save();
                }
            }

            return res.status(200).json({
                resumed: true,
                ...getResumeState(attempt),
            });
        }

        const firstSection = exam.sections[0];

        if (!firstSection) {
            return res.status(400).json({
                message: "This exam has no sections",
            });
        }

        const durationSeconds =
            Math.max(1, Number(firstSection.durationMinutes) || 1) * 60;

        attempt = await FullLengthAttempt.create({
            user: req.user.userId,
            exam: exam._id,
            currentSectionIndex: 0,
            currentQuestionIndex: 0,
            sectionDeadlineAt: new Date(
                Date.now() + durationSeconds * 1000
            ),
        });

        return res.status(201).json({
            resumed: false,
            ...getResumeState(attempt),
        });
    } catch (error) {
        console.error("Start/resume attempt error:", error);

        return res.status(500).json({
            message: error.message,
        });
    }
};

export const submitFullLengthAttempt = async (req, res) => {
    try {
        const attempt = await FullLengthAttempt.findOne({
            _id: req.params.attemptId,
            user: req.user.userId,
        });

        if (!attempt) return res.status(404).json({ message: "Attempt not found" });
        if (attempt.status === "completed") {
            return res.status(400).json({ message: "Attempt already submitted" });
        }

        const exam = await FullLengthExam.findById(attempt.exam);
        if (!exam) return res.status(404).json({ message: "Exam not found" });

        const answers = attempt.answers.map((answer) => ({
            sectionIndex: answer.sectionIndex,
            questionIndex: answer.questionIndex,
            selectedAnswer: answer.selectedAnswer || "",
        }));

        let score = 0;
        const seen = new Set();

        for (const answer of answers) {
            const section = exam.sections[answer.sectionIndex];
            const question = section?.questions[answer.questionIndex];

            if (!question) {
                return res.status(400).json({ message: "Invalid question reference" });
            }

            const key = `${answer.sectionIndex}:${answer.questionIndex}`;
            if (seen.has(key)) {
                return res.status(400).json({ message: "Duplicate answer" });
            }
            seen.add(key);

            const selected = answer.selectedAnswer || "";
            if (selected && !question.options.includes(selected)) {
                return res.status(400).json({ message: "Invalid answer option" });
            }

            if (selected === question.correctAnswer) {
                score += section.marksPerQuestion;
            } else if (selected) {
                score -= section.negativeMarks;
            }
        }

        attempt.answers = answers;
        attempt.score = score;
        attempt.status = "completed";
        attempt.completedAt = new Date();
        await attempt.save();

        res.json({
            message: "Exam submitted",
            score,
            sectionResults: exam.sections.map((section, sectionIndex) => {
                let correct = 0;
                let incorrect = 0;
                let unanswered = 0;
                let sectionScore = 0;

                section.questions.forEach((question, questionIndex) => {
                    const answer = answers.find(
                        (item) =>
                            item.sectionIndex === sectionIndex &&
                            item.questionIndex === questionIndex
                    );
                    const selected = answer?.selectedAnswer || "";

                    if (!selected) {
                        unanswered++;
                    } else if (selected === question.correctAnswer) {
                        correct++;
                        sectionScore += section.marksPerQuestion;
                    } else {
                        incorrect++;
                        sectionScore -= section.negativeMarks;
                    }
                });

                return {
                    section: section.name,
                    correct,
                    incorrect,
                    unanswered,
                    score: sectionScore,
                };
            }),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllPreviousAttempts = async (req, res) => {
    try {
        const userId = req.user.userId;

        const attempts = await FullLengthAttempt.find({
            user: userId,
        })
            .populate("exam", "title category exam type")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: attempts.length,
            attempts,
        });
    } catch (error) {
        console.error("Error fetching previous attempts:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch previous attempts",
        });
    }
};

export const saveFullLengthAnswer = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const { sectionIndex, questionIndex, selectedAnswer = "" } = req.body;

        const attempt = await FullLengthAttempt.findOne({
            _id: attemptId,
            user: req.user.userId,
            status: "in-progress",
        });

        if (!attempt) {
            return res.status(404).json({
                message: "In-progress attempt not found",
            });
        }

        const exam = await FullLengthExam.findById(attempt.exam);
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        if (
            !Number.isInteger(sectionIndex) ||
            !Number.isInteger(questionIndex)
        ) {
            return res.status(400).json({
                message: "Valid section and question indexes are required",
            });
        }

        const section = exam.sections[sectionIndex];
        const question = section?.questions?.[questionIndex];

        if (!question) {
            return res.status(400).json({
                message: "Invalid question reference",
            });
        }

        if (
            selectedAnswer !== "" &&
            !question.options.includes(selectedAnswer)
        ) {
            return res.status(400).json({
                message: "Invalid answer option",
            });
        }

        const existingIndex = attempt.answers.findIndex(
            (item) =>
                item.sectionIndex === sectionIndex &&
                item.questionIndex === questionIndex
        );

        const answerData = {
            sectionIndex,
            questionIndex,
            selectedAnswer,
        };

        if (existingIndex >= 0) {
            attempt.answers[existingIndex].selectedAnswer = selectedAnswer;
        } else {
            attempt.answers.push(answerData);
        }

        await attempt.save();

        return res.status(200).json({
            success: true,
            message: "Answer saved",
            answer: answerData,
        });
    } catch (error) {
        console.error("Save answer error:", error);

        return res.status(500).json({
            message: error.message,
        });
    }
};

export const saveFullLengthProgress = async (req, res) => {
    try {
        const { attemptId } = req.params;

        const attempt = await FullLengthAttempt.findOne({
            _id: attemptId,
            user: req.user.userId,
            status: "in-progress",
        });

        if (!attempt) {
            return res.status(404).json({
                message: "In-progress attempt not found",
            });
        }

        const exam = await FullLengthExam.findById(attempt.exam);
        if (!exam) {
            return res.status(404).json({ message: "Exam not found" });
        }

        const {
            sectionIndex,
            questionIndex,
            draftSelections,
            markedForReview,
            visitedQuestions,
            paused,
            secondsLeft,
        } = req.body;

        const nextSectionIndex =
            sectionIndex ?? attempt.currentSectionIndex ?? 0;

        const nextQuestionIndex =
            questionIndex ?? attempt.currentQuestionIndex ?? 0;

        const nextSection = exam.sections[nextSectionIndex];

        if (
            !nextSection ||
            !nextSection.questions?.[nextQuestionIndex]
        ) {
            return res.status(400).json({
                message: "Invalid section or question position",
            });
        }

        // Validate draft option indexes without committing them as answers.
        if (Array.isArray(draftSelections)) {
            for (const draft of draftSelections) {
                const question =
                    exam.sections[draft.sectionIndex]?.questions?.[
                    draft.questionIndex
                    ];

                if (
                    !question ||
                    !Number.isInteger(draft.selectedOptionIndex) ||
                    draft.selectedOptionIndex < 0 ||
                    draft.selectedOptionIndex >= question.options.length
                ) {
                    return res.status(400).json({
                        message: "Invalid draft selection",
                    });
                }
            }

            attempt.draftSelections = draftSelections;
        }

        if (Array.isArray(markedForReview)) {
            attempt.markedForReview = [
                ...new Set(markedForReview.filter((key) => typeof key === "string")),
            ];
        }

        if (Array.isArray(visitedQuestions)) {
            attempt.visitedQuestions = [
                ...new Set(visitedQuestions.filter((key) => typeof key === "string")),
            ];
        }

        const sectionChanged =
            nextSectionIndex !== (attempt.currentSectionIndex ?? 0);

        attempt.currentSectionIndex = nextSectionIndex;
        attempt.currentQuestionIndex = nextQuestionIndex;

        if (paused === true && !attempt.paused) {
            // Freeze the timer at the exact remaining time sent by the client.
            const remaining = Number.isFinite(Number(secondsLeft))
                ? Math.max(0, Math.floor(Number(secondsLeft)))
                : getRemainingSeconds(attempt);

            attempt.paused = true;
            attempt.pausedRemainingSeconds = remaining;
            attempt.sectionDeadlineAt = null;
        } else if (paused === false && attempt.paused) {
            // Resume the timer from the stored remaining time.
            const remaining = Math.max(
                0,
                Number(attempt.pausedRemainingSeconds ?? 0)
            );

            attempt.paused = false;
            attempt.sectionDeadlineAt = new Date(
                Date.now() + remaining * 1000
            );
            attempt.pausedRemainingSeconds = null;
        } else if (sectionChanged && !attempt.paused) {
            // Each newly entered section receives its own duration.
            const durationSeconds =
                Math.max(1, Number(nextSection.durationMinutes) || 1) * 60;

            attempt.sectionDeadlineAt = new Date(
                Date.now() + durationSeconds * 1000
            );
            attempt.pausedRemainingSeconds = null;
        }

        const updatedAttempt = await FullLengthAttempt.findOneAndUpdate(
            {
                _id: attempt._id,
                user: req.user.userId,
                status: "in-progress",
            },
            {
                $set: {
                    currentSectionIndex: attempt.currentSectionIndex,
                    currentQuestionIndex: attempt.currentQuestionIndex,
                    draftSelections: attempt.draftSelections,
                    markedForReview: attempt.markedForReview,
                    visitedQuestions: attempt.visitedQuestions,
                    paused: attempt.paused,
                    pausedRemainingSeconds: attempt.pausedRemainingSeconds,
                    sectionDeadlineAt: attempt.sectionDeadlineAt,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedAttempt) {
            return res.status(404).json({
                message: "In-progress attempt not found.",
            });
        }

        return res.status(200).json({
            success: true,
            ...getResumeState(updatedAttempt),
        });
    } catch (error) {
        console.error("Save progress error:", error);

        return res.status(500).json({
            message: error.message,
        });
    }
};


export const getFullLengthAttemptResult = async (req, res) => {
    try {
        const { attemptId } = req.params;
        const userId = req.user.userId;

        // 1. Only allow the owner of this attempt to view its result.
        const attempt = await FullLengthAttempt.findOne({
            _id: attemptId,
            user: userId,
            status: "completed",
        }).lean();

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Completed attempt not found.",
            });
        }

        // 2. Load the complete exam, including its questions and answers.
        const exam = await FullLengthExam.findById(attempt.exam).lean();

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: "Exam not found.",
            });
        }

        // Map saved answers for fast lookup by section/question.
        const answerMap = new Map();

        for (const answer of attempt.answers || []) {
            answerMap.set(
                `${answer.sectionIndex}:${answer.questionIndex}`,
                answer.selectedAnswer || ""
            );
        }

        let totalQuestions = 0;
        let attemptedQuestions = 0;
        let correctAnswers = 0;
        let wrongAnswers = 0;
        let totalMarks = 0;
        let calculatedScore = 0;

        // 3. Calculate a detailed result for every question and section.
        const sections = exam.sections.map((section, sectionIndex) => {
            let sectionAttempted = 0;
            let sectionCorrect = 0;
            let sectionWrong = 0;
            let sectionUnanswered = 0;
            let sectionScore = 0;

            const marksPerQuestion = Number(section.marksPerQuestion) || 0;
            const negativeMarks = Number(section.negativeMarks) || 0;

            const questions = section.questions.map(
                (question, questionIndex) => {
                    totalQuestions++;
                    totalMarks += marksPerQuestion;

                    const key = `${sectionIndex}:${questionIndex}`;
                    const selectedAnswer = answerMap.get(key) || "";
                    const isAttempted = selectedAnswer.trim() !== "";
                    const isCorrect =
                        isAttempted &&
                        selectedAnswer === question.correctAnswer;

                    let status = "unanswered";
                    let marksAwarded = 0;

                    if (isAttempted) {
                        attemptedQuestions++;
                        sectionAttempted++;

                        if (isCorrect) {
                            status = "correct";
                            correctAnswers++;
                            sectionCorrect++;
                            marksAwarded = marksPerQuestion;
                        } else {
                            status = "wrong";
                            wrongAnswers++;
                            sectionWrong++;
                            marksAwarded = -negativeMarks;
                        }
                    } else {
                        sectionUnanswered++;
                    }

                    sectionScore += marksAwarded;

                    return {
                        questionIndex,
                        questionText: question.questionText,
                        options: question.options,
                        selectedAnswer,
                        correctAnswer: question.correctAnswer,
                        isAttempted,
                        isCorrect: isAttempted ? isCorrect : null,
                        status,
                        explanation: question.explanation || "",
                        marksAwarded,
                        marksPerQuestion,
                        negativeMarks,
                    };
                }
            );

            calculatedScore += sectionScore;

            return {
                sectionIndex,
                name: section.name,
                totalQuestions: questions.length,
                attemptedQuestions: sectionAttempted,
                correctAnswers: sectionCorrect,
                wrongAnswers: sectionWrong,
                unansweredQuestions: sectionUnanswered,
                markedForReview: (attempt.markedForReview || []).filter(
                    (key) =>
                        Number(String(key).split("-")[0]) === sectionIndex
                ).length,
                score: sectionScore,
                totalMarks: questions.length * marksPerQuestion,
                questions,
            };
        });

        // 4. Calculate percentage using the maximum possible marks.
        const percentage =
            totalMarks > 0
                ? Math.max(0, (calculatedScore / totalMarks) * 100)
                : 0;

        const accuracy =
            attemptedQuestions > 0
                ? (correctAnswers / attemptedQuestions) * 100
                : 0;

        // 5. Compare with OTHER candidates who completed this exam.
        // Each candidate contributes only their best score.
        const otherCandidates = await FullLengthAttempt.aggregate([
            {
                $match: {
                    exam: attempt.exam,
                    status: "completed",
                    user: { $ne: attempt.user },
                },
            },
            {
                $group: {
                    _id: "$user",
                    bestScore: { $max: "$score" },
                },
            },
        ]);

        let percentile = null;

        if (otherCandidates.length > 0) {
            const below = otherCandidates.filter(
                (candidate) => candidate.bestScore < calculatedScore
            ).length;

            const equal = otherCandidates.filter(
                (candidate) => candidate.bestScore === calculatedScore
            ).length;

            // Midrank percentile: half credit for tied scores.
            percentile =
                ((below + equal * 0.5) / otherCandidates.length) * 100;
        }

        return res.status(200).json({
            success: true,
            result: {
                attemptId: attempt._id,
                examId: exam._id,
                examTitle: exam.title,
                category: exam.category,
                exam: exam.exam,
                type: exam.type,
                status: attempt.status,
                startedAt: attempt.startedAt,
                completedAt: attempt.completedAt,
                score: calculatedScore,
                storedScore: attempt.score,
                totalMarks,
                percentage: Number(percentage.toFixed(2)),
                accuracy: Number(accuracy.toFixed(2)),
                percentile:
                    percentile === null
                        ? null
                        : Number(percentile.toFixed(2)),
                percentileComparedCandidates: otherCandidates.length,
                totalQuestions,
                attemptedQuestions,
                correctAnswers,
                wrongAnswers,
                unattemptedQuestions:
                    totalQuestions - attemptedQuestions,
                markedForReview: attempt.markedForReview || [],
                visitedQuestions: attempt.visitedQuestions || [],
                sections,
            },
        });
    } catch (error) {
        console.error("Get detailed attempt result error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to calculate attempt result.",
        });
    }
};
