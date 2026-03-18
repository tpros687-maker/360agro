import multer from "multer";
import path from "path";
import fs from "fs";

// 1. Definir la ruta absoluta (Evita errores de "Carpeta no encontrada" en diferentes entornos)
const uploadPath = path.join(process.cwd(), "uploads", "productos");

// Crear carpeta si no existe de forma segura
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// 2. VALIDAR TIPOS DE ARCHIVO
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // Pasamos un error amigable que tu backend podrá capturar
    cb(new Error("Formato no permitido. Solo imágenes (JPG, PNG, WEBP)"), false);
  }
};

// 3. CONFIGURACIÓN DE ALMACENAMIENTO
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Creamos un nombre limpio: prefijo + fecha + aleatorio + extensión
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `prod-${uniqueSuffix}${extension}`);
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