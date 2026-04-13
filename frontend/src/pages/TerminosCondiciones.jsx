export default function TerminosCondiciones() {
  const secciones = [
    {
      numero: "01",
      titulo: "Aceptación de los Términos",
      contenido: `Al acceder y utilizar la plataforma 360 Agro, el usuario acepta en su totalidad los presentes Términos y Condiciones. Si no está de acuerdo con alguna de las condiciones aquí establecidas, deberá abstenerse de utilizar la plataforma. El uso continuado del servicio constituye aceptación plena de estos términos y de cualquier modificación futura debidamente comunicada.`,
    },
    {
      numero: "02",
      titulo: "Descripción del Servicio",
      contenido: `360 Agro es una plataforma digital de mercado agropecuario orientada a productores, proveedores y comerciantes del sector rural de Uruguay. Los servicios incluyen la publicación y consulta de lotes de ganado, insumos, maquinaria y servicios rurales; herramientas de gestión financiera (AgroLedger); asistencia mediante inteligencia artificial (AgroIA); y funcionalidades de comunicación entre usuarios. La plataforma actúa como intermediaria y no es parte en las transacciones entre usuarios.`,
    },
    {
      numero: "03",
      titulo: "Registro y Cuenta de Usuario",
      contenido: `Para acceder a las funcionalidades completas de 360 Agro, el usuario debe registrarse proporcionando información veraz, completa y actualizada. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades realizadas bajo su cuenta. 360 Agro se reserva el derecho de suspender o eliminar cuentas que infrinjan estos términos, que contengan información falsa, o que realicen actividades fraudulentas o contrarias a la buena fe comercial.`,
    },
    {
      numero: "04",
      titulo: "Planes y Pagos",
      contenido: `360 Agro ofrece distintos planes de membresía con diferentes niveles de acceso y funcionalidades. Los precios están expresados en dólares estadounidenses (USD) y son mensuales salvo indicación contraria. Los pagos se procesan a través de MercadoPago, sujeto a sus propios términos y condiciones. 360 Agro no almacena datos de tarjetas de crédito. Los planes de pago no incluyen reembolsos automáticos salvo error imputable directamente a la plataforma, evaluado caso a caso. La plataforma podrá modificar los precios notificando con al menos 30 días de anticipación.`,
    },
    {
      numero: "05",
      titulo: "Contenido del Usuario",
      contenido: `El usuario es exclusivo responsable del contenido que publica en la plataforma, incluyendo fotografías, descripciones, precios y documentación. El contenido publicado debe ser veraz, no engañoso y no violar derechos de terceros. 360 Agro se reserva el derecho de eliminar sin previo aviso cualquier publicación que infrinja estos términos, la legislación uruguaya vigente, o que sea reportada como fraudulenta. Al publicar contenido, el usuario otorga a 360 Agro una licencia no exclusiva para mostrarlo dentro de la plataforma.`,
    },
    {
      numero: "06",
      titulo: "Limitación de Responsabilidad",
      contenido: `360 Agro no garantiza la exactitud, integridad o vigencia de la información publicada por los usuarios. La plataforma no es responsable por daños directos, indirectos o consecuentes derivados del uso o la imposibilidad de uso del servicio, de transacciones entre usuarios, ni de la veracidad del contenido publicado. El servicio se ofrece "tal cual está" y "según disponibilidad". 360 Agro no será responsable por interrupciones del servicio por causas de fuerza mayor, mantenimiento programado o fallas de terceros proveedores de infraestructura.`,
    },
    {
      numero: "07",
      titulo: "Contacto",
      contenido: `Para consultas, reclamos o cualquier comunicación relacionada con estos Términos y Condiciones, puede contactarse a través del correo electrónico: contacto@360agro.com. 360 Agro está radicada en la República Oriental del Uruguay. Toda controversia derivada del uso de la plataforma se someterá a la jurisdicción de los tribunales competentes de Uruguay, aplicándose la legislación uruguaya vigente.`,
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
            TÉRMINOS Y<br /><span className="text-primary not-italic">CONDICIONES</span>
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
