import crypto from "crypto";
import { MercadoPagoConfig, Preference, PreApproval, Payment } from 'mercadopago';
import User from '../models/userModel.js';
import Subscripcion from '../models/subscripcionModel.js';
import { PLANES } from '../config/planes.js';

const getClient = () => new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// Valida la firma x-signature enviada por MercadoPago en cada webhook
const validarFirmaMP = (req) => {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;

  // Si es notificación de prueba de MP, dejar pasar
  if (req.body?.live_mode === false) return true;

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
      mensual: plan.precio.mensual,
      trimestral: plan.precio.trimestral,
      anual: plan.precio.anual
    };
    const montoUSD = montos[periodo] || montos.mensual;
    const montoUYU = 20; // TEMPORAL - volver a Math.max(20, Math.round(montoUSD * 40)) después de probar

    const client = getClient();
    const preference = new Preference(client);

    const resultado = await preference.create({
      body: {
        items: [{
          title: `360 Agro - Plan ${plan.nombre} (${periodo})`,
          quantity: 1,
          unit_price: montoUYU,
          currency_id: "UYU"
        }],
        payer: { email: req.user.email },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/planes?pago=ok`,
          failure: `${process.env.FRONTEND_URL}/planes?pago=error`,
          pending: `${process.env.FRONTEND_URL}/planes?pago=pendiente`
        },
        auto_return: "approved",
        external_reference: req.user._id.toString(),
        metadata: { user_id: req.user._id.toString(), planKey, periodo }
      }
    });

    await Subscripcion.findOneAndUpdate(
      { usuario: req.user._id, status: "Pendiente" },
      { usuario: req.user._id, planSolicitado: planKey, periodo, status: "Pendiente" },
      { upsert: true }
    );

    res.status(200).json({ init_point: resultado.init_point });
  } catch (error) {
    console.error("Error MP:", error);
    res.status(500).json({ mensaje: "Error al crear suscripción", error: error.message });
  }
};

export const webhook = async (req, res) => {
  try {
    console.log("📩 Webhook recibido:", JSON.stringify(req.body));
    console.log("📩 Query params:", JSON.stringify(req.query));

    // 1. Validar firma de MercadoPago
    if (!validarFirmaMP(req)) {
      console.warn("⚠️ Webhook MP rechazado: firma inválida");
      return res.sendStatus(401);
    }

    const { type, data } = req.body;
    console.log("📩 Tipo:", type, "| Data ID:", data?.id);

    // 2. Manejar evento de pago único
    if (type === "payment") {
      let pago;
      try {
        console.log("🔍 Buscando pago ID:", data.id);
        const paymentClient = new Payment(getClient());
        pago = await paymentClient.get({ id: data.id });
        console.log("💳 Pago encontrado, status:", pago.status);
      } catch (err) {
        console.error("❌ Error buscando pago:", err?.message, "Status:", err?.status);
        const status = err?.status || err?.cause?.[0]?.code;
        if (status === 404 || String(err?.message).includes("not found")) {
          console.log("⚠️ Pago no encontrado, ignorando");
          return res.sendStatus(200);
        }
        throw err;
      }

      if (pago.status !== "approved") {
        console.log("⚠️ Pago no aprobado, status:", pago.status);
        return res.sendStatus(200);
      }

      console.log("✅ Pago aprobado, buscando usuario por email:", pago.payer.email);
      const userId = pago.metadata?.user_id || pago.metadata?.userId;
      console.log("🔑 userId desde metadata:", userId);
      let usuario = userId
        ? await User.findById(userId)
        : await User.findOne({ email: pago.payer.email });
      console.log("👤 Usuario encontrado:", usuario ? usuario.email : "NO ENCONTRADO");

      if (!usuario) return res.sendStatus(200);

      const sub = await Subscripcion.findOne({ usuario: usuario._id, status: "Pendiente" });
      console.log("📋 Subscripción pendiente:", sub ? sub.planSolicitado : "NO ENCONTRADA");

      if (!sub) return res.sendStatus(200);

      usuario.plan = sub.planSolicitado;
      usuario.estadoSuscripcion = "activa";
      usuario.suscripcionId = String(data.id);
      usuario.fechaInicioPlan = new Date();
      usuario.periodoPlan = sub?.periodo || "mensual";
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
      usuario.fechaInicioPlan = new Date();
      usuario.periodoPlan = sub?.periodo || "mensual";
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
    if (!usuario || usuario.plan === "observador") {
      return res.status(400).json({ mensaje: "No tenés una suscripción activa" });
    }

    if (usuario.suscripcionId) {
      const preApproval = new PreApproval(getClient());
      await preApproval.update({
        id: usuario.suscripcionId,
        body: { status: "cancelled" }
      });

      usuario.estadoSuscripcion = "cancelada";
      await usuario.save();

      console.log(`🚫 Suscripción cancelada por usuario (MP): ${usuario.email}`);
      return res.json({
        mensaje: "Suscripción cancelada. Tu plan permanece activo hasta el fin del período pagado.",
        proximaFechaCobro: usuario.proximaFechaCobro
      });
    }

    // Sin suscripcionId de MP: solo actualizar DB
    usuario.estadoSuscripcion = "cancelada";
    await usuario.save();

    console.log(`🚫 Suscripción cancelada por usuario (manual): ${usuario.email}`);
    res.json({
      mensaje: "Suscripción cancelada.",
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
