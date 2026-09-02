import { Router } from "express";
import { createEventDetailsController, getEventDetailsByLeadIdController, updateUploadDetailsController }
  from "../controllers/eventDetails.controller";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Extract client_name from the multipart body (available because text fields
    // that appear before file fields in the FormData are already parsed by multer).
    const clientName = (req.body?.client_name || "general").toString().trim();
    // Sanitise: replace characters that are invalid in folder names
    const safeName = clientName.replace(/[<>:"\/\\|?*]+/g, "_").replace(/\s+/g, " ").trim() || "general";
    const dest = path.join("uploads", safeName);
    // Ensure the directory exists (recursive handles nested creation)
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

const router = Router();

router.post("/", createEventDetailsController);
router.get("/:leadId", getEventDetailsByLeadIdController);
router.patch("/:leadId/upload", upload.fields([{ name: 'firstClipFile' }, { name: 'lastClipFile' }]), updateUploadDetailsController);

export default router;