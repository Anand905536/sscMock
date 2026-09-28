import express from 'express';
import { createTest, getTests, getTestById } from '../controllers/test.controller.js';

const router = express.Router();

router.post("/", createTest);
router.get("/", getTests)
router.get("/:id", getTestById)

export default router