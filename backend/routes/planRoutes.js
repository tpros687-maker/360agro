import express from "express";
import { obtenerPlanes, asignarPlan } from "../controllers/planController.js";
import proteger from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import Plan from "../models/planModel.js";

const router = express.Router();

// Crear plan (solo admin)
router.post("/", proteger, adminMiddleware, async (req, res) => {
  try {
    const nuevoPlan = await Plan.create(req.body);
    res.status(201).json(nuevoPlan);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear plan", error: error.message });
  }
});

// Listar planes
router.get("/", obtenerPlanes);

// Asignar plan (requiere token)
router.post("/asignar", proteger, asignarPlan);

export default router;
