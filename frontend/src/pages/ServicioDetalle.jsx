import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import servicioApi from "../api/servicioApi";
import { BASE_URL } from "../api/axiosConfig"; // Importamos la config centralizada
import { toast } from "react-hot-toast";

export default function ServicioDetalle() {
  const { id } = useParams();
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);

  const cargarServicio = async () => {
    try {
      const resp = await servicioApi.obtenerServicio(id);
      setServicio(resp.data || null);
    } catch (error) {
      console.error("❌ Error cargando servicio:", error);
      toast.error("No se pudo sincronizar el perfil técnico");
    } finally {
      setLoading(false);
    }
  };

  const registrarClick = async (tipo) => {
    try {
      // Sincronizado con router.put("/:id/click/:tipo", ...)
      await servicioApi.registrarClick(id, tipo);
    } catch (error) {
      console.error("❌ Error métrica:", error);
    }
  };

  useEffect(() => {
    cargarServicio();
    window.scrollTo(0, 0); // Reset de scroll al entrar
  }, [id]);

  if (loading) {
    return (
      <div className="bg-agro-midnight min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-agro-teal shadow-teal-glow"></div>
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="bg-agro-midnight min-h-screen pt-40 text-center">
        <h2 className="text-4xl font-black text-white italic mb-10 uppercase tracking-tighter">Perfil fuera de línea</h2>
        <Link to="/servicios" className="text-agro-teal font-black uppercase tracking-widest border-b border-agro-teal/20 pb-2">Regresar al hub de servicios</Link>
      </div>
    );
  }

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-agro-teal/5 rounded-full blur-[180px] pointer-events-none opacity-40"></div>

      <div className="container mx-auto relative z-10">
        {/* HEADER SERVICIO ÉLITE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20 items-center">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-8">
                <span className="bg-agro-teal/10 text-agro-teal text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] shadow-inner border border-agro-teal/10">
                {servicio.tipoServicio}
                </span>
                <span className="text-agro-cream/20 text-[10px] font-black uppercase tracking-widest italic">Visitas: {servicio.estadisticas?.visitas || 0}</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-none mb-8">
              {servicio.nombre.toUpperCase()}
            </h1>
            <div className="flex items-center gap-6 text-sm font-black uppercase tracking-[0.2em] text-agro-cream/30">
              <span className="flex items-center gap-2 text-agro-teal">📍 {servicio.zona}</span>
              <span className="w-1.5 h-1.5 bg-agro-teal rounded-full shadow-teal-glow"></span>
              <span className="text-white">CERTIFICACIÓN 360 AGRO</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative group">
            <div className="bg-agro-charcoal border border-white/5 p-6 rounded-[3.5rem] shadow-2xl relative overflow-hidden transform group-hover:scale-[1.01] transition-all duration-700">
              <img
                src={servicio.fotos?.[0] ? `${BASE_URL}${servicio.fotos[0]}` : "/placeholder-servicio.png"}
                className="w-full h-[450px] object-cover rounded-[2.5rem] grayscale-[50%] group-hover:grayscale-0 transition duration-[2s]"
                alt={servicio.nombre}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-agro-midnight/90 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* TEXTO Y GALERÍA */}
          <div className="lg:col-span-8 space-y-16">
            <section className="bg-agro-charcoal/40 border border-white/5 p-12 rounded-[3.5rem] shadow-2xl">
              <h2 className="text-3xl font-black text-white italic tracking-tighter mb-8 uppercase text-agro-teal">Alcance Operativo</h2>
              <p className="text-agro-cream/40 text-xl font-medium leading-relaxed italic border-l-4 border-agro-teal pl-8">
                "{servicio.descripcion}"
              </p>
            </section>

            {servicio.fotos?.length > 1 && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Evidencia Técnica</h3>
                  <div className="h-[1px] bg-white/5 flex-1"></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {servicio.fotos.slice(1).map((foto, i) => (
                    <img
                      key={i}
                      src={`${BASE_URL}${foto}`}
                      className="w-full h-72 object-cover rounded-[2.5rem] border border-white/5 shadow-2xl grayscale hover:grayscale-0 transition duration-700 cursor-pointer"
                      alt="asset técnico"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PANEL DE CONTACTO NOIR */}
          <div className="lg:col-span-4 sticky top-40 space-y-8">
            <div className="bg-agro-charcoal border border-agro-teal/20 p-12 rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-agro-teal/10 rounded-[2rem] border border-agro-teal/10 flex items-center justify-center text-4xl mx-auto mb-6 shadow-teal-glow">⚡</div>
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Enlace Directo</h3>
              </div>

              <div className="space-y-4">
                {servicio.whatsapp && (
                  <a
                    onClick={() => registrarClick("whatsapp")}
                    href={`https://wa.me/${servicio.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-emerald w-full py-6 text-[10px] flex items-center justify-center gap-4 group uppercase tracking-[0.2em]"
                  >
                    Abrir WhatsApp <span className="transition-transform group-hover:translate-x-1">→</span>
                  </a>
                )}

                {servicio.telefono && (
                  <a
                    onClick={() => registrarClick("telefono")}
                    href={`tel:${servicio.telefono}`}
                    className="w-full py-6 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-[10px] uppercase tracking-widest text-center block"
                  >
                    📞 Llamar ahora
                  </a>
                )}

                {servicio.email && (
                  <a
                    onClick={() => registrarClick("email")}
                    href={`mailto:${servicio.email}`}
                    className="w-full py-6 bg-agro-midnight text-agro-cream/30 font-black rounded-2xl border border-white/5 hover:text-white transition-all text-[10px] uppercase tracking-widest text-center block"
                  >
                    ✉️ Enviar correo
                  </a>
                )}
              </div>
            </div>

            {/* CARD DE PROVEEDOR (Vínculo al Showroom) */}
            <div className="bg-agro-midnight p-8 rounded-[2.5rem] border border-white/5 text-center">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Empresa Responsable</p>
                <Link to={`/tienda/${servicio.proveedorSlug}`} className="text-lg font-black text-white uppercase italic hover:text-agro-teal transition-colors">
                    {servicio.proveedorNombre} ➔
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}