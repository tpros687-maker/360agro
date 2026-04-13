import { createContext, useEffect, useState, useCallback } from "react";
import api from "../api/axiosConfig"; // Usamos la config centralizada que limpiamos antes

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Intentamos recuperar el usuario del localStorage para carga inmediata
  const [usuario, setUsuario] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loadingAuth, setLoadingAuth] = useState(true);

  // ✔ Validar sesión con el backend
  const verificarSesion = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUsuario(null);
      localStorage.removeItem("user");
      setLoadingAuth(false);
      return;
    }

    try {
      // Usamos el endpoint de perfil que configuramos en el backend
      const { data } = await api.get("/users/perfil");

      const userFull = {
        _id: data._id,
        nombre: data.nombre,
        email: data.email,
        plan: data.plan?.toLowerCase() || "gratis",
        tipoUsuario: data.tipoUsuario,
        foto: data.foto || null,
        telefono: data.telefono || null,
      };

      setUsuario(userFull);
      localStorage.setItem("user", JSON.stringify(userFull)); // Cacheamos datos
    } catch (error) {
      console.error("Error validando sesión:", error.message);
      logout(); // Si el token no sirve, limpiamos todo
    } finally {
      setLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    verificarSesion();
  }, [verificarSesion]);

  // ✔ Login
  const login = async (email, password) => {
    try {
      // Nota: Aquí podrías usar tu userApi o directamente api.post
      const { data } = await api.post("/users/login", { email, password });

      localStorage.setItem("token", data.token);

      const userFull = {
        _id: data._id,
        nombre: data.nombre,
        email: data.email,
        plan: data.plan?.toLowerCase() || "gratis",
        tipoUsuario: data.tipoUsuario,
        foto: data.foto || null,
        telefono: data.telefono || null,
        emailVerificado: data.emailVerificado || false,
      };

      setUsuario(userFull);
      localStorage.setItem("user", JSON.stringify(userFull));

      return data;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // ✔ Refrescar usuario desde el backend (útil tras un pago)
  const refrescarUsuario = async () => {
    try {
      const { data } = await api.get("/users/perfil");
      const userFull = {
        _id: data._id,
        nombre: data.nombre,
        email: data.email,
        plan: data.plan?.toLowerCase() || "gratis",
        tipoUsuario: data.tipoUsuario,
        foto: data.foto || null,
        telefono: data.telefono || null,
      };
      setUsuario(userFull);
      localStorage.setItem("user", JSON.stringify(userFull));
    } catch (error) {
      console.error("Error al refrescar usuario:", error.message);
    }
  };

  // ✔ Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loadingAuth,
        login,
        logout,
        refrescarUsuario,
        actualizarUsuario: setUsuario, // Útil para actualizar el plan tras un pago
      }}
    >
      {!loadingAuth && children}
    </AuthContext.Provider>
  );
}