import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/userApi";
import { BASE_URL } from "../api/axiosConfig"; // Importación centralizada
import { toast } from "react-hot-toast";

export default function LoteDetalle() {
  const { id } = useParams();
  const [lote, setLote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [fotoPrincipal, setFotoPrincipal] = useState(null);

  const usuarioLogueado = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchLote = async () => {
      try {
        const { data } = await API.get(`/lots/${id}`);
        setLote(data);
        if (data.fotos && data.fotos.length > 0) {
          setFotoPrincipal(data.fotos[0]);
        }
        window.scrollTo(0, 0); // Reset de posición al cargar
      } catch (error) {
        console.error("❌ Error al obtener el lote:", error);
        toast.error("No se pudo sincronizar el lote seleccionado");
      } finally {
        setLoading(false);
      }
    };
    fetchLote();
  }, [id]);

  const handleContactarWhatsapp = async () => {
    try {
      await API.patch(`/lots/${id}/interaccion`, { tipo: 'whatsapp' });

      const nroSaneado = lote.usuario?.telefono?.replace(/\D/g, '') || "";
      const texto = encodeURIComponent(`Hola ${lote.usuario?.nombre}, vi tu lote "${lote.titulo}" en 360 Agro y me interesa negociar.`);
      window.open(`https://wa.me/${nroSaneado}?text=${texto}`, '_blank');
    } catch (error) {
      console.error("Error al registrar métrica:", error);
    }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return toast.error("El mensaje no puede estar vacío");

    try {
      const token = localStorage.getItem("token");
      await API.post(
        "/mensajes/enviar",
        {
          loteId: lote._id,
          mensaje,
          receptor: lote.usuario._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Propuesta enviada al productor");
      setMensaje("");
      setMostrarModal(false);
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Fallo en el sistema de mensajería");
    }
  };

  if (loading) return (
    <div className="bg-background min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary shadow-[0_0_20px_rgba(63,111,118,0.4)]"></div>
    </div>
  );

  if (!lote) return <div className="bg-agro-midnight min-h-screen pt-40 text-center text-white font-black italic">LOTE NO LOCALIZADO</div>;

  return (
    <div className="bg-background min-h-screen pt-32 pb-20 px-6 relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      <div className="container mx-auto relative z-10 max-w-7xl">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 mb-10 italic">
          <Link to="/" className="hover:text-primary transition-colors">Portal</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link to="/lotes" className="hover:text-primary transition-colors">Mercado</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary">{lote.titulo}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* COLUMNA MULTIMEDIA */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-surface-container-high border border-outline-variant/10 p-4 rounded-[2.5rem] shadow-2xl relative overflow-hidden">

              {/* VIDEO PLAYER */}
              {lote.video && (
                <div className="mb-4 rounded-3xl overflow-hidden border border-primary/20 bg-black aspect-video group relative">
                  <video
                    src={`${BASE_URL}${lote.video}`}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                    poster={lote.fotos?.[0] ? `${BASE_URL}${lote.fotos[0]}` : ""}
                  />
                  <div className="absolute top-4 left-4 bg-primary/20 backdrop-blur-md px-4 py-2 rounded-full border border-primary/30">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest italic flex items-center gap-2">
                      <span className="material-symbols-outlined text-xs">videocam</span> Inspección Digital
                    </span>
                  </div>
                </div>
              )}

              {/* FOTO PRINCIPAL */}
              <div className="relative h-[550px] overflow-hidden rounded-3xl bg-surface-container-lowest border border-outline-variant/5">
                <img src={`${BASE_URL}${fotoPrincipal}`} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" alt="Activo" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high/40 via-transparent to-transparent"></div>
              </div>

              {/* THUMBNAILS */}
              <div className="flex gap-3 overflow-x-auto mt-4 pb-2 no-scrollbar">
                {lote.fotos?.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => setFotoPrincipal(f)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${fotoPrincipal === f ? "border-primary scale-105 shadow-lg shadow-primary/20" : "border-transparent opacity-40 hover:opacity-100"}`}
                  >
                    <img src={`${BASE_URL}${f}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA INFORMACIÓN */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <section className="bg-surface-container-high border border-outline-variant/10 p-10 rounded-[3rem] shadow-2xl relative">
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="bg-primary/10 text-primary text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/20 italic">
                  {lote.categoria}
                </span>
                <span className="bg-surface-variant/30 text-on-surface-variant text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-outline-variant/10">
                  ID: {lote._id.slice(-8).toUpperCase()}
                </span>
                {lote.documentoPropiedad && lote.numeroDicose && (
                  <span className="bg-[#00E5FF]/10 text-[#00E5FF] text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-[#00E5FF]/30 italic flex items-center gap-2">
                    <span className="material-symbols-outlined text-[12px]">verified_user</span> Verificado
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-on-surface italic tracking-tighter leading-[0.9] mb-8 uppercase glow-text">
                {lote.titulo}
              </h1>

              {/* VALUACIÓN */}
              <div className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/10 mb-8 shadow-inner relative group overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-8xl">payments</span>
                </div>
                <p className="text-[10px] text-on-surface-variant/40 font-bold uppercase mb-2 tracking-widest italic">Valuación del Activo</p>
                <p className="text-5xl font-black text-on-surface italic tracking-tighter">
                  <span className="text-xl not-italic text-primary mr-1">USD</span>{lote.precio?.toLocaleString() || "0"}
                </p>
              </div>

              {/* FICHA TÉCNICA ÉLITE */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-surface-container-low/50 p-5 rounded-3xl border border-outline-variant/10 text-center group hover:bg-primary-container transition-all">
                  <p className="text-[8px] font-bold text-primary uppercase mb-2 tracking-widest group-hover:text-on-primary-container italic">Raza</p>
                  <p className="text-on-surface text-xs font-black uppercase tracking-tighter group-hover:text-on-primary-container">{lote.raza || "N/A"}</p>
                </div>
                <div className="bg-surface-container-low/50 p-5 rounded-3xl border border-outline-variant/10 text-center group hover:bg-primary-container transition-all">
                  <p className="text-[8px] font-bold text-primary uppercase mb-2 tracking-widest group-hover:text-on-primary-container italic">Cabezas</p>
                  <p className="text-on-surface text-xl font-black italic tracking-tighter group-hover:text-on-primary-container">{lote.cantidad || 0}</p>
                </div>
                <div className="bg-surface-container-low/50 p-5 rounded-3xl border border-outline-variant/10 text-center group hover:bg-primary-container transition-all">
                  <p className="text-[8px] font-bold text-primary uppercase mb-2 tracking-widest group-hover:text-on-primary-container italic">Peso/Prom</p>
                  <p className="text-on-surface text-xs font-black group-hover:text-on-primary-container">{lote.pesoPromedio || 0} KG</p>
                </div>
              </div>

              <div className="mb-10">
                <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-4 italic">Descripción Técnica</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed font-light italic border-l-2 border-primary/20 pl-6">
                  {lote.descripcion}
                </p>
              </div>

              {/* --- NUEVA SECCIÓN: CERTIFICACIÓN OFICIAL --- */}
              {lote.numeroDicose && (
                <div className="mb-10 bg-agro-teal/5 border border-agro-teal/20 p-8 rounded-[2rem] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <span className="material-symbols-outlined text-6xl">verified</span>
                  </div>
                  <h4 className="text-[10px] font-bold text-agro-teal uppercase tracking-[0.4em] mb-6 italic">Certificación Oficial</h4>

                  <div className="space-y-6 relative z-10">
                    <div>
                      <p className="text-[8px] text-on-surface-variant/60 font-bold uppercase tracking-widest mb-1">DICOSE / ID Registrada</p>
                      <p className="text-xl font-black text-white italic tracking-widest">{lote.numeroDicose}</p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4 border-t border-agro-teal/10">
                      {lote.documentoPropiedad && (
                        <a
                          href={`${BASE_URL}${lote.documentoPropiedad}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 text-[9px] font-bold text-agro-teal hover:text-white transition-colors border border-agro-teal/30 px-4 py-2 rounded-xl bg-agro-teal/10"
                        >
                          <span className="material-symbols-outlined text-sm">description</span> Guía de Propiedad
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {usuarioLogueado ? (
                  <>
                    <button
                      onClick={handleContactarWhatsapp}
                      className="w-full py-5 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all shadow-xl flex items-center justify-center gap-3"
                    >
                      <span className="material-symbols-outlined text-lg">chat</span> Negociar vía WhatsApp
                    </button>
                    <button
                      onClick={() => setMostrarModal(true)}
                      className="w-full py-4.5 bg-surface-variant/20 text-on-surface border border-outline-variant/20 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-surface-variant transition-all flex items-center justify-center gap-3"
                    >
                      <span className="material-symbols-outlined text-lg">mail</span> Enviar mensaje
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="machined-gradient w-full py-5 text-[11px] font-bold block text-center uppercase tracking-widest shadow-[0_0_25px_rgba(63,111,118,0.4)] rounded-full text-on-tertiary-fixed">
                    Autenticarse para Negociar
                  </Link>
                )}
              </div>
            </section>

            {/* CARD PRODUCTOR */}
            <div className="bg-surface-container-high border border-outline-variant/10 p-8 rounded-[2.5rem] flex items-center justify-between group">
              <div>
                <p className="text-[10px] text-on-surface-variant/40 font-bold uppercase mb-1 italic tracking-widest">Productor Responsable</p>
                <p className="text-xl font-black text-on-surface italic uppercase tracking-tighter group-hover:text-primary transition-colors">{lote.usuario?.nombre}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(63,111,118,0.8)]"></span>
                  <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Socio Estratégico {lote.usuario?.plan}</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-surface-container-lowest rounded-2xl flex items-center justify-center text-3xl border border-outline-variant/5 shadow-inner group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-4xl">verified_user</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL MÁS LIMPIO */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
          <div className="bg-surface-container-highest border border-outline-variant/20 rounded-[3rem] w-full max-w-lg p-10 relative shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
            <button onClick={() => setMostrarModal(false)} className="absolute top-8 right-8 text-on-surface-variant/40 hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-2xl font-black text-on-surface italic uppercase mb-2 tracking-tighter glow-text">Propuesta Directa</h2>
            <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mb-8 italic">El mensaje se enviará a la terminal del productor</p>
            <textarea
              className="w-full bg-surface-container-lowest border-2 border-outline-variant/30 rounded-3xl p-6 text-on-surface text-sm outline-none focus:border-primary/50 h-40 transition-all shadow-inner leading-relaxed placeholder:text-on-surface-variant/20"
              placeholder="Describa su oferta comercial o consulta técnica..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
            <button onClick={enviarMensaje} className="machined-gradient w-full mt-8 py-5 text-[11px] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(63,111,118,0.4)] rounded-full text-on-tertiary-fixed">
              ENVIAR PROPUESTA ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}