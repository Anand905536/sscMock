import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        test: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Test",
            required: true
        },
        answers: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true,
                },
                selectedAnswer: {
                    type: String,
                    default: "",
                },
            }
        ],

        score: {
            type: Number,
            default: 0,
        },
        totalQuestions: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["in-progress", "completed"],
            default: "in-progress",
        },
        startedAt: {
            type: Date,
            default: Date.now,
        },
        completedAt: {
            type: Date,
        },

    }, { timestamps: true })

const Attempt = mongoose.model("Attempt", attemptSchema)
export default Attempt