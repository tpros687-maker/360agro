import api from "./userApi";

const servicioApi = {

  obtenerServicios: () => api.get("/servicios-profesionales"),

  obtenerServicio: (id) =>
    api.get(`/servicios-profesionales/${id}`),

  obtenerMiServicio: () =>
    api.get("/servicios-profesionales/mio"),

  crearServicio: (data) =>
    api.post("/servicios-profesionales", data),

  subirFotos: (formData) =>
    api.post("/servicios-profesionales/upload/fotos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  editarServicio: (id, data) =>
    api.put(`/servicios-profesionales/${id}`, data),

  eliminarServicio: (id) =>
    api.delete(`/servicios-profesionales/${id}`),

  // 🔥 FOTO - eliminar (CORREGIDO)
  eliminarFoto: (ruta) =>
    api.delete("/servicios-profesionales/upload/foto", {
      data: { ruta },   // ✔ el backend lo espera en req.body.ruta
    }),

  // Registrar click
  registrarClick: (id, tipo) =>
    api.post(`/servicios-profesionales/${id}/click/${tipo}`),
};

export default servicioApi;
