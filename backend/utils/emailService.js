export const enviarEmailVerificacion = async (email, nombre, codigo) => {
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: '360 Agro — Verificá tu cuenta',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #051F20; padding: 40px; border-radius: 16px;">
        <h1 style="color: #DBF0DD; font-size: 32px; margin-bottom: 8px;">360 AGRO</h1>
        <p style="color: #8CB79B; font-size: 12px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 40px;">Verificación de cuenta</p>
        <p style="color: #DBF0DD; font-size: 16px;">Hola ${nombre},</p>
        <p style="color: #8CB79B; font-size: 14px;">Tu código de verificación es:</p>
        <div style="background: #173831; border: 1px solid #235347; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="color: #DBF0DD; font-size: 48px; font-weight: 900; letter-spacing: 16px;">${codigo}</span>
        </div>
        <p style="color: #8CB79B; font-size: 12px;">Este código expira en 15 minutos.</p>
        <p style="color: #235347; font-size: 11px; margin-top: 40px;">360 Agro — Ecosistema Digital del Campo Uruguayo</p>
      </div>
    `
  });
};
