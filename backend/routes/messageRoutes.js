import express from "express";
import proteger from "../middleware/authMiddleware.js";
import uploadChat from "../config/multerChat.js";

// Importamos solo las funciones que existen en el nuevo controlador
import {
  enviarMensaje,
  obtenerConversacion,
  obtenerConversaciones,
} from "../controllers/messageController.js"; 

const router = express.Router();

// =======================================================
// 📥 BANDEJA DE ENTRADA (Listado de chats agrupados)
// =======================================================
// Antes era "/", ahora usamos "/bandeja" para que sea más claro
router.get("/bandeja", proteger, obtenerConversaciones);

// =======================================================
// 🔍 HISTORIAL DE CHAT ESPECÍFICO
// =======================================================
// Marcado de leídos ocurre automáticamente dentro de esta función
router.get(
  "/conversacion/:referenciaId/:otroUsuarioId",
  proteger,
  obtenerConversacion
);

// =======================================================
// 📨 ENVIAR MENSAJE (Con soporte para archivos)
// =======================================================
router.post(
  "/enviar",
  proteger,
  uploadChat.single("archivo"),
  enviarMensaje
);

export default router;