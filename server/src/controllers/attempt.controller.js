import Attempt from "../models/Attempt.model.js";
import Question from "../models/Question.model.js";
import Test from '../models/Test.model.js'



export const getAttemptResults = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const user = req.user.userId;

    const attempt = await Attempt.findOne({
      _id: attemptId,
      user,
      status: "completed",
    }).populate(
      "test",
      "title category durationMinutes marksPerQuestion negativeMarks subject topic"
    );

    if (!attempt) {
      return res.status(404).json({
        message: "Completed attempt not found",
      });
    }

    const totalQuestions = attempt.totalQuestions;
    const score = attempt.score;

    const marksPerQuestion =
      attempt.test.marksPerQuestion ?? 1;

    const negativeMarks =
      attempt.test.negativeMarks ?? 0;

    const maximumMarks =
      totalQuestions * marksPerQuestion;

    const percentage =
      maximumMarks > 0
        ? (score / maximumMarks) * 100
        : 0;


    // Get all completed attempts for this test
    const completedAttempts = await Attempt.find({
      test: attempt.test._id,
      status: "completed",
    }).select("user score");

    // Find each candidate's best score
    const bestScoreByUser = new Map();

    for (const candidateAttempt of completedAttempts) {
      const userId = candidateAttempt.user.toString();

      const existingBest = bestScoreByUser.get(userId);

      if (
        existingBest === undefined ||
        candidateAttempt.score > existingBest
      ) {
        bestScoreByUser.set(
          userId,
          candidateAttempt.score
        );
      }
    }

    const candidateScores = Array.from(
      bestScoreByUser.values()
    );

    const totalCandidates = candidateScores.length;

    // Number of candidates whose best score is lower
    const candidatesBelow = candidateScores.filter(
      (candidateScore) => candidateScore < score
    ).length;

    const percentile =
      totalCandidates > 0
        ? (candidatesBelow / totalCandidates) * 100
        : 0;

    // Calculate rank
    const candidatesAbove = candidateScores.filter(
      (candidateScore) => candidateScore > score
    ).length;

    const rank = candidatesAbove + 1;

    // Calculate correct / incorrect / unanswered
    const questions = await Question.find({
      test: attempt.test._id,
    }).select("_id correctAnswer");

    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let unanswered = 0;

    const submittedAnswers = new Map();

    for (const answer of attempt.answers) {
      submittedAnswers.set(
        answer.question.toString(),
        answer.selectedAnswer
      );
    }

    for (const question of questions) {
      const selectedAnswer = submittedAnswers.get(
        question._id.toString()
      );

      if (
        selectedAnswer === undefined ||
        selectedAnswer === ""
      ) {
        unanswered++;
      } else if (
        selectedAnswer === question.correctAnswer
      ) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    }

    res.status(200).json({
      message: "Attempt result fetched successfully",

      result: {
        attemptId: attempt._id,
        test: attempt.test,
        score,
        totalQuestions,
        maximumMarks,
        marksPerQuestion,
        negativeMarks,
        percentage: Number(percentage.toFixed(2)),
        percentile: Number(percentile.toFixed(2)),
        rank,
        totalCandidates,
        correctAnswers,
        incorrectAnswers,
        unanswered,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        status: attempt.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attempt result",
      error: error.message,
    });
  }
};


// start attempt

export const startAttempt = async (req, res) => {
  try {
    const { test } = req.body
    const user = req.user.userId

    if (!test) {
      return res.status(400).json({
        message: "test is required",
      })
    }

    const existingTest = await Test.findById(test)

    const existingAttempt = await Attempt.findOne({
      user,
      test,
      status: "in-progress",
    })

    if (existingAttempt) {
      return res.status(200).json({
        message: "Existing attempt found",
        attempt: {
          id: existingAttempt._id,
          test: existingAttempt.test,
          startedAt: existingAttempt.startedAt,
          durationMinutes: existingTest.durationMinutes,
          totalQuestions: existingAttempt.totalQuestions,
          status: existingAttempt.status,
        }
      })
    }


    if (!existingTest) {
      return res.status(404).json({
        message: "Test not found"
      })
    }

    if (req.user.role !== "admin" && existingTest.status !== "published") {
      return res.status(403).json({
        message: "This test is not available"
      })
    }


    const questions = await Question.find({ test, })

    if (questions.length == 0) {
      return res.status(400).json({
        message: "This test has no questions",
      })
    }


    const attempt = await Attempt.create({
      user,
      test,
      answers: [],
      score: 0,
      totalQuestions: questions.length,
      status: "in-progress",
      startedAt: new Date(),
    })


    res.status(201).json({
      message: "Test started successfully",
      attempt: {
        id: attempt._id,
        test: existingTest._id,
        startedAt: attempt.startedAt,
        durationMinutes: existingTest.durationMinutes,
        totalQuestions: questions.length,
        status: attempt.status,
      }
    })
  } catch (err) {
    res.status(500).json({
      message: "Failed to start test",
      error: err.message
    })
  }
}

export const submitAttempt = async (req, res) => {
  try {
    const { answers } = req.body;
    const { attemptId } = req.params;

    const user = req.user.userId

    if (!answers) {
      return res.status(400).json({
        message: "answers are required",
      })
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message: "answers must be an array",
      })
    }

    // find the existing attempt
    const attempt = await Attempt.findOne({
      _id: attemptId,
      user,
    })


    if (!attempt) {
      return res.status(404).json({
        message: "Attempt not found"
      })
    }


    // preventing submitting an already completed attempt
    if (attempt.status === "completed") {
      return res.status(400).json({
        message: "This attempt has already been completed",
      })
    }

    // get the test
    const existingTest = await Test.findById(attempt.test)

    if (!existingTest) {
      return res.status(404).json({
        message: "Test not found",
      })
    }

    // get questions belonging to this test
    const questions = await Question.find({
      test: attempt.test
    })

    // check submitted question IDs
    const questionIds = new Set(
      questions.map((question) => question._id.toString())
    );

    const submittedQuestionIds = new Set();

    for (const answer of answers) {
      if (!questionIds.has(answer.question)) {
        return res.status(400).json({
          message: "Invalid question for this test",
        });
      }

      if (submittedQuestionIds.has(answer.question)) {
        return res.status(400).json({
          message: "Duplicate question in answers",
        });
      }

      submittedQuestionIds.add(answer.question);

      const question = questions.find(
        (question) =>
          question._id.toString() === answer.question
      );

      if (
        answer.selectedAnswer !== "" &&
        !question.options.includes(answer.selectedAnswer)
      ) {
        return res.status(400).json({
          message: "Invalid answer option",
        });
      }
    }

    // Calculate elapsed time
    const now = new Date();

    const elapsedMilliseconds =
      now.getTime() - attempt.startedAt.getTime();

    const elapsedMinutes =
      elapsedMilliseconds / (1000 * 60);

    const timeExpired =
      elapsedMinutes >= existingTest.durationMinutes;

    // Calculate score
    let score = 0;

    const marksPerQuestion = existingTest.marksPerQuestion ?? 1;
    const negativeMarks = existingTest.negativeMarks ?? 0;

    for (const answer of answers) {
      const question = questions.find(
        (question) =>
          question._id.toString() === answer.question
      );

      if (!question) continue;

      // Unanswered question
      if (
        answer.selectedAnswer === undefined ||
        answer.selectedAnswer === ""
      ) {
        continue;
      }

      // Correct answer
      if (question.correctAnswer === answer.selectedAnswer) {
        score += marksPerQuestion;
      } else {
        // Wrong answer
        score -= negativeMarks;
      }
    }

    // Update existing attempt
    attempt.answers = answers;
    attempt.score = score;
    attempt.totalQuestions = questions.length;
    attempt.status = "completed";
    attempt.completedAt = now;

    await attempt.save();

    res.status(200).json({
      message: timeExpired
        ? "Time expired. Attempt submitted."
        : "Attempt submitted successfully",
      score,
      totalQuestions: questions.length,
      timeExpired,
      attempt,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to submit attempt",
      error: error.message,
    });
  }
};

export const getMyAttempts = async (req, res) => {
  try {
    const user = req.user.userId

    const attempts = await Attempt.find({ user })
      .populate(
        "test",
        "title category durationMinutes marksPerQuestion negativeMarks"
      )

    const history = attempts.map((attempt) => {
      const marksPerQuestion =
        attempt.test?.marksPerQuestion ?? 1;

      const maximumMarks =
        attempt.totalQuestions * marksPerQuestion;

      const percentage =
        maximumMarks > 0
          ? (attempt.score / maximumMarks) * 100
          : 0;

      return {
        attemptId: attempt._id,
        test: attempt.test,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        maximumMarks,
        marksPerQuestion,
        negativeMarks,
        percentage: Number(
          percentage.toFixed(2)
        ),
        status: attempt.status,
        startedAt: attempt.startedAt,
        completedAt: attempt.completedAt,
        createdAt: attempt.createdAt,
      }
    })
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch attempts",
      error: err.message
    })
  }
}