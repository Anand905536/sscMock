import express from "express";

import {
    recordVisit,
    getTrafficStats,
} from "../controllers/traffic.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();

router.post("/visit", recordVisit);
router.get("/stats",protect,authorize("admin"),getTrafficStats);

export default router;