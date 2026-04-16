import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.js";

// === configuración Cloudinary ===
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "agro/servicios",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto" }],
  },
});

// === validación ===
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Formato de archivo no permitido."), false);
  }
  cb(null, true);
};

// === límite ===
const limits = { fileSize: 5 * 1024 * 1024 };

// === EXPORT CORRECTO ===
export const uploadFotos = multer({
  storage,
  fileFilter,
  limits,
}).array("fotos", 8);

// === MANEJADOR DE ERRORES ===
export const manejarErroresMulter = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ mensaje: err.message });
  }
  if (err) {
    return res.status(400).json({ mensaje: err.message });
  }
  next();
};
