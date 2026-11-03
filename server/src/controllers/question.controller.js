
import Question from "../models/Question.model.js";
import Test from "../models/Test.model.js";

// CREATE QUESTION
export const createQuestion = async (req, res) => {
  try {
    const {
      test,
      questionText,
      options,
      correctAnswer,
      explanation,
      difficulty,
    } = req.body;

    // English question and all four English options are required
    if (
      !test ||
      !questionText?.en?.trim() ||
      !Array.isArray(options) ||
      options.length !== 4 ||
      options.some((option) => !option.en?.trim()) ||
      correctAnswer === undefined ||
      correctAnswer === null
    ) {
      return res.status(400).json({
        message:
          "Test, English question, four English options and correctAnswer are required",
      });
    }

    // Validate correct answer index
    const answerIndex = Number(correctAnswer);

    if (
      !Number.isInteger(answerIndex) ||
      answerIndex < 0 ||
      answerIndex > 3
    ) {
      return res.status(400).json({
        message: "Correct answer must be an option index between 0 and 3",
      });
    }

    const testData = await Test.findById(test);

    if (!testData) {
      return res.status(404).json({
        message: "Test not found",
      });
    }

    // Hindi is optional; save empty string if not provided
    const formattedQuestionText = {
      en: questionText.en.trim(),
      hi: questionText.hi?.trim() || "",
    };

    const formattedOptions = options.map((option) => ({
      en: option.en.trim(),
      hi: option.hi?.trim() || "",
    }));

    const question = await Question.create({
      test,
      questionText: formattedQuestionText,
      options: formattedOptions,
      correctAnswer: answerIndex,
      explanation: {
        en: explanation?.en?.trim() || "",
        hi: explanation?.hi?.trim() || "",
      },
      difficulty,
    });

    return res.status(201).json({
      message: "Question created successfully",
      question,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Failed to create question",
      error: err.message,
    });
  }
};


// GET ALL QUESTIONS
export const getQuestions = async (req, res) => {
  try {
    let query = Question.find().populate("test", "title");

    if (req.user.role !== "admin") {
      query = query.select("-correctAnswer");
    }

    const questions = await query;

    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch question",
      error: err.message,
    });
  }
};


// GET QUESTIONS BY TEST
export const getQuestionsByTest = async (req, res) => {
  try {
    let query = Question.find({
      test: req.params.testId,
    });

    if (req.user.role !== "admin") {
      query = query.select("-correctAnswer");
    }

    const questions = await query;

    return res.status(200).json(questions);
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch test questions",
      error: err.message,
    });
  }
};


// GET QUESTION BY ID
export const getQuestionById = async (req, res) => {
  try {
    let query = Question.findById(req.params.id).populate("test", "title");

    if (req.user.role !== "admin") {
      query = query.select("-correctAnswer");
    }

    const question = await query;

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch question",
      error: err.message,
    });
  }
};


// UPDATE QUESTION
export const updateQuestion = async (req, res) => {
  try {
    const {
      test,
      questionText,
      options,
      correctAnswer,
      explanation,
      difficulty,
    } = req.body;

    // English question and all four English options are required
    if (
      !test ||
      !questionText?.en?.trim() ||
      !Array.isArray(options) ||
      options.length !== 4 ||
      options.some((option) => !option.en?.trim()) ||
      correctAnswer === undefined ||
      correctAnswer === null
    ) {
      return res.status(400).json({
        message:
          "Test, English question, four English options and correctAnswer are required",
      });
    }

    // Convert and validate correct answer
    const answerIndex = Number(correctAnswer);

    if (
      !Number.isInteger(answerIndex) ||
      answerIndex < 0 ||
      answerIndex > 3
    ) {
      return res.status(400).json({
        message: "Correct answer must be a valid option index (0-3)",
      });
    }

    // Hindi is optional; save empty string if not provided
    const formattedQuestionText = {
      en: questionText.en.trim(),
      hi: questionText.hi?.trim() || "",
    };

    const formattedOptions = options.map((option) => ({
      en: option.en.trim(),
      hi: option.hi?.trim() || "",
    }));

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      {
        test,
        questionText: formattedQuestionText,
        options: formattedOptions,
        correctAnswer: answerIndex,
        explanation: {
          en: explanation?.en?.trim() || "",
          hi: explanation?.hi?.trim() || "",
        },
        difficulty,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    res.status(200).json({
      message: "Question updated successfully",
      question,
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to update question",
      error: err.message,
    });
  }
};


// DELETE QUESTION
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    res.status(200).json({
      message: "Question delete successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete question",
      error: err.message,
    });
  }
};
