import Test from "../models/Test.model.js";
import Question from "../models/Question.model.js";


// create test
export const createTest = async (req, res) => {
    try {
        const { title, description, category, durationMinutes, status } = req.body

        if (!title || !category || !durationMinutes) {
            return res.status(400).json({
                message: "Title , Category and duration are required",
            })
        }

        const test = await Test.create({ title, description, category, durationMinutes, status })

        res.status(201).json({
            message: "Test created successfully",
            test,
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to create test",
            error: err.message
        })
    }
}


// get all tests
export const getTests = async (req, res) => {
    try {
        let query = Test.find()
        if (req.user.role !== "admin") {
            query = query.find({
                status: "published",
            })
        }

        const tests = await query

        res.status(200).json(tests);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch tests",
            error: err.message,
        })
    }
}

// get test by ID 
export const getTestById = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id)
        if (!test) {
            return res.status(404).json({
                message: "Test not found",
            })
        }

        if (req.user.role !== "admin" && test.status !== "published") {
            return res.status(403).json({
                message: "This is not available"
            })
        }
        res.status(200).json(test);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch test",
            error: err.message
        })
    }
}


export const updateTest = async (req, res) => {
    try {
        const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
        if (!test) {
            return res.status(404).json({
                message: "Test not found"
            })
        }
        res.status(200).json({
            message: "Test updated successfully",
            test,
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to upadte test",
            error: err.message,
        })
    }
}


export const deleteTest = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id)

        if (!test) {
            return res.status(404).json({
                message: "Test not found",
            })
        }

        await Question.deleteMany({
            test: test._id
        })

        await Test.findByIdAndDelete(req.params.id)

        res.status(200).json({
            message: "Test and related questions deleted successfully",
        })
    } catch (err) {
        res.status(500).json({
            message: "Failed to delete test",
            error: err.message,
        })
    }
}