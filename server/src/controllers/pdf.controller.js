import Pdf from '../models/Pdf.model.js'

export const savePdfURL = async (req, res) => {
    try {
        const { title, pdfUrl, fileSize } = req.body;

        if (!title || !pdfUrl) {
            return res.status(400).json({ success: false, message: "Title and URL are required" });
        }

        const newPdf = new Pdf({
            title,
            pdfUrl,
            fileSize
        });

        await newPdf.save();

        res.status(201).json({
            success: true,
            message: "PDF saved successfully in database!",
            data: newPdf
        });
    } catch (err) {
        console.error("Error saving PDF:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
export const getAllPdf = async (req, res) => {
    try {
        const pdfs = await Pdf.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: pdfs });
    } catch (err) {
        console.error("Error fetching PDFs:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
export const toDeletePdf = async (req, res) => {
    try {
        await Pdf.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "PDF deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
}

