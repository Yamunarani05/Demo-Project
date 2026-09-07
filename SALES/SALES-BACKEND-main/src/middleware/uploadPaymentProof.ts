import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/payment_proof";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName =
      "payment_" + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

export const uploadPaymentProof = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files allowed"));
    }
    cb(null, true);
  },
});
