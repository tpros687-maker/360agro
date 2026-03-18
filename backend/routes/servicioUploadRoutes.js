import express from "express";
import proteger from "../middleware/authMiddleware.js";

// 👉 Importa MIDDLEWARES reales
import {
  uploadFotos,
  manejarErroresMulter
} from "../middleware/servicioUpload.js";

// 👉 Importa CONTROLADORES reales
import {
  subirFotosServicio,
  eliminarFotoServicio
} from "../controllers/servicioUploadController.js";

const router = express.Router();

// ===============================
//  SUBIR FOTOS DE SERVICIOS
// ===============================
router.post(
  "/fotos",
  proteger,
  uploadFotos,             // ✔ middleware correcto
  manejarErroresMulter,    // ✔ manejo de errores
  subirFotosServicio       // ✔ controlador
);

// ===============================
//  ELIMINAR FOTO
// ===============================
router.delete(
  "/foto",
  proteger,
  eliminarFotoServicio
);

export default router;
