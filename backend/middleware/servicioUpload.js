import multer from "multer";
import path from "path";
import fs from "fs";

// === asegurar carpeta uploads/servicios ===
const serviciosPath = path.join("uploads", "servicios");
if (!fs.existsSync(serviciosPath)) {
  fs.mkdirSync(serviciosPath, { recursive: true });
}

// === configuración disco ===
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, serviciosPath);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + ext);
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
