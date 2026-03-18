import { useState, useContext, useEffect } from "react";
import API from "../api/lotApi"; // ✅ CORREGIDO: Usar lotApi para la creación de lotes
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function CrearLote() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "Ganado",
    raza: "",
    cantidad: "",
    pesoPromedio: "",
    precio: "",
    ubicacion: "",
  });

  const [fotos, setFotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ CORREGIDO: Mapeo de límites actualizado para coincidir con tus nuevos planes
  const limitePorPlan = {
    gratis: 0,
    observador: 0,
    basico: 5,
    productor: 5,
    pro: Infinity,
    "élite pro": Infinity,
    empresa: Infinity,
    business: Infinity,
  };

  const userPlan = usuario?.plan?.toLowerCase() || "gratis";
  const puedePublicar = limitePorPlan[userPlan] > 0;

  // Validación de Plan al renderizar
  if (!puedePublicar) {
    return (
      <div className="bg-agro-midnight min-h-screen flex items-center justify-center px-6">
        <div className="card-midnight p-12 bg-agro-charcoal text-center max-w-xl border border-red-500/20 shadow-2xl rounded-[3rem] animate-reveal">
          <div className="text-6xl mb-8">🚫</div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-6">Restricción de Membresía</h2>
          <p className="text-agro-cream/40 text-lg mb-10 italic leading-relaxed uppercase text-[11px] tracking-widest">
            Su nivel de suscripción actual ({userPlan}) no contempla la emisión de nuevos activos.
          </p>
          <Link to="/planes" className="btn-emerald inline-block py-4 px-10 shadow-teal-glow">
            Elevar Nivel de Socio ➔
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (fotos.length + files.length > 5) {
      toast.error("MÁXIMO 5 REGISTROS FOTOGRÁFICOS");
      return;
    }
    setFotos((prev) => [...prev, ...files]);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 50 * 1024 * 1024) {
      toast.error("EL VIDEO EXCEDE EL LÍMITE DE 50MB");
      return;
    }
    setVideo(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("SINCRONIZANDO ACTIVO CON LA RED...");

    try {
      const formFull = new FormData();
      Object.keys(formData).forEach(key => formFull.append(key, formData[key]));
      fotos.forEach((file) => formFull.append("fotos", file));
      if (video) formFull.append("video", video);

      // ✅ Usamos la instancia de lotApi que ya maneja el token
      await API.crearLote(formFull); 

      toast.success("ACTIVO INDEXADO CORRECTAMENTE", { id: toastId });
      navigate("/mis-lotes");
    } catch (error) {
      console.error(error);
      toast.error("FALLO EN LA INDEXACIÓN OPERATIVA", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-agro-teal/5 blur-[200px] pointer-events-none opacity-30"></div>

      <div className="container mx-auto max-w-4xl relative z-10 animate-reveal">
        <header className="mb-16">
          <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Terminal de Carga de Hacienda</span>
          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none uppercase">
            Nueva <span className="text-agro-teal not-italic font-black">Entrada</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* SECCIÓN 1: DATOS TÉCNICOS */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 space-y-8 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-6 mb-4">
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase text-agro-teal">Información Crítica</h2>
              <div className="h-[1px] bg-white/5 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Título del Lote</label>
                <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required placeholder="Ej: 50 Terneros Brangus..." className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none text-white font-bold" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Categorización</label>
                <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none text-white font-black uppercase text-[10px] tracking-widest cursor-pointer">
                  <option value="Ganado">Ganado Vacuno</option>
                  <option value="Invernada">Invernada</option>
                  <option value="Cria">Cría</option>
                  <option value="Maquinaria">Maquinaria</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Raza / Cruza</label>
                <input type="text" name="raza" value={formData.raza} onChange={handleChange} placeholder="Angus, Hereford..." className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none text-white font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Cabezas</label>
                <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} placeholder="0" className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none text-white font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Peso (kg)</label>
                <input type="number" name="pesoPromedio" value={formData.pesoPromedio} onChange={handleChange} placeholder="180" className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none text-white font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Valuación Lote (USD)</label>
                <input type="number" name="precio" value={formData.precio} onChange={handleChange} required className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none text-white font-black text-xl text-glow-teal" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Procedencia</label>
                <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Localidad, Provincia" required className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none text-white font-bold" />
              </div>
            </div>
          </section>

          {/* ASSETS VISUALES */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 space-y-8 rounded-[2.5rem] border border-white/5">
            <div className="flex items-center gap-6 mb-4">
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase text-agro-teal">Carga Multimedia</h2>
              <div className="h-[1px] bg-white/5 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Fotos (MAX 5)</label>
                <label className="block w-full h-40 border-2 border-dashed border-white/10 rounded-[2rem] hover:border-agro-teal/30 transition-all cursor-pointer relative group bg-agro-midnight/50">
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">📸</span>
                    <span className="text-[8px] font-black text-agro-cream/20 uppercase tracking-widest group-hover:text-agro-teal">Seleccionar Registros</span>
                  </div>
                </label>
              </div>

              <div className="space-y-6">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Video Hacienda</label>
                <label className="block w-full h-40 border-2 border-dashed border-white/10 rounded-[2rem] hover:border-agro-teal/30 transition-all cursor-pointer relative group bg-agro-midnight/50">
                  <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl mb-2 group-hover:rotate-12 transition-transform">🎬</span>
                    <span className="text-[8px] font-black text-agro-cream/20 uppercase tracking-widest">{video ? video.name : "Subir Archivo MP4"}</span>
                  </div>
                </label>
              </div>
            </div>
          </section>

          <div className="pt-8">
            <button type="submit" disabled={loading} className="btn-emerald w-full py-6 text-sm shadow-teal-glow active:scale-95 transition-all">
              {loading ? "SINCRONIZANDO CON LA RED..." : "📤 CONFIRMAR PUBLICACIÓN ÉLITE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}