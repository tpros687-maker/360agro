// frontend/src/api/messageApi.js
import API from "./userApi";

const MessageAPI = {

  // 📨 Enviar mensaje (texto o archivo)
  enviarMensaje: (formData) =>
    API.post("/mensajes/enviar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // 💬 Obtener conversaciones agrupadas
  obtenerMisConversaciones: () => API.get("/mensajes"),

  // 🔍 Obtener chat específico por lote + usuario
  obtenerConversacion: (loteId, otroUsuarioId) =>
    API.get(`/mensajes/conversacion/${loteId}/${otroUsuarioId}`),

  // 📥 Obtener mensajes recibidos
  obtenerRecibidos: () => API.get("/mensajes/recibidos"),

  // ✔ Marcar mensaje individual
  marcarLeido: (idMensaje) =>
    API.put(`/mensajes/marcar-leido/${idMensaje}`),

  // 🔥 NUEVO: Marcar todos los mensajes del lote como leídos
  marcarLeidoLote: (loteId, otroUsuarioId) =>
    API.put(`/mensajes/marcar-leido-lote/${loteId}/${otroUsuarioId}`),
};

export default MessageAPI;
