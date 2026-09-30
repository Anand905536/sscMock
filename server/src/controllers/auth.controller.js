import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';

import User from '../models/User.model.js';

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
            message:"Login successful",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
            }
        })
    } catch (err) {
       res.status(500).json({
        message:"Login failed",
        error:err.message,
       })
    }
}