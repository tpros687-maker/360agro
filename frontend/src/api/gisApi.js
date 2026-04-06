import api from "./axiosConfig";

export const getGisAssets = () => api.get("/gis");
export const createGisAsset = (data) => api.post("/gis", data);
export const updateGisAsset = (id, data) => api.put(`/gis/${id}`, data);
export const deleteGisAsset = (id) => api.delete(`/gis/${id}`);
