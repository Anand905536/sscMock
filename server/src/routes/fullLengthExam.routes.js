
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

import {
  createFullLengthExam,
  getFullLengthExams,
  getFullLengthExamById,
  startFullLengthAttempt,
  submitFullLengthAttempt,
  getAllPreviousAttempts,
  saveFullLengthAnswer,
  saveFullLengthProgress,
  getFullLengthAttemptResult,
} from "../controllers/fullLengthExam.controller.js";

const router = express.Router();

router.get("/", protect, getFullLengthExams);
router.post("/", protect, authorize("admin"), createFullLengthExam);

router.get("/previous", protect, getAllPreviousAttempts);
router.post("/attempts/start", protect, startFullLengthAttempt);
router.put("/attempts/:attemptId/answers",protect,saveFullLengthAnswer)
router.patch("/attempts/:attemptId/progress",protect,saveFullLengthProgress);
router.post("/attempts/:attemptId/submit",protect,submitFullLengthAttempt);
router.get("/:id", protect, getFullLengthExamById);
router.get("/attempts/:attemptId/result",protect,getFullLengthAttemptResult);
export default router;