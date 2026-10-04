import express from 'express'
import {
    startAttempt,
    submitAttempt,
    getMyAttempts,
    getAttemptResults,
} from '../controllers/attempt.controller.js'
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router()

router.post('/:attemptId/submit', protect, submitAttempt)
router.post("/start", protect, startAttempt)
router.get("/my", protect, getMyAttempts)
router.get("/:attemptId/result", protect, getAttemptResults)

export default router;