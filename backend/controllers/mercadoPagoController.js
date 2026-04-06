import User from "../models/userModel.js";
import Subscripcion from "../models/subscripcionModel.js";

/**
 * 🚀 SIMULADOR DE MERCADO PAGO PARA SUSCRIPCIONES
 * Este controlador emite las señales que en producción vendrían de MP.
 */

// 1. Crear la intención de suscripción (Preferencia)
export const crearSuscripcionSimulada = async (req, res) => {
    try {
        const { planKey } = req.body;
        const usuarioId = req.user._id;

        // Generamos un ID de suscripción ficticio
        const subId = `SUB-SIM-${Math.floor(Math.random() * 1000000)}`;

        res.status(200).json({
            mensaje: "Preferencia de pago generada",
            suscripcionId: subId,
            monto: planKey === "pro" ? 49 : 19,
            sandbox_init_point: "#" // En real aquí iría la URL de MP
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al generar pago", error: error.message });
    }
};

// 2. Webhook Simulado (La "Campana Digital" que activa el plan)
export const webhookSimulado = async (req, res) => {
    try {
        const { suscripcionId, usuarioId, planKey, status } = req.body;

        if (status !== "approved") {
            return res.status(400).json({ mensaje: "Pago no aprobado" });
        }

        const usuario = await User.findById(usuarioId);
        if (!usuario) return res.status(404).json({ mensaje: "Usuario no hallado" });

        // CALCULAR FECHA DE PRÓXIMO COBRO (Hoy + 30 días)
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 30);

        // ACTIVACIÓN AUTOMÁTICA
        usuario.plan = planKey;
        usuario.suscripcionId = suscripcionId;
        usuario.proximaFechaCobro = fecha;
        usuario.estadoSuscripcion = "activa";

        await usuario.save();

        // También registramos/actualizamos en el modelo de subscripciones para historial
        await Subscripcion.findOneAndUpdate(
            { usuario: usuarioId, planSolicitado: planKey, status: "Pendiente" },
            { status: "Aprobado", fechaAprobacion: Date.now() },
            { upsert: true }
        );

        console.log(`✅ [AUTOMATION] Plan ${planKey.toUpperCase()} activado para ${usuario.nombre}`);

        res.status(200).json({
            mensaje: "¡Suscripción Activada!",
            plan: usuario.plan,
            proximoCobro: usuario.proximaFechaCobro
        });
    } catch (error) {
        console.error("❌ Error en Webhook:", error);
        res.status(500).json({ mensaje: "Error en la activación automática" });
    }
};
