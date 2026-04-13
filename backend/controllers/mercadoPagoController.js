import { MercadoPagoConfig, PreApprovalPlan, PreApproval } from 'mercadopago';
import User from '../models/userModel.js';
import Subscripcion from '../models/subscripcionModel.js';
import { PLANES } from '../config/planes.js';

const getClient = () => new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

export const crearSuscripcion = async (req, res) => {
  try {
    const { planKey, periodo } = req.body;
    const plan = PLANES[planKey];
    if (!plan) return res.status(400).json({ mensaje: "Plan inválido" });

    const montos = {
      mensual: { monto: plan.precio.mensual, frecuencia: 1, tipo: "months" },
      trimestral: { monto: plan.precio.trimestral, frecuencia: 3, tipo: "months" },
      anual: { monto: plan.precio.anual, frecuencia: 12, tipo: "months" }
    };

    const config = montos[periodo] || montos.mensual;
    const montoUYU = config.monto * 40;

    const preApprovalPlan = new PreApprovalPlan(getClient());
    const planCreado = await preApprovalPlan.create({
      body: {
        reason: `360 Agro - Plan ${plan.nombre} USD ${config.monto}/mes`,
        auto_recurring: {
          frequency: config.frecuencia,
          frequency_type: config.tipo,
          transaction_amount: montoUYU,
          currency_id: "UYU"
        },
        back_url: process.env.FRONTEND_URL || "http://localhost:5173/planes",
        status: "active"
      }
    });

    await Subscripcion.findOneAndUpdate(
      { usuario: req.user._id, status: "Pendiente" },
      {
        usuario: req.user._id,
        planSolicitado: planKey,
        status: "Pendiente"
      },
      { upsert: true }
    );

    res.status(200).json({
      init_point: planCreado.init_point,
      planId: planCreado.id
    });
  } catch (error) {
    console.error("Error MP:", error);
    res.status(500).json({ mensaje: "Error al crear suscripción", error: error.message });
  }
};

export const webhook = async (req, res) => {
  try {
    const { type, data } = req.body;
    if (type !== "subscription_preapproval") return res.sendStatus(200);

    const preApproval = new PreApproval(getClient());
    const suscripcion = await preApproval.get({ id: data.id });

    const usuario = await User.findOne({
      suscripcionId: suscripcion.preapproval_plan_id
    }) || await Subscripcion.findOne({
      status: "Pendiente"
    }).populate("usuario").then(s => s?.usuario);

    if (!usuario) return res.sendStatus(200);

    if (suscripcion.status === "authorized") {
      usuario.plan = suscripcion.reason.includes("productor") ? "productor"
        : suscripcion.reason.includes("Pro") ? "pro"
        : suscripcion.reason.includes("Empresa") ? "empresa" : "observador";
      usuario.suscripcionId = data.id;
      usuario.estadoSuscripcion = "activa";
      usuario.proximaFechaCobro = new Date(suscripcion.next_payment_date);
      await usuario.save();

      await Subscripcion.findOneAndUpdate(
        { usuario: usuario._id, status: "Pendiente" },
        { status: "Aprobado", fechaAprobacion: Date.now() }
      );
    }

    if (suscripcion.status === "cancelled") {
      usuario.plan = "observador";
      usuario.estadoSuscripcion = "cancelada";
      await usuario.save();
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error webhook MP:", error);
    res.sendStatus(500);
  }
};

// Alias para compatibilidad si algo aún referencia los nombres viejos
export const crearSuscripcionSimulada = crearSuscripcion;
export const webhookSimulado = webhook;
