import User from "../models/userModel.js";
import Plan from "../models/planModel.js";

/**
 * Obtener todos los planes disponibles
 */
export const obtenerPlanes = async (req, res) => {
  try {
    const planes = await Plan.find();
    res.status(200).json(planes);
  } catch (error) {
    console.error("❌ Error al obtener planes:", error);
    res.status(500).json({ mensaje: "Error al obtener los planes" });
  }
};

/**
 * Asignar o cambiar plan del usuario autenticado
 */
export const cambiarPlan = async (req, res) => {
  try {
    const { planId } = req.body;

    // Validar que se haya enviado un ID de plan
    if (!planId) {
      return res.status(400).json({ mensaje: "Debe indicar el ID del plan" });
    }

    // Buscar el plan en la base de datos
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ mensaje: "Plan no encontrado" });
    }

    // Actualizar el usuario con el nuevo plan
    const usuario = await User.findById(req.user._id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    usuario.plan = plan.nombre;
    await usuario.save();

    res.status(200).json({
      mensaje: `Plan actualizado correctamente a: ${plan.nombre}`,
      plan: plan.nombre,
    });
  } catch (error) {
    console.error("❌ Error al cambiar plan:", error);
    res.status(500).json({ mensaje: "Error al cambiar plan" });
  }
};

/**
 * Consultar plan actual del usuario
 */
export const obtenerMiPlan = async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id).select("nombre email plan");
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.status(200).json({
      nombre: usuario.nombre,
      email: usuario.email,
      planActual: usuario.plan,
    });
  } catch (error) {
    console.error("❌ Error al obtener plan:", error);
    res.status(500).json({ mensaje: "Error al obtener plan del usuario" });
  }
};
