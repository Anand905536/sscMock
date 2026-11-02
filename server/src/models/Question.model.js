import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Test",
    required: true,
  },

  questionText: {
    en: { type: String, required: true, trim: true },
    hi: { type: String, required: true, trim: true },
  },

  options: [
    {
      en: { type: String, required: true, trim: true },
      hi: { type: String, required: true, trim: true },
    },
  ],

  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },

  explanation: {
    en: { type: String, default: "" },
    hi: { type: String, default: "" },
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
}, { timestamps: true });

const Question = mongoose.model("Question", questionSchema);

export default Question;