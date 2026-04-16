import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "./cloudinary.js";

// 2. VALIDAR TIPOS DE ARCHIVO
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato no permitido. Solo imágenes (JPG, PNG, WEBP)"), false);
  }
};

// 3. CONFIGURACIÓN DE ALMACENAMIENTO EN CLOUDINARY
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "agro/productos",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto" }],
  },
});

// 4. INSTANCIA DE MULTER CON LÍMITES
const uploadProductos = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Reducido a 5MB (suficiente para productos y ahorra espacio)
    files: 5, // Límite de 5 fotos por producto para el MVP
  },
});

export default uploadProductos;