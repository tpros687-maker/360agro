import axios from "axios";
import { BASE_URL } from "./axiosConfig";

const API = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// 👉 Agregar token automáticamente
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;

export const verify2FA = (email, codigo) => API.post("/users/verify-2fa", { email, codigo });
export const toggle2FA = () => API.post("/users/toggle-2fa");
export const ssoTo360Finance = () => API.post("/users/sso-token");
