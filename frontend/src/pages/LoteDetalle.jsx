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
    <div className="bg-agro-midnight min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-agro-teal shadow-teal-glow"></div>
    </div>
  );

  if (!lote) return <div className="bg-agro-midnight min-h-screen pt-40 text-center text-white font-black italic">LOTE NO LOCALIZADO</div>;

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="container mx-auto relative z-10">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-agro-cream/20 mb-12">
          <Link to="/" className="hover:text-agro-teal transition">Portal</Link>
          <span>/</span>
          <Link to="/lotes" className="hover:text-agro-teal transition">Lotes</Link>
          <span>/</span>
          <span className="text-agro-teal">{lote.titulo}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* COLUMNA MULTIMEDIA */}
          <div className="lg:col-span-7">
            <div className="bg-agro-charcoal border border-white/5 p-6 rounded-[3.5rem] shadow-2xl">
              
              {/* VIDEO PLAYER */}
              {lote.video && (
                <div className="mb-6 rounded-[2.5rem] overflow-hidden border border-agro-teal/20 shadow-teal-glow/10 bg-black">
                  <video 
                    src={`${BASE_URL}${lote.video}`} 
                    controls 
                    playsInline
                    className="w-full h-[25rem] object-contain"
                    poster={lote.fotos?.[0] ? `${BASE_URL}${lote.fotos[0]}` : ""}
                  />
                  <div className="bg-agro-teal/10 py-3 text-center border-t border-agro-teal/10">
                    <span className="text-[9px] font-black text-agro-teal uppercase tracking-widest italic">Inspección de Video Activa</span>
                  </div>
                </div>
              )}

              {/* FOTO PRINCIPAL */}
              <div className="relative h-[35rem] overflow-hidden rounded-[2.5rem] shadow-inner mb-6 bg-agro-midnight">
                <img src={`${BASE_URL}${fotoPrincipal}`} className="w-full h-full object-cover transition duration-700" alt="Hacienda" />
              </div>

              {/* THUMBNAILS */}
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {lote.fotos?.map((f, i) => (
                  <button 
                    key={i} 
                    onClick={() => setFotoPrincipal(f)} 
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${fotoPrincipal === f ? "border-agro-teal scale-105" : "border-transparent opacity-40 hover:opacity-100"}`}
                  >
                    <img src={`${BASE_URL}${f}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMNA INFORMACIÓN */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <section className="bg-agro-charcoal border border-white/5 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-4xl opacity-5 pointer-events-none">🐂</div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-agro-teal/10 text-agro-teal text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-agro-teal/10 shadow-inner">
                  {lote.categoria}
                </span>
                <span className="bg-white/5 text-white/40 text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                  REG: {lote._id.slice(-6).toUpperCase()}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter leading-tight mb-8 uppercase">
                {lote.titulo}
              </h1>

              {/* FICHA TÉCNICA */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-agro-midnight/50 p-4 rounded-2xl border border-white/5 text-center group hover:border-agro-teal/30 transition-colors">
                  <p className="text-[8px] font-black text-agro-teal uppercase mb-1 tracking-widest">Raza</p>
                  <p className="text-white font-black text-xs uppercase">{lote.raza || "N/A"}</p>
                </div>
                <div className="bg-agro-midnight/50 p-4 rounded-2xl border border-white/5 text-center group hover:border-agro-teal/30 transition-colors">
                  <p className="text-[8px] font-black text-agro-teal uppercase mb-1 tracking-widest">Cabezas</p>
                  <p className="text-white font-black text-xs">{lote.cantidad || 0}</p>
                </div>
                <div className="bg-agro-midnight/50 p-4 rounded-2xl border border-white/5 text-center group hover:border-agro-teal/30 transition-colors">
                  <p className="text-[8px] font-black text-agro-teal uppercase mb-1 tracking-widest">Peso Prom.</p>
                  <p className="text-white font-black text-xs">{lote.pesoPromedio || 0}kg</p>
                </div>
              </div>

              <div className="bg-agro-midnight p-8 rounded-[2rem] border border-white/5 mb-8 shadow-inner">
                <p className="text-[9px] text-agro-cream/20 font-black uppercase mb-2 tracking-widest">Valuación del Lote</p>
                <p className="text-5xl font-black text-white italic tracking-tighter shadow-teal-glow-sm">
                  USD {lote.precio?.toLocaleString() || "0"}
                </p>
              </div>

              <p className="text-agro-cream/40 italic text-sm mb-10 leading-relaxed border-l-2 border-agro-teal/20 pl-4">
                "{lote.descripcion}"
              </p>

              <div className="space-y-4">
                {usuarioLogueado ? (
                  <>
                    <button 
                      onClick={handleContactarWhatsapp}
                      className="w-full py-5 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-green-500 hover:text-white transition-all shadow-xl"
                    >
                      📲 Negociar vía WhatsApp
                    </button>
                    <button 
                      onClick={() => setMostrarModal(true)}
                      className="w-full py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-agro-teal hover:text-agro-midnight transition-all"
                    >
                      ✉️ Consulta de Red Interna
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="btn-emerald w-full py-5 text-[10px] block text-center uppercase tracking-widest shadow-teal-glow">
                    Inicie Sesión para Negociar
                  </Link>
                )}
              </div>
            </section>

            {/* CARD PRODUCTOR */}
            <div className="bg-agro-charcoal/40 p-8 rounded-[2.5rem] flex items-center justify-between border border-white/5">
              <div>
                <p className="text-[9px] text-agro-cream/20 font-black uppercase mb-1">Productor Responsable</p>
                <p className="text-xl font-black text-white italic uppercase tracking-tighter">{lote.usuario?.nombre}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 bg-agro-teal rounded-full animate-pulse"></span>
                    <span className="text-[8px] font-black text-agro-teal uppercase tracking-widest">Plan {lote.usuario?.plan}</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-agro-midnight rounded-xl flex items-center justify-center text-2xl border border-agro-teal/10 shadow-inner">👨‍🌾</div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL MÁS LIMPIO */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-agro-midnight/90 backdrop-blur-md flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
          <div className="bg-agro-charcoal border border-white/10 rounded-[3rem] w-full max-w-lg p-10 relative shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <button onClick={() => setMostrarModal(false)} className="absolute top-6 right-8 text-white/20 hover:text-white transition-colors">✕</button>
            <h2 className="text-2xl font-black text-white italic uppercase mb-2 tracking-tighter">Propuesta Directa</h2>
            <p className="text-[9px] font-black text-agro-cream/20 uppercase tracking-widest mb-8">El mensaje se enviará a la terminal del productor</p>
            <textarea 
              className="w-full bg-agro-midnight border border-white/10 rounded-2xl p-6 text-white text-sm outline-none focus:border-agro-teal/50 h-40 transition-all shadow-inner leading-relaxed"
              placeholder="Describa su oferta o consulta técnica..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
            />
            <button onClick={enviarMensaje} className="btn-emerald w-full mt-8 py-5 text-[10px] uppercase tracking-widest shadow-teal-glow">
                ENVIAR AL PRODUCTOR ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}