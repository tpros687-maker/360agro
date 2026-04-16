import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.js";

// === configuración Cloudinary (resource_type auto para soportar imágenes, video y PDF) ===
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "agro/lotes",
        resource_type: "auto",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "pdf"],
    },
});

// === validación ===
const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg", "video/mp4", "application/pdf"];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Formato de archivo no permitido (JPG, PNG, WEBP, MP4, PDF)."), false);
    }
    cb(null, true);
};

// === límite ===
const limits = { fileSize: 50 * 1024 * 1024 }; // 50MB para videos

// === EXPORT CORRECTO ===
export const uploadLote = multer({
    storage,
    fileFilter,
    limits,
});

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
