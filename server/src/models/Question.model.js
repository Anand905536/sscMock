import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
        required: true
    },
    questionText: {
        type: String,
        required: true,
        trim: true,
    },
    options: {
        type: [String],
        required: true,
    },
    correctAnswer:{
        type:String,
        required:true
    },
    explanation: {
        type: String,
        default: "",
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
    }
}, { timestamps: true })

const Question = mongoose.model("Question", questionSchema)
export default Question