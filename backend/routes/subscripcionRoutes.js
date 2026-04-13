import express from "express";
import { crearSolicitud, aprobarSubscripcion, obtenerMiSolicitud } from "../controllers/subscripcionController.js";
import proteger from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/mi-solicitud", proteger, obtenerMiSolicitud);
router.post("/solicitar", proteger, crearSolicitud);
router.patch("/:id/aprobar", proteger, adminMiddleware, aprobarSubscripcion);

export default router;
