import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * 🛡️ PROTECTED ADMIN
 * Verifica que el usuario esté logueado Y tenga rol de administrador.
 */
const ProtectedAdmin = () => {
    const { usuario, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="bg-agro-midnight min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-agro-teal shadow-teal-glow"></div>
            </div>
        );
    }

    if (!usuario || usuario.tipoUsuario !== "admin") {
        console.warn("🚫 Acceso denegado: Se requiere perfil de administrador.");
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedAdmin;
