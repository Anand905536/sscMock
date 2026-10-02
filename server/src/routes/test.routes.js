import express from 'express';
import { createTest, getTests, getTestById, updateTest, deleteTest } from '../controllers/test.controller.js';

import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';

const router = express.Router();

router.post("/", protect, authorize("admin"), createTest);
router.get("/", protect, getTests)
router.get("/:id", protect, getTestById)
router.put("/:id", protect, authorize("admin"), updateTest);
router.delete("/:id", protect, authorize("admin"), deleteTest)

export default router