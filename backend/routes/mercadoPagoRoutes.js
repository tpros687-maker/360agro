import express from "express";
import { crearSuscripcionSimulada, webhookSimulado } from "../controllers/mercadoPagoController.js";
import proteger from "../middleware/authMiddleware.js";

const router = express.Router();

// Ruta para iniciar el proceso de pago
router.post("/crear-suscripcion", proteger, crearSuscripcionSimulada);

// Webhook simulado (en prod esta ruta debe ser pública para que MP la llame)
router.post("/webhook-simulado", proteger, webhookSimulado);

export default router;
