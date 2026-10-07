import express from 'express';

import {
    createQuestion,
    getQuestions,
    getQuestionsByTest,
    updateQuestion,
    deleteQuestion,
    getQuestionById
} from '../controllers/question.controller.js'

import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router()

router.post('/',protect,authorize("admin"),createQuestion)
router.get('/',protect, getQuestions);
router.get('/test/:testId',protect,getQuestionsByTest);
router.put("/:id",protect,authorize("admin"),updateQuestion)
router.delete("/:id",protect,authorize("admin"),deleteQuestion)
// newly added 
router.get("/:id", protect, getQuestionById);

export default router

