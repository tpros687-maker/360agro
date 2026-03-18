import Plan from "../models/planModel.js";
import User from "../models/userModel.js";

// Obtener todos los planes
export const obtenerPlanes = async (req, res) => {
  try {
    const planes = await Plan.find();
    res.json(planes);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener los planes" });
  }
};

// Asignar plan a un usuario
export const asignarPlan = async (req, res) => {
  try {
    const { planId, userId } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ mensaje: "Plan no encontrado" });

    const usuario = await User.findById(userId);
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    usuario.plan = plan.nombre;
    await usuario.save();

    res.json({ mensaje: `Plan ${plan.nombre} asignado a ${usuario.nombre}` });
} catch (error) {
    console.error("❌ Error detallado:", error);
    res.status(500).json({ mensaje: "Error al asignar plan", error: error.message });
  } 
};
