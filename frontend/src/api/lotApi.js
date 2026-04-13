import api from "./axiosConfig";

const lotApi = {
  // Obtener todos los lotes (para el Explorar)
  obtenerLotes: (categoria) => api.get("/lots", {
    params: categoria && categoria !== "Todas" ? { categoria } : {}
  }),

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

  // Actualizar lote (estado, campos)
  actualizarLote: (id, data) => api.put(`/lots/${id}`, data),

  // Eliminar activo
  eliminarLote: (id) => api.delete(`/lots/${id}`),
};

export default lotApi;