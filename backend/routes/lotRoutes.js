import express from "express";
import proteger from "../middleware/authMiddleware.js";
import {
  crearLote,
  obtenerLotes,
  obtenerLotePorId,
  obtenerMisLotes,
  editarLote,
  eliminarLote,
  subirFotosTemporales,
  subirVideoTemporal,
  registrarInteraccionLote,
} from "../controllers/lotController.js";
import { uploadLote, manejarErroresMulter } from "../middleware/lotUpload.js";

const router = express.Router();

router.get("/", obtenerLotes);
router.get("/mis-lotes", proteger, obtenerMisLotes);
router.get("/:id", obtenerLotePorId);

// 🖼 Subida de fotos temporales
router.post("/upload/images", proteger, uploadLote.array("fotos", 5), manejarErroresMulter, subirFotosTemporales);

// 🎥 Subida de video temporal
router.post("/upload/video", proteger, uploadLote.single("video"), manejarErroresMulter, subirVideoTemporal);

// 🔸 Crear Lote: AÑADIMOS uploadLote.any() para que Multer procese el FormData y llene el req.body
router.post("/", proteger, (req, res, next) => {
  uploadLote.any()(req, res, (err) => {
    if (err) {
      console.error('MULTER ERROR:', String(err), err?.message, err?.stack)
      return res.status(500).json({ message: String(err) })
    }
    next()
  })
}, crearLote);

router.put("/:id", proteger, uploadLote.any(), editarLote);
router.patch("/:id/interaccion", registrarInteraccionLote);
router.delete("/:id", proteger, eliminarLote);

export default router;