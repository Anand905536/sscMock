import express from "express";
import { getUserStats, getUsers,updateActivity } from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();

router.get("/stats", protect, authorize("admin"), getUserStats);
router.get("/", protect, authorize("admin"), getUsers);
router.patch("/activity",protect,updateActivity)

export default router;