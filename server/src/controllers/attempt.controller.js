import Attempt from "../models/Attempt.model.js";
import Question from "../models/Question.model.js";

export const submitAttempt = async (req, res) => {
  try {
    const { test, answers } = req.body;

    const user=req.user.userId

    if (!test || !answers) {
      return res.status(400).json({
        message: "Test and answers are required",
      });
    }

    const questions = await Question.find({ test });

    let score = 0;

    for (const answer of answers) {
      const question = questions.find(
        (q) => q._id.toString() === answer.question
      );

      if (
        question &&
        question.correctAnswer === answer.selectedAnswer
      ) {
        score++;
      }
    }

    const attempt = await Attempt.create({
      user,
      test,
      answers,
      score,
      totalQuestions: questions.length,
      status: "completed",
      completedAt: new Date(),
    });

    res.status(201).json({
      message: "Attempt submitted successfully",
      score,
      totalQuestions: questions.length,
      attempt,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to submit attempt",
      error: error.message,
    });
  }
};