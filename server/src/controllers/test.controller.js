import Test from "../models/Test.model.js";
import Question from "../models/Question.model.js";


// create test
// create test
export const createTest = async (req, res) => {
    try {
        const {
            title, description, category, exam, type, subject, topic,
            durationMinutes, marksPerQuestion, negativeMarks, status,
        } = req.body;

        console.log("from create test test controller", exam, type)

        if (
            !title ||
            !category ||
            !subject ||
            !topic ||
            !durationMinutes ||
            !exam ||
            marksPerQuestion === undefined ||
            negativeMarks === undefined
        ) {
            return res.status(400).json({
                message:
                    "Title, Category, Subject, Topic and duration are required",
            });
        }

        if (
            marksPerQuestion === undefined ||
            marksPerQuestion === null ||
            marksPerQuestion < 0
        ) {
            return res.status(400).json({
                message: "Marks per question are required",
            });
        }

        if (
            negativeMarks === undefined ||
            negativeMarks === null ||
            negativeMarks < 0
        ) {
            return res.status(400).json({
                message: "Negative marks are required",
            });
        }

        const test = await Test.create({
            title,
            description,
            category,
            subject,
            topic,
            exam,
            type,
            durationMinutes,
            marksPerQuestion,
            negativeMarks,
            status,
        });

        res.status(201).json({
            message: "Test created successfully",
            test,
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to create test",
            error: err.message,
        });
    }
};


// get all tests

export const getTests = async (req, res) => {
    try {
        const match = {};

        // Normal users can only see published tests
        if (req.user.role !== "admin") {
            match.status = "published";
        }

        // Optional filters
        if (req.query.subject) {
            match.subject = req.query.subject;
        }

        if (req.query.category) {
            match.category = new RegExp(
                `^${req.query.category}$`,
                "i"
            );
        }

        if (req.query.exam) {
            match.exam = req.query.exam.toLowerCase();
        }

        if (req.query.type) {
            match.type = req.query.type.toLowerCase();
        }

        if (req.query.topic) {
            match.topic = req.query.topic;
        }

        const tests = await Test.aggregate([
            // Apply filters first
            {
                $match: match
            },

            // Find questions associated with each test
            {
                $lookup: {
                    from: "questions",
                    localField: "_id",
                    foreignField: "test",
                    as: "questions"
                }
            },

            // Count associated questions
            {
                $addFields: {
                    totalQuestions: {
                        $size: "$questions"
                    }
                }
            },

            // Remove the questions array
            {
                $project: {
                    questions: 0
                }
            },

            // Latest tests first
            {
                $sort: {
                    createdAt: -1
                }
            }
        ]);

        res.status(200).json(tests);

    } catch (error) {
        console.error("Error fetching tests:", error);

        res.status(500).json({
            message: "Failed to fetch tests",
            error: error.message
        });
    }
};


// get test by ID 
export const getTestById = async (req, res) => {
    try {
        const test = await Test.findById(req.params.id)
        // console.log("getTests", req.params)
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