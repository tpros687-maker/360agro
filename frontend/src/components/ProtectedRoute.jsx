import { Navigate, Outlet } from "react-router-dom"; // Importamos Outlet
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute() { // Quitamos { children }
  const { usuario, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) {
    return (
      <div className="bg-agro-midnight min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-agro-teal"></div>
      </div>
    );
  }

  // Si no hay usuario, mandamos al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Outlet es lo que permite que se rendericen las rutas que están "dentro" en App.jsx
  return <Outlet />;
}