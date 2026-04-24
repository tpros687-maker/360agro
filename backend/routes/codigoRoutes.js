import express from "express";
import proteger from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import CodigoActivacion from "../models/codigoActivacionModel.js";
import User from "../models/userModel.js";
import { enviarCodigoActivacion } from "../utils/mailer.js";
import { nanoid } from "nanoid";

const router = express.Router();

// Admin: generar y enviar código por email
router.post("/generar", proteger, adminMiddleware, async (req, res) => {
  try {
    const { plan, periodo = "mensual", emailDestino } = req.body;
    const codigo = `${plan.toUpperCase()}-${nanoid(4).toUpperCase()}-${nanoid(4).toUpperCase()}`;
    await CodigoActivacion.create({ codigo, plan, periodo, emailDestino });
    await enviarCodigoActivacion(emailDestino, codigo, plan, periodo);
    res.json({ ok: true, codigo });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al generar código", error: error.message });
  }
});

// Admin: listar códigos
router.get("/", proteger, adminMiddleware, async (req, res) => {
  const codigos = await CodigoActivacion.find()
    .populate("usadoPor", "nombre email")
    .sort("-createdAt");
  res.json(codigos);
});

// Usuario: activar código
router.post("/activar", proteger, async (req, res) => {
  try {
    const { codigo } = req.body;
    const cod = await CodigoActivacion.findOne({ codigo: codigo.toUpperCase().trim() });
    if (!cod) return res.status(404).json({ mensaje: "Código inválido" });
    if (cod.usado) return res.status(400).json({ mensaje: "Este código ya fue utilizado" });

    cod.usado = true;
    cod.usadoPor = req.user._id;
    cod.fechaUso = new Date();
    await cod.save();

    const usuario = await User.findById(req.user._id);
    usuario.plan = cod.plan;
    usuario.periodoPlan = cod.periodo;
    usuario.estadoSuscripcion = "activa";
    usuario.fechaInicioPlan = new Date();
    await usuario.save();

    res.json({ mensaje: `Plan ${cod.plan} activado`, plan: cod.plan });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al activar código", error: error.message });
  }
});

export default router;
