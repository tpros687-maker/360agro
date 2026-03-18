import API from "./userApi";

const proveedorApi = {
  obtenerProveedores: () => API.get("/proveedores"),
  obtenerProveedor: (id) => API.get(`/proveedores/${id}`),
  obtenerMiProveedor: () => API.get("/proveedores/mio"),
  crearProveedor: (data) => API.post("/proveedores", data),
  editarProveedor: (id, data) => API.put(`/proveedores/${id}`, data),
  eliminarProveedor: (id) => API.delete(`/proveedores/${id}`),

  subirLogo: (file) => {
    const form = new FormData();
    form.append("logo", file);
    return API.post("/proveedores/upload/logo", form);
  },

  subirFotos: (files) => {
    const form = new FormData();
    files.forEach((f) => form.append("fotos", f));
    return API.post("/proveedores/upload/fotos", form);
  },

  // ⭐ Registrar clics
  registrarClick: (id, tipo) => API.post(`/proveedores/${id}/click/${tipo}`),
};

export default proveedorApi;
