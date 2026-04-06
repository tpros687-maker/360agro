import api from "./axiosConfig";

const mercadoPagoApi = {
    crearSuscripcion: (planKey) => api.post("/mercadopago/crear-suscripcion", { planKey }),
    simularWebhook: (datos) => api.post("/mercadopago/webhook-simulado", datos),
};

export default mercadoPagoApi;
