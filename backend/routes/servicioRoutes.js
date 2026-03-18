import express from "express";
import proteger from "../middleware/authMiddleware.js";

import {
  obtenerServicios,
  obtenerServicio,
  obtenerMiServicio,
  crearServicio,
  editarServicio,
  eliminarServicio,
  registrarClick,
  subirFotosServicio,
} from "../controllers/servicioController.js";

import {
  uploadFotos,
  manejarErroresMulter,
} from "../middleware/servicioUpload.js";

const router = express.Router();

/* =======================================================
   📌 LISTADO PÚBLICO
======================================================= */
router.get("/", obtenerServicios);

/* =======================================================
   📌 MI SERVICIO (usuario logueado)
   🔥 MOVER ESTA RUTA ANTES DE "/:id"
======================================================= */
router.get("/mio", proteger, obtenerMiServicio);

/* =======================================================
   📌 DETALLE + sumar visita
======================================================= */
router.get("/:id", obtenerServicio);

/* =======================================================
   📌 REGISTRAR CLIC
======================================================= */
router.post("/:id/click/:tipo", registrarClick);

/* =======================================================
   📌 CREAR SERVICIO
======================================================= */
router.post("/", proteger, crearServicio);

/* =======================================================
   📌 SUBIR FOTOS
======================================================= */
router.post(
  "/upload/fotos",
  proteger,
  uploadFotos,
  manejarErroresMulter,
  subirFotosServicio
);

/* =======================================================
   📌 EDITAR SERVICIO
======================================================= */
router.put("/:id", proteger, editarServicio);

/* =======================================================
   📌 ELIMINAR SERVICIO
======================================================= */
router.delete("/:id", proteger, eliminarServicio);

export default router;
