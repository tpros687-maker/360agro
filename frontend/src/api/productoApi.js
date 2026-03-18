// frontend/src/api/productoApi.js
import api from "./axiosConfig";

const productoApi = {
  // ⭐ Obtener productos del proveedor actual
  obtenerMisProductos() {
    return api.get("/productos/mios");
  },

  // CRUD
  crearProducto(data) {
    return api.post("/productos", data);
  },

  obtenerProducto(id) {
    return api.get(`/productos/${id}`);
  },

  editarProducto(id, data) {
    return api.put(`/productos/${id}`, data);
  },

  eliminarProducto(id) {
    return api.delete(`/productos/${id}`);
  },

  // Subir fotos
  subirFotos(id, formData) {
    return api.post(`/productos/${id}/fotos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Eliminar una foto
  eliminarFoto(id, ruta) {
    return api.delete(`/productos/${id}/foto`, {
      data: { ruta },
    });
  },

  // Cambiar foto principal
  setFotoPrincipal(id, ruta) {
    return api.put(`/productos/${id}/foto-principal`, { ruta });
  },

  // ⭐⭐ Obtener productos por tienda (usando slug)
  obtenerProductosPorTienda(slug) {
    return api.get(`/productos/tienda/${slug}`);
  },
};

export default productoApi;
