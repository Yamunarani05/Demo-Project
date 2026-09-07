import multer from "multer";
import fs from "fs";
import path from "path";

const uploadPath = path.join(process.cwd(), "uploads/packages");

// ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const files = fs.readdirSync(uploadPath);

    const nextNumber = files.length + 1;

    const fileName = `2025 RED ANGLE_page-${String(nextNumber).padStart(4, "0")}.jpg`;

    cb(null, fileName);
  },
});

export const packageUpload = multer({ storage });
