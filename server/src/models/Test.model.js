import mongoose from "mongoose"

const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        default: ""
    },
    subject: {
        type: String,
        required: true,
        enum: ["English", "General Studies"],
    },

    topic: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    durationMinutes: {
        type: Number,
        required: true
    },
    marksPerQuestion: {
        type: Number,
        required: true,
        default: 1,
        min: 0,
    },

    negativeMarks: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft"
    },
},
    {
        timestamps: true
    }
)

const Test = mongoose.model("Test", testSchema)
export default Test;