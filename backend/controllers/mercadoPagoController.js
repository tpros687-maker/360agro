import crypto from "crypto";
import { MercadoPagoConfig, PreApprovalPlan, PreApproval, Payment } from 'mercadopago';
import User from '../models/userModel.js';
import Subscripcion from '../models/subscripcionModel.js';
import { PLANES } from '../config/planes.js';

const getClient = () => new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// Valida la firma x-signature enviada por MercadoPago en cada webhook
const validarFirmaMP = (req) => {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sin secret configurado: omitir en dev
  const xSignature = req.headers["x-signature"];
  const xRequestId = req.headers["x-request-id"];
  const dataId = req.query["data.id"];
  if (!xSignature || !dataId) return false;
  let ts, v1;
  xSignature.split(",").forEach(part => {
    const [k, val] = part.split("=");
    if (k === "ts") ts = val;
    if (k === "v1") v1 = val;
  });
  if (!ts || !v1) return false;
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  return v1 === expected;
};

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
    // 1. Validar firma de MercadoPago
    if (!validarFirmaMP(req)) {
      console.warn("⚠️ Webhook MP rechazado: firma inválida");
      return res.sendStatus(401);
    }

    const { type, data } = req.body;

    // 2. Manejar evento de pago único
    if (type === "payment") {
      let pago;
      try {
        const paymentClient = new Payment(getClient());
        pago = await paymentClient.get({ id: data.id });
      } catch (err) {
        const status = err?.status || err?.cause?.[0]?.code;
        if (status === 404 || String(err?.message).includes("not found")) {
          return res.sendStatus(200);
        }
        throw err; // cualquier otro error sube al catch principal
      }

      if (pago.status !== "approved") return res.sendStatus(200);

      const usuario = await User.findOne({ email: pago.payer.email });
      if (!usuario) return res.sendStatus(200);

      const sub = await Subscripcion.findOne({ usuario: usuario._id, status: "Pendiente" });
      if (!sub) return res.sendStatus(200);

      usuario.plan = sub.planSolicitado;
      usuario.estadoSuscripcion = "activa";
      usuario.suscripcionId = String(data.id);
      await usuario.save();
      await sub.updateOne({ status: "Aprobado", fechaAprobacion: Date.now() });

      console.log(`✅ Pago aprobado: ${usuario.email} → plan ${usuario.plan}`);
      return res.sendStatus(200);
    }

    // 3. Solo procesar eventos de suscripción
    if (type !== "subscription_preapproval") return res.sendStatus(200);

    const preApproval = new PreApproval(getClient());
    let suscripcion;
    try {
      suscripcion = await preApproval.get({ id: data.id });
    } catch (err) {
      const status = err?.status || err?.cause?.[0]?.code;
      const msg = String(err?.message).toLowerCase();
      if ([400, 404].includes(status) || msg.includes("not found") || msg.includes("bad request")) {
        return res.sendStatus(200);
      }
      throw err;
    }

    // 4. Buscar usuario por email del pagador, con fallback por suscripcionId
    const usuario = await User.findOne({ email: suscripcion.payer_email })
      || await User.findOne({ suscripcionId: data.id });

    if (!usuario) {
      console.warn(`⚠️ Webhook MP: usuario no encontrado para ${suscripcion.payer_email}`);
      return res.sendStatus(200);
    }

    // 5. Activar suscripción
    if (suscripcion.status === "authorized") {
      const sub = await Subscripcion.findOne({ usuario: usuario._id, status: "Pendiente" });
      const planKey = sub?.planSolicitado || "observador";

      usuario.plan = planKey;
      usuario.suscripcionId = data.id;
      usuario.estadoSuscripcion = "activa";
      usuario.proximaFechaCobro = new Date(suscripcion.next_payment_date);
      await usuario.save();

      if (sub) await sub.updateOne({ status: "Aprobado", fechaAprobacion: Date.now() });
      console.log(`✅ Suscripción autorizada: ${usuario.email} → plan ${planKey}`);
    }

    // 6. Cancelar suscripción
    if (suscripcion.status === "cancelled") {
      usuario.plan = "observador";
      usuario.estadoSuscripcion = "cancelada";
      await usuario.save();
      console.log(`❌ Suscripción cancelada: ${usuario.email}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error webhook MP:", error);
    res.sendStatus(500);
  }
};

export const cancelarSuscripcion = async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id);
    if (!usuario?.suscripcionId) {
      return res.status(400).json({ mensaje: "No tenés una suscripción activa" });
    }

    const preApproval = new PreApproval(getClient());
    await preApproval.update({
      id: usuario.suscripcionId,
      body: { status: "cancelled" }
    });

    // Marcar como cancelada pero NO bajar el plan — el webhook lo hará al vencer el período
    usuario.estadoSuscripcion = "cancelada";
    await usuario.save();

    console.log(`🚫 Suscripción cancelada por usuario: ${usuario.email}`);
    res.json({
      mensaje: "Suscripción cancelada. Tu plan permanece activo hasta el fin del período pagado.",
      proximaFechaCobro: usuario.proximaFechaCobro
    });
  } catch (error) {
    console.error("Error cancelando suscripción:", error);
    res.status(500).json({ mensaje: "Error al cancelar suscripción", error: error.message });
  }
};

// Alias para compatibilidad si algo aún referencia los nombres viejos
export const crearSuscripcionSimulada = crearSuscripcion;
export const webhookSimulado = webhook;
