import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: "" },
});

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  durationMinutes: { type: Number, required: true, min: 1 },
  marksPerQuestion: { type: Number, required: true, default: 1 },
  negativeMarks: { type: Number, required: true, default: 0 },
  questions: { type: [questionSchema], default: [] },
});

const fullLengthExamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    exam: { type: String, required: true, trim: true, lowercase: true },
    type: {
      type: String,
      enum: ["mock", "pyq"],
      default: "mock",
      required: true,
    },
    sections: { type: [sectionSchema], required: true },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model("FullLengthExam", fullLengthExamSchema);