export default function PoliticaPrivacidad() {
  const secciones = [
    {
      numero: "01",
      titulo: "Datos que Recolectamos",
      contenido: `Al registrarse y utilizar 360 Agro, recopilamos los siguientes datos personales: nombre completo, dirección de correo electrónico, número de teléfono (opcional), ubicación geográfica declarada, fotografía de perfil (opcional), y datos de actividad dentro de la plataforma como publicaciones, mensajes e interacciones. En el caso de productores que publican lotes, también podemos recopilar información sobre el ganado, campos y documentación adjunta. No recopilamos datos de menores de 18 años de manera intencional.`,
    },
    {
      numero: "02",
      titulo: "Cómo Usamos sus Datos",
      contenido: `Los datos recopilados se utilizan exclusivamente para: proveer y mejorar los servicios de la plataforma, gestionar su cuenta y autenticar su identidad, facilitar la comunicación entre usuarios compradores y vendedores, personalizar la experiencia de navegación y las recomendaciones de AgroIA, enviar notificaciones relevantes relacionadas con su actividad, y cumplir con obligaciones legales aplicables en Uruguay. No vendemos ni cedemos datos personales a terceros con fines comerciales ajenos a la plataforma.`,
    },
    {
      numero: "03",
      titulo: "Almacenamiento y Seguridad",
      contenido: `Los datos se almacenan en servidores con acceso restringido y cifrado. Utilizamos tokens JWT para la autenticación y bcrypt para el almacenamiento seguro de contraseñas. Los pagos son procesados por MercadoPago, plataforma que cuenta con sus propios estándares de seguridad PCI-DSS. 360 Agro no almacena datos de tarjetas de crédito ni información bancaria. A pesar de las medidas implementadas, ningún sistema de transmisión por internet es 100% seguro, por lo que no podemos garantizar seguridad absoluta.`,
    },
    {
      numero: "04",
      titulo: "Cookies y Almacenamiento Local",
      contenido: `360 Agro utiliza localStorage del navegador para mantener la sesión activa del usuario y almacenar preferencias de navegación. No utilizamos cookies de rastreo de terceros con fines publicitarios. Podemos utilizar cookies técnicas esenciales para el funcionamiento del servicio. Al continuar usando la plataforma, el usuario acepta el uso de estos mecanismos de almacenamiento local. El usuario puede limpiar el almacenamiento local desde la configuración de su navegador en cualquier momento, lo que implicará el cierre de sesión.`,
    },
    {
      numero: "05",
      titulo: "Derechos del Usuario",
      contenido: `De conformidad con la Ley N° 18.331 de Protección de Datos Personales de Uruguay, el usuario tiene derecho a: acceder a sus datos personales almacenados en la plataforma, solicitar la rectificación de datos inexactos o incompletos, solicitar la eliminación de su cuenta y datos asociados, oponerse al tratamiento de sus datos en determinadas circunstancias, y retirar el consentimiento otorgado en cualquier momento. Para ejercer estos derechos, el usuario debe contactar a 360 Agro a través del correo indicado en la sección de contacto. Las solicitudes serán atendidas en un plazo máximo de 30 días hábiles.`,
    },
    {
      numero: "06",
      titulo: "Contacto",
      contenido: `Para consultas, reclamos o solicitudes relacionadas con el tratamiento de sus datos personales, puede comunicarse con nosotros a través del correo electrónico: contacto@360agro.com. 360 Agro opera bajo la legislación de la República Oriental del Uruguay. Esta Política de Privacidad puede ser actualizada periódicamente; los cambios sustanciales serán notificados a los usuarios registrados mediante correo electrónico o aviso en la plataforma.`,
    },
  ];

  return (
    <div className="bg-background min-h-screen pt-32 pb-32 px-6">
      <div className="container mx-auto max-w-4xl">

        <header className="mb-24">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-1 machined-gradient"></div>
            <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em] italic">Marco Legal</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-on-surface italic tracking-tighter uppercase leading-none mb-6">
            POLÍTICA DE<br /><span className="text-primary not-italic">PRIVACIDAD</span>
          </h1>
          <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest border-t border-outline-variant/10 pt-6 mt-6">
            Última actualización: Abril 2026 — República Oriental del Uruguay
          </p>
        </header>

        <div className="space-y-12">
          {secciones.map((s) => (
            <section
              key={s.numero}
              className="bg-surface-container-high border border-outline-variant/10 rounded-[2.5rem] p-10 md:p-14"
            >
              <div className="flex items-start gap-8 mb-6">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic opacity-60 mt-1 shrink-0">
                  {s.numero}
                </span>
                <h2 className="text-xl md:text-2xl font-black text-on-surface italic tracking-tighter uppercase">
                  {s.titulo}
                </h2>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed font-light border-l-2 border-primary/20 pl-6 ml-14">
                {s.contenido}
              </p>
            </section>
          ))}
        </div>

        <footer className="mt-24 text-center">
          <p className="text-[10px] font-black text-on-surface-variant/20 uppercase tracking-[1em] italic">
            360 Agro — Uruguay — contacto@360agro.com
          </p>
        </footer>

      </div>
    </div>
  );
}
