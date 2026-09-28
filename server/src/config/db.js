import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Mongodb connected successfully ✅")
    } catch (err) {
        console.error("Mongodb connnection failed ❌", err.message)
        process.exit(1);
    }
}

export default connectDB;