import api from "./axiosConfig";

const subscripcionApi = {
    obtenerMiSolicitud: () => api.get("/subscripciones/mi-solicitud"),
    solicitar: (planSolicitado) => api.post("/subscripciones/solicitar", { planSolicitado }),
    aprobar: (id) => api.patch(`/subscripciones/${id}/aprobar`),
    cancelar: () => api.post("/mercadopago/cancelar"),
    resetearSolicitud: () => api.delete("/subscripciones/mi-solicitud"),
};

export default subscripcionApi;
