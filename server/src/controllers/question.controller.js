import Question from '../models/Question.model.js'
import Test from '../models/Test.model.js'

export const createQuestion = async (req, res) => {

    try {
        const { test,questionText, options, correctAnswer, explanation, difficulty } = req.body

        if (!test || !questionText || !options || !correctAnswer) {
            return res.status(400).json({
                message: "Test, questionText , options and correctAnswer are required",
            })
        }

        if (!options.includes(correctAnswer)) {
            return res.status(400).json({
                message: "Correct answer must be one of the options"
            })
        }

        const testData = await Test.findById(test);
         console.log("testData",testData)

        if (!testData) {
            return res.status(404).json({
                message: "Test not found"
            });
        }

        const question = await Question.create({ test,testTitle: testData.title, questionText, options, correctAnswer, explanation, difficulty })

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
        let query = Question.find().populate("test", "title");

        if (req.user.role !== "admin") {
            query = query.select("-correctAnswer")
        }

        const questions = await query

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
        let query = Question.find({
            test: req.params.testId,
        })

        if (req.user.role !== "admin") {
            query = query.select("-correctAnswer")
        }

        const questions = await query

        res.status(200).json(questions)
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch test questions",
            error: err.message
        })
    }
}

// newly added 
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


export const updateQuestion = async (req, res) => {
    try {
        const { test, questionText, options, correctAnswer, explanation, difficulty, } = req.body

        if (!test || !questionText || !options || !correctAnswer) {
            return res.status(400).json({
                message: "Test, questionText, options and correctAnswer are required",
            })
        }

        if (!options.includes(correctAnswer)) {

            return res.status(400).json({
                message: "correct answer must be one of the options"
            })
        }

        const question = await Question.findByIdAndUpdate(req.params.id,
            { test, questionText, options, correctAnswer, explanation, difficulty },
            {
                new: true,
                runValidators: true
            })

        if (!question) {
            return res.status(404).json({
                message: "Question not found"
            })
        }

        res.status(200).json({
            message: "Question updated successfully",
            question,
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to update question",
            error: err.message
        })
    }
}

export const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(
            req.params.id
        )
        if (!question) {
            return res.status(404).json({
                message: "Question not found",
            })
        }
        res.status(200).json({
            message: "Question delete successfully",
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete question",
            error: err.message
        })
    }


}