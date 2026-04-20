import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import servicioApi from "../api/servicioApi";
import { BASE_URL } from "../api/axiosConfig";
import API from "../api/axiosConfig";
import { toast } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { trackEvent } from "../utils/analytics";
import SEO from "../components/SEO";

export default function ServicioDetalle() {
  const { id } = useParams();
  const { usuario } = useContext(AuthContext);
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const usuarioLogueado = !!localStorage.getItem("token");

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
      await servicioApi.registrarClick(id, tipo);
      trackEvent('Servicios', tipo, servicio.nombre);
    } catch (error) {
      console.error("❌ Error métrica:", error);
    }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return toast.error("El mensaje no puede estar vacío");
    if (!servicio.proveedorUsuarioId) return toast.error("No se puede contactar al proveedor");
    try {
      const token = localStorage.getItem("token");
      console.log("Enviando mensaje a:", servicio.proveedorUsuarioId);
      await API.post("/mensajes/enviar", {
        servicioId: servicio._id,
        mensaje,
        receptor: servicio.proveedorUsuarioId,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Mensaje enviado al proveedor");
      setMensaje("");
      setMostrarModal(false);
    } catch (error) {
      toast.error("Error al enviar mensaje");
    }
  };

  useEffect(() => {
    cargarServicio();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary shadow-xl"></div>
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="bg-background min-h-screen pt-40 text-center">
        <h2 className="text-4xl font-black text-on-surface italic mb-10 uppercase tracking-tighter">Perfil fuera de línea</h2>
        <Link to="/servicios" className="text-primary font-black uppercase tracking-widest border-b border-primary/20 pb-2">Regresar al hub de servicios</Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <SEO
        title={servicio ? `${servicio.titulo} — 360 Agro` : "Servicio — 360 Agro"}
        description={servicio?.descripcion?.slice(0, 160) || "Servicio agropecuario en 360 Agro."}
        image={servicio?.foto}
        url={`https://360agro.vercel.app/servicio/${servicio?._id}`}
      />
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[180px] pointer-events-none opacity-40"></div>

      <div className="container mx-auto relative z-10">
        {/* HEADER SERVICIO ÉLITE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20 items-center">
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-8">
              <span className="bg-primary/10 text-primary text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] shadow-inner border border-primary/10">
                {servicio.tipoServicio}
              </span>
              <span className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest italic">Visitas: {servicio.estadisticas?.visitas || 0}</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-on-surface italic tracking-tighter leading-none mb-8 uppercase">
              {servicio.nombre}
            </h1>
            <div className="flex items-center gap-6 text-sm font-black uppercase tracking-[0.2em] text-on-surface-variant/60">
              <span className="flex items-center gap-2 text-primary"><span className="material-symbols-outlined text-sm">location_on</span> {servicio.zona}</span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              <span className="text-on-surface">CERTIFICACIÓN 360 AGRO</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative group">
            <div className="bg-surface-container-high border border-outline-variant/70 p-6 rounded-[3.5rem] shadow-2xl relative overflow-hidden transform group-hover:scale-[1.01] transition-all duration-700">
              <img
                src={servicio.fotos && servicio.fotos.length > 0 ? (/^https?:\/\//.test(servicio.fotos[0]?.trim()) ? servicio.fotos[0].trim() : `${BASE_URL}${servicio.fotos[0]}`) : "/placeholder-servicio.png"}
                className="w-full h-[450px] object-cover rounded-[2.5rem] grayscale-[50%] group-hover:grayscale-0 transition duration-[2s]"
                alt={servicio.nombre}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high/90 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* TEXTO Y GALERÍA */}
          <div className="lg:col-span-8 space-y-16">
            <section className="bg-surface-container-lowest border border-outline-variant/70 rounded-2xl p-6 mb-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full"></div>
              <h2 className="text-3xl font-black text-primary italic tracking-tighter mb-8 uppercase flex items-center gap-4">
                <span className="w-8 h-[1px] bg-primary/30"></span> Alcance Operativo
              </h2>
              <p className="text-on-surface-variant text-xl font-medium leading-relaxed italic border-l-4 border-primary pl-8 group-hover:text-on-surface transition-colors duration-500">
                "{servicio.descripcion || "Sin descripción técnica detallada disponible en el registro Élite."}"
              </p>
            </section>

            {/* GALERÍA DE IMÁGENES EXTRA */}
            {servicio.fotos?.length > 1 && (
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <h3 className="text-2xl font-black text-on-surface italic tracking-tighter uppercase whitespace-nowrap">Evidencia Técnica</h3>
                  <div className="h-[1px] bg-outline-variant/20 flex-1"></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {servicio.fotos.slice(1).map((foto, i) => (
                    <img
                      key={i}
                      src={/^https?:\/\//.test(foto?.trim()) ? foto.trim() : `${BASE_URL}${foto}`}
                      className="w-full h-72 object-cover rounded-[2.5rem] border border-outline-variant/70 shadow-2xl grayscale hover:grayscale-0 transition duration-700 cursor-pointer"
                      alt={`Evidencia ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* PANEL DE CONTACTO */}
          <div className="lg:col-span-4 sticky top-40 space-y-8">
            <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-2xl p-6 mb-6 shadow-2xl">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] border border-primary/10 flex items-center justify-center mx-auto mb-6 shadow-xl text-primary">
                  <span className="material-symbols-outlined text-4xl">bolt</span>
                </div>
                <h3 className="text-3xl font-black text-on-surface italic tracking-tighter uppercase">Enlace Directo</h3>
              </div>

              <div className="space-y-4">
                {servicio.whatsapp && (
                  <a
                    onClick={() => registrarClick("whatsapp")}
                    href={`https://wa.me/${servicio.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, vi tu servicio "${servicio.nombre}" en 360 Agro y me interesa contratarlo. ¿Podemos hablar?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-6 bg-[#25D366]/10 border border-[#25D366]/50 text-[#25D366] rounded-full font-bold text-[11px] flex items-center justify-center gap-4 group uppercase tracking-[0.2em] hover:bg-[#25D366] hover:text-white transition-all shadow-xl italic"
                  >
                    Abrir WhatsApp <span className="transition-transform group-hover:translate-x-1"><span className="material-symbols-outlined text-sm">arrow_forward</span></span>
                  </a>
                )}

                {usuarioLogueado && (
                  <button
                    onClick={() => {
                      setMensaje(`Hola ${servicio.proveedorNombre}, soy ${usuario?.nombre}. Vi tu servicio "${servicio.nombre}" (${servicio.tipoServicio}) en la zona de ${servicio.zona} publicado en 360 Agro y me interesa contratarlo. ¿Podemos hablar?`);
                      setMostrarModal(true);
                    }}
                    className="w-full py-5 bg-surface-container-low text-on-surface border border-outline-variant/60 rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-surface-container-high transition-all flex items-center justify-center gap-3 italic"
                  >
                    <span className="material-symbols-outlined text-lg">mail</span>
                    Enviar mensaje
                  </button>
                )}

                {servicio.telefono && (
                  <a
                    onClick={() => registrarClick("telefono")}
                    href={`tel:${servicio.telefono}`}
                    className="w-full py-6 bg-surface-container-low text-on-surface font-black rounded-full border border-outline-variant/60 hover:bg-surface-container-high transition-all text-[10px] uppercase tracking-widest text-center block italic"
                  >
                    <span className="material-symbols-outlined text-sm">call</span> Llamar ahora
                  </a>
                )}

                {servicio.email && (
                  <a
                    onClick={() => registrarClick("email")}
                    href={`mailto:${servicio.email}`}
                    className="w-full py-6 bg-background text-on-surface-variant font-black rounded-2xl border border-outline-variant/20 hover:text-primary transition-all text-[10px] uppercase tracking-widest text-center block"
                  >
                    <span className="material-symbols-outlined text-sm">mail</span> Enviar correo
                  </a>
                )}
              </div>
            </div>

            {/* CARD DE PROVEEDOR */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/70 text-center shadow-xl">
              <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mb-4">Empresa Responsable</p>
              <p className="text-lg font-black text-on-surface uppercase italic">
                {servicio.proveedorNombre || "Proveedor"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE MENSAJERÍA */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
          <div className="bg-surface-container-highest border border-outline-variant/60 rounded-[3rem] w-full max-w-lg p-10 relative shadow-2xl">
            <button onClick={() => setMostrarModal(false)} className="absolute top-8 right-8 text-on-surface-variant/40 hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-black text-on-surface italic uppercase mb-2 tracking-tighter">Propuesta de Contratación</h2>
            <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mb-8 italic">El mensaje se enviará directamente al proveedor</p>
            <textarea
              className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-3xl p-6 text-on-surface text-sm outline-none focus:border-primary/50 h-40 transition-all shadow-inner leading-relaxed placeholder:text-on-surface-variant/20"
              placeholder="Describa el servicio requerido o solicite una cotización técnica..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
            <button onClick={enviarMensaje} className="machined-gradient w-full mt-8 py-5 text-[11px] font-bold uppercase tracking-widest shadow-xl rounded-full text-on-tertiary-fixed italic">
              ENVIAR MENSAJE <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}