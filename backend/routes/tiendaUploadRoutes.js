// backend/routes/tiendaUploadRoutes.js
import express from "express";
import proteger from "../middleware/authMiddleware.js";

import {
  upload,
  subirLogo,
  eliminarLogo,
  subirFotos,
  eliminarFoto
} from "../controllers/tiendaUploadController.js";

const router = express.Router();

// LOGO
router.post("/logo", proteger, upload.single("logo"), subirLogo);
router.delete("/logo", proteger, eliminarLogo);

// FOTOS
router.post("/fotos", proteger, upload.array("fotos", 10), subirFotos);
router.delete("/foto", proteger, eliminarFoto);

export default router;
