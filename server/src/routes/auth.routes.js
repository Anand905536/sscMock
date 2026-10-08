import express from "express";

import {
    login,
    register,
    googleLogin,
    googleCallback,
    googleOneTapLogin,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.post("/google/one-tap",googleOneTapLogin);

export default router;