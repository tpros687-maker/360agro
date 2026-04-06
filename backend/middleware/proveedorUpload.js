// backend/middleware/proveedorUpload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// =============================================
// 📁 Asegurar carpeta uploads/proveedores
// =============================================
const proveedoresPath = path.join("uploads", "proveedores");

if (!fs.existsSync(proveedoresPath)) {
  fs.mkdirSync(proveedoresPath, { recursive: true });
}

// =============================================
// 📦 Configuración de storage
// =============================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, proveedoresPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + ext);
  },
});

// =============================================
// 🔒 Validación de archivos
// =============================================
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Formato de archivo no permitido."), false);
  }
  cb(null, true);
};

// =============================================
// ⚠️ Límite de 5MB por archivo
// =============================================
const limits = { fileSize: 5 * 1024 * 1024 };

// =============================================
// 🟢 Subida de LOGO (1 archivo)
// =============================================
export const uploadLogo = multer({
  storage,
  fileFilter,
  limits,
}).single("logo");

// =============================================
// 🟢 Subida de FOTOS (máx 8 imágenes)
// =============================================
export const uploadFotos = multer({
  storage,
  fileFilter,
  limits,
}).array("fotos", 8);

// =============================================
// 🟢 Subida COMBINADA (Logo + Fotos) para Creación
// =============================================
export const uploadTienda = multer({
  storage,
  fileFilter,
  limits,
}).fields([
  { name: "logo", maxCount: 1 },
  { name: "fotos", maxCount: 8 }
]);

// =============================================
// 🛑 Manejo de errores de Multer
// =============================================
export const manejarErroresMulter = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ mensaje: `Error al subir archivos: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ mensaje: err.message });
  }
  next();
};
