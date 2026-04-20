import Subscripcion from "../models/subscripcionModel.js";
import User from "../models/userModel.js";

// Obtener la solicitud actual del usuario logueado
export const obtenerMiSolicitud = async (req, res) => {
  try {
    const solicitud = await Subscripcion.findOne({ usuario: req.user._id, status: "Pendiente" });
    res.json(solicitud);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener solicitud", error: error.message });
  }
};

// Crear una solicitud de subscripción
export const crearSolicitud = async (req, res) => {
  try {
    const { planSolicitado } = req.body;
    const usuarioId = req.user._id;

    // Verificar si ya tiene una solicitud pendiente
    const existente = await Subscripcion.findOne({ usuario: usuarioId, status: "Pendiente" });
    if (existente) {
      return res.status(400).json({ mensaje: "Ya tienes una solicitud de activación en proceso." });
    }

    const nuevaSolicitud = await Subscripcion.create({
      usuario: usuarioId,
      planSolicitado,
    });

    res.status(201).json(nuevaSolicitud);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear la solicitud", error: error.message });
  }
};

// Aprobar subscripción (Solo Admin - por ahora simulado con una check simple)
export const aprobarSubscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const solicitud = await Subscripcion.findById(id);

    if (!solicitud) return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    if (solicitud.status !== "Pendiente") return res.status(400).json({ mensaje: "Esta solicitud ya fue procesada" });

    // Actualizar status de la solicitud
    solicitud.status = "Aprobado";
    solicitud.fechaAprobacion = Date.now();
    await solicitud.save();

    // Actualizar plan del usuario
    const usuario = await User.findById(solicitud.usuario);
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const meses = { mensual: 1, trimestral: 3, anual: 12 };
    const proxima = new Date();
    proxima.setMonth(proxima.getMonth() + (meses[solicitud.periodo] || 1));

    usuario.plan = solicitud.planSolicitado;
    usuario.fechaInicioPlan = new Date();
    usuario.estadoSuscripcion = "activa";
    usuario.periodoPlan = solicitud.periodo || "mensual";
    usuario.proximaFechaCobro = proxima;
    await usuario.save();

    res.json({ mensaje: "Subscripción aprobada con éxito", plan: solicitud.planSolicitado });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al aprobar la subscripción", error: error.message });
  }
};
