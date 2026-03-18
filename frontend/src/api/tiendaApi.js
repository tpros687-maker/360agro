import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// 🔒 Agregar token automáticamente
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ========================================
// RUTAS PARA PROVEEDORES (TIENDAS)
// ========================================
const tiendaApi = {
  // 🟢 Obtener todos los proveedores (listado público)
  obtenerTiendas: () => API.get("/proveedores"),

  // 🟢 Obtener tienda por SLUG (detalle público)
  obtenerTiendaPorSlug: (slug) => API.get(`/proveedores/${slug}`),

  // 🟢 Obtener tienda por ID (para backend)
  obtenerTiendaPorId: (id) => API.get(`/proveedores/id/${id}`),

  // 🟢 Obtener mi tienda (privado)
  obtenerMiTienda: () => API.get("/proveedores/mio"),

  // 🟢 Crear tienda
  crearTienda: (data) => API.post("/proveedores", data),

  // 🟢 Editar tienda
  editarTienda: (id, data) => API.put(`/proveedores/${id}`, data),

  // 🟡 Subir logo
  subirLogo: (formData) =>
    API.post("/proveedores/upload/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // 🟡 Subir fotos
  subirFotos: (formData) =>
    API.post("/proveedores/upload/fotos", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // 🔥 🟢 Eliminar una foto del proveedor
  eliminarFoto: (id, foto) =>
    API.delete(`/proveedores/${id}/foto`, {
      data: { foto },
    }),

  // 🔥 🟢 Eliminar solo el logo del proveedor
  eliminarLogo: (id) =>
    API.delete(`/proveedores/${id}/logo`),

  // ⭐ Registrar clic
  registrarClick: (slug, tipo) =>
    API.post(`/proveedores/${slug}/click/${tipo}`),
};

export default tiendaApi;
