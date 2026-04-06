import api from "./userApi";

const servicioApi = {

  // Obtener listado público
  obtenerServicios: () => api.get("/servicios-profesionales"),

  // Obtener detalle de un servicio específico
  obtenerServicio: (id) => api.get(`/servicios-profesionales/${id}`),

  // ✅ CORREGIDO: Coincide con la ruta /mis-servicios del backend
  obtenerMiServicio: () => api.get("/servicios-profesionales/mis-servicios"),

  // ✅ CORREGIDO: Ahora acepta FormData (con fotos) en una sola operación
  crearServicio: (formData) =>
    api.post("/servicios-profesionales", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Editar servicio (también puede recibir fotos nuevas)
  editarServicio: (id, formData) =>
    api.put(`/servicios-profesionales/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  eliminarServicio: (id) =>
    api.delete(`/servicios-profesionales/${id}`),

  // Eliminar foto específica del servidor
  eliminarFoto: (ruta) =>
    api.delete("/servicios-profesionales/upload/foto", {
      data: { ruta },
    }),

  // ✅ CORREGIDO: Coincide con la estructura /click/:id/:tipo
  registrarClick: (id, tipo) =>
    api.put(`/servicios-profesionales/${id}/click/${tipo}`),

  // Subida masiva de fotos vinculada a un servicio específico
  subirFotos: (id, formData) =>
    api.post(`/servicios-profesionales/${id}/fotos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default servicioApi;