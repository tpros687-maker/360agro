import axios from "axios";
import { BASE_URL } from "./axiosConfig";

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// Agregar token automáticamente
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===============================
// 🛒 PRODUCTOS DE TIENDA
// ===============================

const tiendaProductosApi = {
  // 1️⃣ Crear producto
  crearProducto: (data) => API.post("/productos", data),

  // 2️⃣ Subir imagen (1 por producto)
  subirImagen: (productoId, formData) =>
    API.post(`/productos/${productoId}/imagen`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // 3️⃣ Obtener productos de MI tienda
  obtenerMisProductos: () => API.get("/productos/mios"),

  // 4️⃣ Obtener un producto por ID
  obtenerProducto: (id) => API.get(`/productos/${id}`),

  // 5️⃣ Editar producto
  editarProducto: (id, data) => API.put(`/productos/${id}`, data),

  // 6️⃣ Eliminar producto
  eliminarProducto: (id) => API.delete(`/productos/${id}`),
};

export default tiendaProductosApi;
