import express from "express";
import { crearSolicitud, aprobarSubscripcion, obtenerMiSolicitud } from "../controllers/subscripcionController.js";
import proteger from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mi-solicitud", proteger, obtenerMiSolicitud);
router.post("/solicitar", proteger, crearSolicitud);
router.patch("/:id/aprobar", proteger, aprobarSubscripcion); // En prod añadir middleware de admin

export default router;
