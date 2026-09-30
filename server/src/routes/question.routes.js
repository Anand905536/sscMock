import express from 'express';

import {
    createQuestion,
    getQuestions,
    getQuestionsByTest
} from '../controllers/question.controller.js'

const router = express.Router()

router.post('/', createQuestion)
router.get('/', getQuestions);
router.get('/test/:testId', getQuestionsByTest);

export default router
