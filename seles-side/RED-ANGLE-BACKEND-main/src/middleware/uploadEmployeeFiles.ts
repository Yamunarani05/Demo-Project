// uploadEmployeeFiles.ts
import multer from "multer";
import path from "path";
import fs from "fs";

const baseDir = path.join(process.cwd(), "uploads", "employees");

const profileDir = path.join(baseDir, "profiles");
const documentDir = path.join(baseDir, "documents");

[profileDir, documentDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === "profileImage") {
      cb(null, profileDir);
    } else if (file.fieldname === "documentPdf") {
      cb(null, documentDir);
    } else {
      cb(new Error("Invalid file field"), "");
    }
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.fieldname === "profileImage" && !file.mimetype.startsWith("image/")) {
    return cb(new Error("Profile image must be an image"));
  }

  if (file.fieldname === "documentPdf" && file.mimetype !== "application/pdf") {
    return cb(new Error("Document must be PDF"));
  }

  cb(null, true);
};

export const uploadEmployeeFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, fieldSize: 10 * 1024 * 1024 }, // 5MB for files, 10MB for base64 string fields
});
