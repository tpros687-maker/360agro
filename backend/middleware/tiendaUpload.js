// backend/middleware/tiendaUpload.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.js";

// Configuración de Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "agro/tiendas",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto" }],
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
