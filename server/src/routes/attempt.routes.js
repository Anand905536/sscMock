import express from 'express'
import { submitAttempt } from '../controllers/attempt.controller.js'
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router()

router.post('/',protect, submitAttempt)

export default router;