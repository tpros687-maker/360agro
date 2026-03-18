// backend/middleware/tiendaUpload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Ruta donde guardar imágenes
const uploadDir = "uploads/tiendas";

// Crear carpeta si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const nombreArchivo = Date.now() + path.extname(file.originalname);
    cb(null, nombreArchivo);
  },
});

const upload = multer({ storage });

// -------- EXPORTACIONES --------

// Subir logo (1 archivo)
export const uploadLogo = upload.single("logo");

// Subir fotos (múltiples)
export const uploadFotos = upload.array("fotos", 10);

// Manejo de errores de Multer
export const manejarErroresMulter = (error, req, res, next) => {
  console.error("❌ Error Multer:", error);
  res.status(400).json({ mensaje: "Error al subir imágenes" });
};
