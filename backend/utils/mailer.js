import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const enviarCodigoActivacion = async (emailDestino, codigo, plan, periodo) => {
  await transporter.sendMail({
    from: `"360 Agro" <${process.env.GMAIL_USER}>`,
    to: emailDestino,
    subject: `Tu código de activación — Plan ${plan.toUpperCase()}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #235347;">360 Agro — Activación de Plan</h2>
        <p>Tu código para activar el plan <strong>${plan.toUpperCase()} (${periodo})</strong> es:</p>
        <div style="background: #f0f7f4; border: 2px solid #235347; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 28px; font-weight: 900; letter-spacing: 6px; color: #235347;">${codigo}</span>
        </div>
        <p style="color: #666; font-size: 13px;">Ingresá este código en la sección <strong>Planes</strong> de 360 Agro para activar tu membresía al instante.</p>
        <p style="color: #999; font-size: 11px;">Si no solicitaste este código, ignorá este mensaje.</p>
      </div>
    `
  });
};
