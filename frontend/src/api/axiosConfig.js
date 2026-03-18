import axios from "axios";

// 1. Definición de la URL base
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  // timeout: 10000, // Opcional: 10 segundos para evitar esperas infinitas
});

// 2. Interceptor de PETICIÓN: Enviar el token en cada llamada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de RESPUESTA: Manejar errores globales (como el 401)
api.interceptors.response.use(
  (response) => response, // Si la respuesta es OK, la dejamos pasar
  (error) => {
    // Si el backend responde 401 (No autorizado/Token expirado)
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada o no autorizada. Redirigiendo...");
      
      // Limpiamos el storage para evitar bucles
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirigir al login solo si no estamos ya ahí
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // Retornamos el error para que el componente (ej: Login.jsx) pueda mostrar el mensaje
    return Promise.reject(error);
  }
);

export default api;