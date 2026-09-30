import Question from '../models/Question.model.js'

export const createQuestion = async (req, res) => {
    try {
        const question = await Question.create(req.body);

        res.status(201).json({
            message: "question created successfully",
            question,
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to create question",
            error: err.message,
        })
    }
}

export const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find()
        res.status(200).json(questions)
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch question",
            error: err.message
        })
    }
}

export const getQuestionsByTest = async (req, res) => {
    try {
        const questions = await Question.find({
            test: req.params.testId,
        })
        res.status(200).json(questions);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch test questions",
            error: err.message
        })
    }
}