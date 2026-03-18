import api from "./axiosConfig";

const lotApi = {
  // Obtener todos los lotes (para el Explorar)
  obtenerLotes: () => api.get("/lots"),

  // Obtener un lote específico (para el Detalle)
  obtenerLotePorId: (id) => api.get(`/lots/${id}`),

  // Obtener solo mis lotes (para el Panel de Control)
  obtenerMisLotes: () => api.get("/lots/mis-lotes"),

  // Crear un nuevo lote (Hacienda/Maquinaria)
  crearLote: (formData) => api.post("/lots", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),

  // Registrar métricas (WhatsApp/Visitas)
  registrarInteraccion: (id, tipo) => api.patch(`/lots/${id}/interaccion`, { tipo }),

  // Eliminar activo
  eliminarLote: (id) => api.delete(`/lots/${id}`),
};

export default lotApi;