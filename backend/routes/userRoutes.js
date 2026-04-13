import express from "express";
import {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  actualizarPerfil,
  actualizarPlan,
  verificarEmail,
  cambiarPassword,
  solicitarResetPassword,
  resetPassword
} from "../controllers/userController.js";
import proteger from "../middleware/authMiddleware.js";

const router = express.Router();

// Registro & Login
router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);

// Obtener perfil del usuario logueado
router.get("/perfil", proteger, obtenerPerfil);

// Actualizar perfil (nombre/email)
router.put("/perfil", proteger, actualizarPerfil);

// Actualizar plan del usuario
router.put("/plan", proteger, actualizarPlan);

// Verificar email con código
router.post("/verificar-email", proteger, verificarEmail);

// Cambiar contraseña
router.put("/cambiar-password", proteger, cambiarPassword);

// Reset de contraseña (sin autenticación)
router.post("/solicitar-reset", solicitarResetPassword);
router.post("/reset-password", resetPassword);

export default router;
