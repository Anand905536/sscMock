import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    test: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
        required: true
    },
    questionText: {
        type: string,
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
        type: string,
        default: "",
    },
    difficulty: {
        type: string,
        enum: ["easy", "medium", "hard"],
        default: "medium",
    }
}, { timestamps: true })

const Question = mongoose.model("Question", questionSchema)
export default Question