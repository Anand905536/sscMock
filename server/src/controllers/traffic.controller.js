import Visit from "../models/visit.model.js";

export const recordVisit = async (req, res) => {
    try {
        const { visitorId } = req.body;
    
        if (!visitorId) {
            return res.status(400).json({
                message: "visitorId is required",
            });
        }

        await Visit.create({
            visitorId,
        });

        res.status(201).json({
            message: "Visit recorded",
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to record visit",
            error: err.message,
        });
    }
};

export const getTrafficStats = async (req, res) => {
    try {
        const totalVisits = await Visit.countDocuments();

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const todayVisits = await Visit.countDocuments({
            createdAt: {
                $gte: startOfToday,
            },
        });

        const uniqueVisitors = await Visit.distinct("visitorId");

        res.status(200).json({
            totalVisits,
            todayVisits,
            uniqueVisitors: uniqueVisitors.length,
        });
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch traffic statistics",
            error: err.message,
        });
    }
};