import api from "./axiosConfig";

const pedidoApi = {
    // 🛍️ Crear Orden de Compra (Cliente B2C)
    crearPedido(datosPedido) {
        return api.post("/pedidos", datosPedido);
    },

    // 📋 Obtener pedidos que yo he comprado
    obtenerMisPedidos() {
        return api.get("/pedidos/mios");
    },

    // 🏪 Obtener órdenes recibidas por mi Tienda B2B
    obtenerOrdenesRecibidas() {
        return api.get("/pedidos/tienda");
    },

    // 🔄 Actualizar el estado de una orden (Pendiente a Completada, etc)
    actualizarEstadoOrden(id, estado) {
        return api.put(`/pedidos/tienda/${id}/estado`, { estado });
    },
};

export default pedidoApi;
