import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.js";

// Configuración de almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "agro/uploads",
    resource_type: "auto",
  },
});

// Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de archivo no permitido. Solo JPG, PNG o MP4."), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
