import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const proteger = async (req, res, next) => {
  let token;

  // 1. Verificar si existe el header y empieza con Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // 2. Extraer el token
      token = req.headers.authorization.split(" ")[1];

      // 3. Decodificar y verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Buscar el usuario y adjuntarlo a la petición (excluyendo el password)
      // Usamos .lean() para que la consulta sea más rápida si solo vamos a leer datos
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ mensaje: "Usuario no encontrado, acceso denegado" });
      }

      if (decoded.tokenVersion !== req.user.tokenVersion) {
        return res.status(401).json({ mensaje: "Sesión inválida, iniciá sesión de nuevo" });
      }

      // 5. Normalizar el plan (con verificación de existencia para evitar errores)
      if (req.user.plan) {
        req.user.plan = req.user.plan.toLowerCase();
      } else {
        req.user.plan = "gratis"; // Plan por defecto si no tiene uno
      }

      // Continuar al siguiente controlador o middleware
      next();
    } catch (error) {
      console.error("❌ Error en Auth Middleware:");
      console.error("Mensaje:", error.message);

      // Si es un error de conectividad de Mongoose
      if (error.name === "MongooseServerSelectionError" || error.message.includes("buffering timed out")) {
        return res.status(503).json({
          mensaje: "Servicio temporalmente no disponible (Fallo de conexión a BD)",
          detalles: "Por favor verifica la IP Whitelist en MongoDB Atlas"
        });
      }

      // Diferenciar errores para ayudar al frontend
      const mensaje = error.name === "TokenExpiredError"
        ? "Sesión expirada, por favor inicia sesión de nuevo"
        : "Token inválido o corrupto";

      return res.status(401).json({ mensaje });
    }
  }

  if (!token) {
    return res.status(401).json({ mensaje: "No autorizado, no se proporcionó un token" });
  }
};

export default proteger;