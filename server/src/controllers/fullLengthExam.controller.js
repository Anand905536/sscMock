import FullLengthExam from "../models/FullLengthExam.model.js";
import FullLengthAttempt from "../models/FullLengthAttempt.model.js";

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
        const exam = await FullLengthExam.findById(req.body.examId);

        if (!exam) return res.status(404).json({ message: "Exam not found" });
        if (req.user.role !== "admin" && exam.status !== "published") {
            return res.status(403).json({ message: "Exam is not available" });
        }

        const attempt = await FullLengthAttempt.create({
            user: req.user.userId,
            exam: exam._id,
        });

        res.status(201).json({
            attemptId: attempt._id,
            examId: exam._id,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        const answers = req.body.answers;
        if (!Array.isArray(answers)) {
            return res.status(400).json({ message: "Answers must be an array" });
        }

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