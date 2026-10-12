import User from "../models/User.model.js";
import bcrypt from 'bcryptjs'

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select(
            "-password"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        // console.log("output from get profile",user)
        res.status(200).json({
            message: "Profile fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch profile",
        });
    }
};

// update profile api key 

export const updateProfile = async (req, res) => {
    console.log("from update profile", req.file)
    try {
        const { name, email } = req.body;

        if (!name?.trim() || !email?.trim()) {
            return res.status(400).json({
                message: "Name and email are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: req.user.userId },
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already in use",
            });
        }

        const updateData = {
            name: name.trim(),
            email: normalizedEmail,
        };

        if (req.file) {
            updateData.profilePicture = `/uploads/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update profile", error
        });
    }
};


// change password

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current and new passwords are required",
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "New password must be at least 8 characters",
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Current password is incorrect",
            });
        }

        const isSamePassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        if (isSamePassword) {
            return res.status(400).json({
                message: "New password must be different from current password",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({
            message: "Password changed successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to change password", error
        });
    }
};