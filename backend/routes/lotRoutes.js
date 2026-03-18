// backend/routes/lotRoutes.js
import express from "express";
import proteger from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

import {
  crearLote,
  obtenerLotes,
  obtenerLotePorId,
  obtenerMisLotes,
  editarLote,
  eliminarLote,
  subirFotosTemporales,
  subirVideoTemporal,
} from "../controllers/lotController.js";

const router = express.Router();

// 🔹 Rutas públicas
router.get("/", obtenerLotes);

// 🔹 Rutas específicas antes que las dinámicas
router.get("/mis-lotes", proteger, obtenerMisLotes);
router.get("/:id", obtenerLotePorId);

// 🖼 Subida de fotos
router.post(
  "/upload/images",
  proteger,
  upload.array("fotos", 5),
  subirFotosTemporales
);

// 🎥 Subida de video
router.post(
  "/upload/video",
  proteger,
  upload.single("video"),
  subirVideoTemporal
);

// 🔸 Crear / editar / borrar lotes
router.post("/", proteger, crearLote);
router.put("/:id", proteger, editarLote);
router.delete("/:id", proteger, eliminarLote);

export default router;
