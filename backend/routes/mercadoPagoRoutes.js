import express from "express";
import { crearSuscripcion, webhook } from "../controllers/mercadoPagoController.js";
import proteger from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/crear-suscripcion", proteger, crearSuscripcion);
router.post("/webhook", webhook);

export default router;
