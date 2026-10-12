import express from "express";
import {
    getProfile,
    updateProfile,
    changePassword
} from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import upload from '../middleware/upload.middleware.js'


const router = express.Router();

router.get("/", protect, getProfile);
router.put("/", protect, upload.single("avatar"), updateProfile);
router.put("/change-password", protect, changePassword);

export default router;