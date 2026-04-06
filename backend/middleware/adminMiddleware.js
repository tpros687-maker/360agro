/**
 * 🛡️ ADMIN MIDDLEWARE
 * Solo permite el paso si el usuario tiene el rol 'admin'.
 * Debe usarse DESPUÉS del middleware 'proteger'.
 */
const admin = (req, res, next) => {
    if (req.user && req.user.tipoUsuario === "admin") {
        next();
    } else {
        res.status(403).json({
            mensaje: "Acceso denegado: Se requieren privilegios de administrador",
            error: "FORBIDDEN_ADMIN_ONLY"
        });
    }
};

export default admin;
