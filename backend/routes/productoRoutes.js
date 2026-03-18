import express from "express";
import { 
    crearProducto, 
    buscarProductosGlobal, 
    obtenerProductosProveedor, 
    obtenerProductosPorTienda,
    editarProducto, 
    eliminarProducto,
    subirFotosProducto,
    eliminarFotoProducto,
    setFotoPrincipal 
} from "../controllers/productoController.js";
import proteger from "../middleware/authMiddleware.js";
import uploadProductos from "../config/multerProductos.js";

const router = express.Router();

// =======================================================
// 🌍 RUTAS PÚBLICAS
// =======================================================

/**
 * 🔍 Buscador Global / Explorar
 * Uso: GET /api/productos/buscar/global?search=termino
 */
router.get("/buscar/global", buscarProductosGlobal); 

/**
 * 🏪 Obtener productos de un Showroom específico por su SLUG
 * Uso: GET /api/productos/tienda/:slug
 */
router.get("/tienda/:slug", obtenerProductosPorTienda);


// =======================================================
// 🔐 RUTAS PRIVADAS (Requieren Token de Proveedor)
// =======================================================

/**
 * 📋 Listado de mis productos (Dashboard)
 */
router.get("/mios", proteger, obtenerProductosProveedor);

/**
 * ➕ Crear nuevo producto
 */
router.post("/", proteger, crearProducto);

/**
 * 📝 Editar datos de un producto
 */
router.put("/:id", proteger, editarProducto);

/**
 * 🗑️ Eliminar producto y sus archivos físicos
 */
router.delete("/:id", proteger, eliminarProducto);

// =======================================================
// 📸 GESTIÓN DE ASSETS VISUALES
// =======================================================

/**
 * 📤 Subir galería de imágenes (Máximo 5)
 */
router.post("/:id/fotos", proteger, uploadProductos.array("fotos", 5), subirFotosProducto);

/**
 * ❌ Eliminar una foto específica de la galería
 */
router.delete("/:id/foto", proteger, eliminarFotoProducto);

/**
 * 🖼️ Definir cuál es la miniatura principal del producto
 */
router.put("/:id/foto-principal", proteger, setFotoPrincipal);

export default router;