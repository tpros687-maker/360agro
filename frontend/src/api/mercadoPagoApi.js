import api from "./axiosConfig";

const mercadoPagoApi = {
    crearSuscripcion: (planKey, periodo = "mensual") => api.post("/mercadopago/crear-suscripcion", { planKey, periodo }),
    simularWebhook: (datos) => api.post("/mercadopago/webhook-simulado", datos),
};

export default mercadoPagoApi;
