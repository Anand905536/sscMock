import mongoose from "mongoose"

const pdfSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    pdfUrl:{
        type: String,
        required: true
    },
    fileSize:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

const Pdf = mongoose.model("Pdf", pdfSchema);
export default Pdf
