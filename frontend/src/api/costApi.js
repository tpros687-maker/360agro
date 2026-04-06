import api from "./axiosConfig";

const costApi = {
    calculate: (data) => api.post("/costs/calculate", data),
    getMe: () => api.get("/costs"),
    getByLote: (loteId) => api.get(`/costs/lote/${loteId}`),
};

export default costApi;
