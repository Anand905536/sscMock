import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from "../services/email.service.js";
import User from '../models/User.model.js';
import crypto from "crypto";
import googleClient from "../config/google.js";


export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body

        // if something missing
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name , Email and password are required",
            })
        }

        // already exist
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({
                message: "User already exists",
            })
        }

        // hashing password for new user
        const hashedPassword = await bcrypt.hash(password, 10)

        // creating new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        await sendWelcomeEmail(user.name, user.email);

        res.status(201).json({
            message: "User reistered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })
    } catch (err) {
        res.status(500).json({
            message: "Registration failed",
            error: err.message,
        })
    }
}


// export login

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400).json({
                message: "Email and Password are required"
            })
        }

        const user = await User.findOne({ email })

        if (!user) {
            res.status(401).json({
                message: "Invalid email or password"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(
            password, user.password
        )

        if (!isPasswordCorrect) {
            res.status(401).json({
                message: "Invalid email or password"
            })
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        )

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }
        })
    } catch (err) {
        res.status(500).json({
            message: "Login failed",
            error: err.message,
        })
    }
}

// google redirect 
export const googleLogin = async (req, res) => {
    try {
        const state = crypto.randomBytes(32).toString("hex");

        const authUrl = googleClient.generateAuthUrl({
            access_type: "online",
            scope: [
                "openid",
                "email",
                "profile",
            ],
            state,
            prompt: "select_account",
        });

        res.redirect(authUrl);
    } catch (err) {
        res.status(500).json({
            message: "Failed to start Google login",
            error: err.message,
        });
    }
};


export const googleCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.redirect(
                `${process.env.USER_CLIENT_URL}/login?error=google_login_failed`
            );
        }

        const { tokens } = await googleClient.getToken(code);

        googleClient.setCredentials(tokens);

        const userInfoResponse = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                },
            }
        );

        if (!userInfoResponse.ok) {
            throw new Error("Failed to fetch Google user information");
        }

        const data = await userInfoResponse.json();

        const {
            sub: googleId,
            email,
            name,
        } = data;

        if (!email) {
            return res.redirect(
                `${process.env.USER_CLIENT_URL}/login?error=google_email_missing`
            );
        }

        let user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (user && user.role === "admin") {
            return res.redirect(
                `${process.env.USER_CLIENT_URL}/login?error=google_admin_not_allowed`
            );
        }

        if (!user) {
            const randomPassword = crypto.randomBytes(32).toString("hex");

            const hashedPassword = await bcrypt.hash(
                randomPassword,
                10
            );

            user = await User.create({
                name: name || "Google User",
                email: email.toLowerCase(),
                password: hashedPassword,
                role: "user",
                lastActiveAt: new Date(),
            });

            try {
                await sendWelcomeEmail(
                    user.name,
                    user.email
                );
            } catch (emailError) {
                console.error(
                    "Google user welcome email failed:",
                    emailError.message
                );
            }
        } else {
            user.lastActiveAt = new Date();
            await user.save();
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        const userData = encodeURIComponent(
            JSON.stringify({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            })
        );

        res.redirect(
            `${process.env.USER_CLIENT_URL}/auth/callback?token=${encodeURIComponent(
                token
            )}&user=${userData}`
        );
    } catch (err) {
        console.error("Google login error:", err);

        res.redirect(
            `${process.env.USER_CLIENT_URL}/login?error=google_login_failed`
        );
    }
};

export const googleOneTapLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                message: "Google credential is required",
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const {
            sub: googleId,
            email,
            name,
        } = payload;

        if (!email) {
            return res.status(400).json({
                message: "Google account email is missing",
            });
        }

        let user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (user && user.role === "admin") {
            return res.status(403).json({
                message:
                    "Google login is not available for admin accounts",
            });
        }

        if (!user) {
            const randomPassword =
                crypto.randomBytes(32).toString("hex");

            const hashedPassword =
                await bcrypt.hash(randomPassword, 10);

            user = await User.create({
                name: name || "Google User",
                email: email.toLowerCase(),
                password: hashedPassword,
                role: "user",
                lastActiveAt: new Date(),
            });

            try {
                await sendWelcomeEmail(
                    user.name,
                    user.email
                );
            } catch (emailError) {
                console.error(
                    "Google welcome email failed:",
                    emailError.message
                );
            }
        } else {
            user.lastActiveAt = new Date();
            await user.save();
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.status(200).json({
            message: "Google login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error(
            "Google One Tap login error:",
            err
        );

        res.status(500).json({
            message: "Google login failed",
            error: err.message,
        });
    }
};