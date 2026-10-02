import "dotenv/config";
import express from "express"
import cors from "cors";
import connectDB from "./config/db.js";
import testRoutes from './routes/test.routes.js'
import questionsRoutes from './routes/question.routes.js'
import attemptRoutes from './routes/attempt.routes.js'
import authRoutes from './routes/auth.routes.js'
import { protect } from "./middleware/auth.middleware.js";
import { authorize } from "./middleware/authorize.middleware.js";

const app = express();
app.use(cors())
app.use(express.json())

// mongo db connection
connectDB()

app.get("/", (req, res) => {
    res.json({
        message: "Job Prep API is running",
    })
})

app.use('/api/tests', testRoutes)
app.use('/api/questions', questionsRoutes)
app.use('/api/attempts', attemptRoutes)
app.use("/api/auth", authRoutes);

app.get("/api/auth/me", protect, (req, res) => {
    res.json({
        message: "You are authenticated",
        user: req.user
    })
})

app.get("/api/admin-test", protect, authorize("admin"), (req, res) => {
    res.json({
        message: "Welcome Admin",
        user: req.user
    })
})


// running PORT
const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}⚡`)
})