import multer from "multer";
import path from "path";
import fs from "fs";

// === asegurar carpeta uploads/lotes ===
const lotesPath = path.join("uploads", "lotes");
if (!fs.existsSync(lotesPath)) {
    fs.mkdirSync(lotesPath, { recursive: true });
}

// === configuración disco ===
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, lotesPath);
    },
    filename(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, unique + ext);
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
const limits = { fileSize: 15 * 1024 * 1024 }; // 15MB para videos

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
