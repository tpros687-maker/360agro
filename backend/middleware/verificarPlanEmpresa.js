// backend/middleware/verificarPlanEmpresa.js

export const verificarPlanEmpresa = (req, res, next) => {
    // Si no hay usuario cargado por el middleware de auth → error
    if (!req.user) {
      return res.status(401).json({ mensaje: "No autorizado" });
    }
  
    // Validar plan empresa (ya viene normalizado a minúsculas)
    if (req.user.plan !== "empresa") {
      return res.status(403).json({
        mensaje:
          "Tu plan no te permite acceder a esta función. Necesitas el Plan Empresa.",
      });
    }
  
    next();
  };
  