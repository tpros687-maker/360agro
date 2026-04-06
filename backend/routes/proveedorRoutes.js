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
  obtenerProveedor,
  subirLogo,
  subirFotosProveedor,
  eliminarFotoProveedor,
  eliminarLogoProveedor,
} from "../controllers/proveedorController.js";

import {
  uploadLogo,
  uploadFotos,
  uploadTienda,
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

// Perfil de negocio por su SLUG
router.get("/perfil/:slug", obtenerProveedorPorSlug);
router.get("/slug/:slug", obtenerProveedorPorSlug);

// Perfil de negocio por su ID (para uso interno/admin)
router.get("/id/:id", obtenerProveedor);


// =======================================================
// 🔐 RUTAS PRIVADAS (Panel de Vendedor)
// =======================================================

// Obtener mi propio perfil de negocio (Unificado: me/mio)
router.get("/me", proteger, obtenerMiProveedor);
router.get("/mio", proteger, obtenerMiProveedor);

// Crear el perfil de negocio (Tienda o Servicio)
router.post("/", proteger, uploadTienda, manejarErroresMulter, crearProveedor);

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