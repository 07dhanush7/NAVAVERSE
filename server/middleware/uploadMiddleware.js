import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const imageTypes = /jpeg|jpg|png|webp|svg/;
const documentTypes = /pdf|doc|docx/;

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeName = allowedTypes.test(file.mimetype.toLowerCase());

  if (extName || mimeName) {
    return cb(null, true);
  }

  return cb(new Error("Unsupported file type"));
};

export const uploadCompanyLogo = multer({
  storage,
  fileFilter: fileFilter(imageTypes),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadContentImage = multer({
  storage,
  fileFilter: fileFilter(imageTypes),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadResume = multer({
  storage,
  fileFilter: fileFilter(documentTypes),
  limits: { fileSize: 8 * 1024 * 1024 },
});
