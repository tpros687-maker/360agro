import express from "express";
import proteger from "../middleware/authMiddleware.js";

import {
  obtenerTiendas,
  obtenerMiTienda,
  obtenerTienda,
  crearTienda,
  editarTienda,
  eliminarTienda
} from "../controllers/tiendaController.js";

import uploadRoutes from "./tiendaUploadRoutes.js";

const router = express.Router();

// Rutas de subida
router.use("/upload", uploadRoutes);

// Público
router.get("/", obtenerTiendas);

// Privado: mi tienda
router.get("/mi-tienda", proteger, obtenerMiTienda);

// Público por ID
router.get("/:id", obtenerTienda);

// CRUD privado
router.post("/", proteger, crearTienda);
router.put("/:id", proteger, editarTienda);
router.delete("/:id", proteger, eliminarTienda);

export default router;
