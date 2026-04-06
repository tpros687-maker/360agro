import api from "./axiosConfig";

const subscripcionApi = {
    obtenerMiSolicitud: () => api.get("/subscripciones/mi-solicitud"),
    solicitar: (planSolicitado) => api.post("/subscripciones/solicitar", { planSolicitado }),
    aprobar: (id) => api.patch(`/subscripciones/${id}/aprobar`),
};

export default subscripcionApi;
