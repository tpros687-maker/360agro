import express from "express";
import {
    crearPedido,
    obtenerMisPedidos,
    obtenerOrdenesRecibidas,
    actualizarEstadoOrden,
} from "../controllers/pedidoController.js";
import proteger from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================================
// RUTAS PARA COMPRADORES (Clientes B2C)
// ==========================================
router.post("/", proteger, crearPedido);
router.get("/mios", proteger, obtenerMisPedidos);

// ==========================================
// RUTAS PARA VENDEDORES (Tiendas B2B)
// ==========================================
// Nota: En un entorno de producción estricto, 
// podríamos añadir un middleware extra "isEmpresa"
router.get("/tienda", proteger, obtenerOrdenesRecibidas);
router.put("/tienda/:id/estado", proteger, actualizarEstadoOrden);

export default router;
