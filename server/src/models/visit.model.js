import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
    {
        visitorId: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Visit = mongoose.model("Visit", visitSchema);

export default Visit;