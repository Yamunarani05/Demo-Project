import { Router } from "express";
import {
  saveCreativeConfirmationController,
  getCreativeConfirmationController
} from "../controllers/creativeConfirmation.controller";
import multer from "multer";
import path from "path";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fieldSize: 25 * 1024 * 1024 } // 25MB for large base64 or JSON fields
});

router.post(
  "/creative-confirmation",
  upload.array("reference_images"),
  saveCreativeConfirmationController
);


router.get(
  "/creative-confirmation/:external_lead_id",
  getCreativeConfirmationController
);
export default router;