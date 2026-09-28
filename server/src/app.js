import "dotenv/config";
import express from "express"
import cors from "cors";
import connectDB from "./config/db.js";
import testRoutes from './routes/test.routes.js' 

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

app.use('/api/tests',testRoutes)


// running PORT
const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}⚡`)
})