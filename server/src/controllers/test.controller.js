import Test from "../models/Test.model.js";


// create test
export const createTest = async (req, res) => {
    try {
        const test = await Test.create(req.body);
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
        const tests = await Test.find();
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
        res.status(200).json(test);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch test",
            error: err.message
        })
    }
}