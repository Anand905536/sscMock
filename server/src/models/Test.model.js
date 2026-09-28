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
    category: {
        type: String,
        required: true,
        trim: true
    },
    durationMinutes: {
        type: Number,
        required: true
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