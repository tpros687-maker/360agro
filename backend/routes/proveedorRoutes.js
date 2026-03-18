import express from "express";
import proteger from "../middleware/authMiddleware.js";

import {
  obtenerProveedores,
  obtenerProveedorPorSlug,
  obtenerMiProveedor,
  crearProveedor,
  editarProveedor,
  eliminarProveedor,
  registrarClick,
  subirLogo,
  subirFotosProveedor,
  eliminarFotoProveedor,
  eliminarLogoProveedor,
} from "../controllers/proveedorController.js";

import {
  uploadLogo,
  uploadFotos,
  manejarErroresMulter,
} from "../middleware/proveedorUpload.js";

const router = express.Router();

// =======================================================
// 🌍 RUTAS PÚBLICAS (Listados y Perfiles)
// =======================================================

// Listado de Tiendas o Servicios (soporta ?tipo=tienda&search=...)
router.get("/", obtenerProveedores);

// Registro de métricas (clics en WhatsApp, etc.)
// Cambiado a PATCH para ser más semántico con una actualización
router.patch("/click/:slug/:tipo", registrarClick);

// Perfil de negocio por su SLUG (VA AL FINAL para no interferir)
router.get("/perfil/:slug", obtenerProveedorPorSlug);


// =======================================================
// 🔐 RUTAS PRIVADAS (Panel de Vendedor)
// =======================================================

// Obtener mi propio perfil de negocio (antes era /mio)
router.get("/me", proteger, obtenerMiProveedor);

// Crear el perfil de negocio (Tienda o Servicio)
router.post("/", proteger, crearProveedor);

// Editar datos del negocio
router.put("/:id", proteger, editarProveedor);

// Eliminar perfil y archivos físicos
router.delete("/:id", proteger, eliminarProveedor);


// =======================================================
// 📸 GESTIÓN DE IDENTIDAD VISUAL (Multer)
// =======================================================

// Logo de la empresa
router.post(
  "/upload/logo",
  proteger,
  uploadLogo,
  manejarErroresMulter,
  subirLogo
);

router.delete("/:id/logo", proteger, eliminarLogoProveedor);

// Galería de fotos (local, maquinaria, etc.)
router.post(
  "/upload/fotos",
  proteger,
  uploadFotos,
  manejarErroresMulter,
  subirFotosProveedor
);

router.delete("/:id/foto", proteger, eliminarFotoProveedor);

export default router;