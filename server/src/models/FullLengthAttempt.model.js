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

    // Answers committed by Save & Next.
    answers: [
      {
        sectionIndex: { type: Number, required: true },
        questionIndex: { type: Number, required: true },
        selectedAnswer: { type: String, default: "" },
      },
    ],

    // Temporary option selections. These are not submitted answers.
    draftSelections: [
      {
        sectionIndex: { type: Number, required: true },
        questionIndex: { type: Number, required: true },
        selectedOptionIndex: { type: Number, required: true },
      },
    ],

    currentSectionIndex: { type: Number, default: 0 },
    currentQuestionIndex: { type: Number, default: 0 },

    markedForReview: {
      type: [String],
      default: [],
    },

    visitedQuestions: {
      type: [String],
      default: [],
    },

    // The active section's timer deadline.
    sectionDeadlineAt: {
      type: Date,
      default: null,
    },

    // When paused, retain the exact remaining seconds.
    paused: {
      type: Boolean,
      default: false,
    },

    pausedRemainingSeconds: {
      type: Number,
      default: null,
    },

    score: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },

    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model(
  "FullLengthAttempt",
  fullLengthAttemptSchema
);