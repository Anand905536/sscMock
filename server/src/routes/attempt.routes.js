import express from 'express'
import { submitAttempt } from '../controllers/attempt.controller.js'

const router = express.Router()

router.post('/', submitAttempt)

export default router;