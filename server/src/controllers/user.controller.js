import User from "../models/User.model.js";

export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({
            role: "user",
        });

        const activeSince = new Date(Date.now() - 5 * 60 * 1000);

        const activeUsers = await User.countDocuments({
            role: "user",
            lastActiveAt: {
                $gte: activeSince,
            },
        });

        res.status(200).json({
            totalUsers,
            activeUsers,
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch user statistics",
            error: err.message,
        });
    }
};

export const updateActivity = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            lastActiveAt: new Date(),
        });

        res.status(200).json({
            message: "Activity updated",
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to update activity",
            error: err.message,
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find(
            { role: "user" },
            "-password"
        ).sort({ createdAt: -1 });

        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: err.message,
        });
    }
};