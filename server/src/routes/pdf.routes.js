import express from 'express'
import { getAllPdf, savePdfURL, toDeletePdf } from "../controllers/pdf.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router=express.Router()

router.post("/save-pdf",protect,authorize("admin"),savePdfURL);
router.get("/get-pdfs",protect,getAllPdf );
router.delete("/delete-pdf/:id",protect,authorize("admin"),toDeletePdf);

export default router