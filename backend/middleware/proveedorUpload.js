// backend/middleware/proveedorUpload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.js";

// =============================================
// 📦 Configuración de storage en Cloudinary
// =============================================
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "agro/proveedores",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto" }],
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
