import express from "express";
import proteger from "../middleware/authMiddleware.js";
import { uploadFotos, manejarErroresMulter } from "../middleware/servicioUpload.js";
import {
  crearServicio,
  obtenerServicios,
  obtenerMiServicio,
  obtenerServicio,
  editarServicio,
  eliminarServicio,
  registrarClick,
  subirFotosServicio
} from "../controllers/servicioController.js";

const router = express.Router();

/* =======================================================
    📌 RUTAS PÚBLICAS
======================================================= */

// Obtener catálogo completo (Ruta: GET /api/servicios-profesionales)
router.get("/", obtenerServicios);

/* =======================================================
    📌 RUTAS PROTEGIDAS (Requieren Token)
======================================================= */

// Obtener servicios del usuario logueado (Panel de control)
// ⚠️ Debe ir ANTES de /:id para no ser capturada como wildcard
router.get("/mis-servicios", proteger, obtenerMiServicio);

// Crear Servicio (Usa uploadFotos.any() para procesar FormData con múltiples archivos)
router.post("/", proteger, uploadFotos, manejarErroresMulter, crearServicio);

// Obtener detalle de un servicio (Ruta: GET /api/servicios-profesionales/:id)
router.get("/:id", obtenerServicio);

// Registrar métricas (Ruta: PUT /api/servicios-profesionales/:id/click/:tipo)
router.put("/:id/click/:tipo", registrarClick);

// Editar Servicio (Permite actualizar campos y fotos)
router.put("/:id", proteger, uploadFotos, manejarErroresMulter, editarServicio);

// Eliminar Servicio (Limpia base de datos y archivos físicos)
router.delete("/:id", proteger, eliminarServicio);

// Ruta corregida para carga de fotos vinculada al ID del servicio
router.post("/:id/fotos", proteger, uploadFotos, manejarErroresMulter, subirFotosServicio);

export default router;