import express from "express";
import { crearSolicitud, aprobarSubscripcion, obtenerMiSolicitud } from "../controllers/subscripcionController.js";
import proteger from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import Subscripcion from "../models/subscripcionModel.js";

const router = express.Router();

router.get("/mi-solicitud", proteger, obtenerMiSolicitud);
router.post("/solicitar", proteger, crearSolicitud);
router.patch("/:id/aprobar", proteger, adminMiddleware, aprobarSubscripcion);

router.delete("/mi-solicitud", proteger, async (req, res) => {
  await Subscripcion.deleteOne({ usuario: req.user._id, status: "Pendiente" });
  res.json({ ok: true });
});

export default router;
