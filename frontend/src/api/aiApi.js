import api from "./axiosConfig";

const aiApi = {
    consultar: (mensaje, contexto, historial) =>
        api.post("/ai/consultar", { mensaje, contexto, historial }),
};

export default aiApi;
