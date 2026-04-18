import express from "express";
import { crearSuscripcion, webhook, cancelarSuscripcion } from "../controllers/mercadoPagoController.js";
import proteger from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/crear-suscripcion", proteger, crearSuscripcion);
router.post("/webhook", webhook);
router.post("/cancelar", proteger, cancelarSuscripcion);

export default router;
