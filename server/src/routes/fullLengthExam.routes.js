import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import {
  createFullLengthExam,
  getFullLengthExams,
  getFullLengthExamById,
  startFullLengthAttempt,
  submitFullLengthAttempt,
} from "../controllers/fullLengthExam.controller.js";

const router = express.Router();

router.get("/", protect, getFullLengthExams);
router.post("/", protect, authorize("admin"), createFullLengthExam);
router.get("/:id", protect, getFullLengthExamById);
router.post("/attempts/start", protect, startFullLengthAttempt);
router.post("/attempts/:attemptId/submit", protect, submitFullLengthAttempt);

export default router;