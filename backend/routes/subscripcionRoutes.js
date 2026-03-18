import express from "express";
import {
  obtenerPlanes,
  cambiarPlan,
  obtenerMiPlan
} from "../controllers/subscripcionController.js";
import proteger from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 Rutas disponibles
router.get("/planes", obtenerPlanes);
router.get("/mi-plan", proteger, obtenerMiPlan);
router.post("/cambiar", proteger, cambiarPlan);

export default router; // 👈 ESTA LÍNEA ES LA CLAVE
