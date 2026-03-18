// frontend/src/components/ProtectedProveedor.jsx
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedProveedor({ children }) {
  const { usuario, cargando } = useContext(AuthContext);

  // 🔎 DEBUG: Mostrar el usuario que llega a la ruta protegida
  console.log("🔎 ProtectedProveedor usuario:", usuario);

  if (cargando) return null;

  // ❌ No logueado
  if (!usuario) {
    console.log("⛔ BLOQUEADO: No hay usuario logueado");
    return <Navigate to="/login" />;
  }

  // ❌ Logueado pero sin plan empresa
  if (usuario.plan !== "empresa") {
    console.log("⛔ BLOQUEADO: El plan NO es 'empresa', es:", usuario.plan);
    return <Navigate to="/planes" />;
  }

  // ✔ Logueado y con plan empresa → permitir acceso
  console.log("🟢 ACCESO PERMITIDO: Usuario con plan 'empresa'");
  return children;
}
