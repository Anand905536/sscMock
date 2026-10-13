import mongoose from "mongoose";

const fullLengthAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FullLengthExam",
      required: true,
    },
    answers: [
      {
        sectionIndex: { type: Number, required: true },
        questionIndex: { type: Number, required: true },
        selectedAnswer: { type: String, default: "" },
      },
    ],
    score: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("FullLengthAttempt", fullLengthAttemptSchema);