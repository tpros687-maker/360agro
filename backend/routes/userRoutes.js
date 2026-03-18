import express from "express";
import {
  registrarUsuario,
  loginUsuario,
  obtenerPerfil,
  actualizarPerfil,
  actualizarPlan
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

export default router;
