import { useState, useContext } from "react";
import API from "../api/lotApi";
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
    numeroDicose: "",
  });

  const [fotos, setFotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [docPropiedad, setDocPropiedad] = useState(null);
  const [loading, setLoading] = useState(false);

  const userPlan = usuario?.plan?.toLowerCase() || "gratis";
  const puedePublicar = ["basico", "productor", "pro", "élite pro", "empresa", "bronce", "plata", "oro"].includes(userPlan);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (fotos.length + files.length > 5) {
      toast.error("MÁXIMO 5 REGISTROS FOTOGRÁFICOS");
      return;
    }
    setFotos((prev) => [...prev, ...files]);
  };

  const eliminarFoto = (i) => setFotos((prev) => prev.filter((_, index) => index !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("SINCRONIZANDO ACTIVO EN LA RED...");

    try {
      const formFull = new FormData();
      Object.keys(formData).forEach(key => formFull.append(key, formData[key]));
      fotos.forEach((file) => formFull.append("fotos", file));
      if (video) formFull.append("video", video);
      if (docPropiedad) formFull.append("documentoPropiedad", docPropiedad);

      formFull.append("destacado", ["oro", "empresa", "élite pro"].includes(userPlan));

      await API.crearLote(formFull);
      toast.success("ACTIVO PUBLICADO CON ÉXITO", { id: toastId });
      navigate("/lotes");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detalle || "ERROR DE VALIDACIÓN", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!puedePublicar) {
    return (
      <div className="bg-agro-midnight min-h-screen flex items-center justify-center px-6">
        <div className="card-midnight p-16 bg-agro-charcoal/40 text-center max-w-xl border border-white/5 rounded-[3rem] shadow-2xl">
          <div className="text-7xl mb-10">⚠️</div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-6">Acceso Restringido</h2>
          <p className="text-agro-cream/30 text-sm font-black uppercase tracking-widest mb-10 leading-loose">
            No cuenta con un plan operativo activo para publicar activos en el mercado.
          </p>
          <Link to="/planes" className="btn-emerald py-5 px-10 inline-block font-black uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.3)]">VER PLANES DE ÉLITE ➔</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-full h-[600px] bg-agro-teal/5 blur-[200px] pointer-events-none opacity-20"></div>

      <div className="container mx-auto max-w-4xl relative z-10">

        <header className="mb-16 border-b border-white/5 pb-10">
          <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">New Asset Deployment</span>
          <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
            SUMAR <span className="text-agro-teal not-italic">LOTE</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* SECCIÓN 1: BIOMETRÍA Y CATEGORIZACIÓN */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 border-white/5 space-y-8 rounded-[2.5rem] border backdrop-blur-sm">
            <h2 className="text-agro-teal font-black text-[10px] uppercase tracking-[0.4em] mb-6">Especificaciones Biométricas</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Título del Activo</label>
                <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required placeholder="Ej: Lote 50 Novillos Hereford" className="bg-agro-midnight p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-agro-teal/30 transition-all font-bold" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Clasificación Técnica</label>
                <select name="categoria" value={formData.categoria} onChange={handleChange} className="bg-agro-midnight p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-agro-teal/30 transition-all font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer">
                  <option value="Ganado">Ganado Vacuno</option>
                  <option value="Invernada">Invernada</option>
                  <option value="Cria">Cría</option>
                  <option value="Maquinaria">Maquinaria</option>
                  <option value="Campos">Campos / Fracciones</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Raza / Genética</label>
                <input type="text" name="raza" value={formData.raza} onChange={handleChange} placeholder="Ej: Angus Negro" className="bg-agro-midnight p-5 rounded-2xl text-white border border-white/5 outline-none focus:border-agro-teal/30 transition-all font-bold" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Cantidad / Cabezas</label>
                <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} placeholder="0" className="bg-agro-midnight p-5 rounded-2xl text-white border border-white/5 outline-none focus:border-agro-teal/30 transition-all font-bold text-center" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Peso Prom. (KG)</label>
                <input type="number" name="pesoPromedio" value={formData.pesoPromedio} onChange={handleChange} placeholder="0" className="bg-agro-midnight p-5 rounded-2xl text-white border border-white/5 outline-none focus:border-agro-teal/30 transition-all font-bold text-center text-agro-teal" />
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: LOGÍSTICA Y MERCADO */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 border-white/5 space-y-8 rounded-[2.5rem] border backdrop-blur-sm">
            <h2 className="text-agro-teal font-black text-[10px] uppercase tracking-[0.4em] mb-6">Valuación y Jurisdicción</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Precio Objetivo (USD)</label>
                <input type="number" name="precio" value={formData.precio} onChange={handleChange} required placeholder="0.00" className="bg-agro-midnight p-5 rounded-2xl text-white border border-white/5 outline-none focus:border-agro-teal/30 transition-all font-black text-2xl tracking-tighter" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Ubicación / Departamento</label>
                <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} required placeholder="Ej: Soriano, Paraje San Juan" className="bg-agro-midnight p-5 rounded-2xl text-white border border-white/5 outline-none focus:border-agro-teal/30 transition-all font-bold" />
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: FICHA DESCRIPTIVA */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 border-white/5 space-y-8 rounded-[2.5rem] border backdrop-blur-sm">
            <h2 className="text-agro-teal font-black text-[10px] uppercase tracking-[0.4em] mb-6">Memoria Técnica</h2>
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Detalles de Sanidad y Alimentación</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="5" required placeholder="Describa el estado del lote, historial de vacunación, suplementación..." className="bg-agro-midnight p-6 rounded-2xl text-white border border-white/5 outline-none focus:border-agro-teal/30 transition-all resize-none font-medium leading-relaxed"></textarea>
            </div>
          </section>

          {/* SECCIÓN 4: CERTIFICACIÓN OFICIAL (EL RECIÉN AGREGADO, CON ESTILO MEJORADO) */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 border-agro-teal/20 space-y-10 rounded-[2.5rem] border relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-48 h-48 bg-agro-teal/5 rounded-bl-[15rem]"></div>

            <header className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 machined-gradient rounded-2xl flex items-center justify-center text-agro-midnight shadow-teal-glow">
                <span className="material-symbols-outlined font-black text-2xl">verified_user</span>
              </div>
              <div>
                <h3 className="text-white font-black italic uppercase tracking-tighter text-2xl leading-none">Certificación de Elite</h3>
                <p className="text-[10px] text-agro-teal font-black uppercase tracking-[0.4em] mt-2 italic">Protocolo de Verificación Documental</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              {/* Input DICOSE */}
              <div className="flex flex-col gap-4">
                <label className="text-agro-teal text-[10px] font-black uppercase tracking-[0.3em] ml-1">Número DICOSE / ID Oficial</label>
                <input
                  type="text"
                  name="numeroDicose"
                  value={formData.numeroDicose}
                  onChange={handleChange}
                  placeholder="DICOSE - 9 DÍGITOS"
                  className="bg-agro-midnight p-5 rounded-2xl text-white border border-agro-teal/20 focus:border-agro-teal transition-all outline-none font-black italic tracking-widest"
                />
              </div>

              {/* Guía de Propiedad */}
              <div className="flex flex-col gap-4">
                <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] ml-1">Guía de Propiedad (PDF/IMG)</label>
                <label className="relative group cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setDocPropiedad(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="bg-agro-midnight p-5 rounded-2xl text-white border border-white/5 group-hover:border-agro-teal/40 transition-all flex items-center justify-between">
                    <span className="text-[10px] font-bold truncate max-w-[200px] text-on-surface-variant font-mono uppercase tracking-widest">
                      {docPropiedad ? docPropiedad.name : "VINCULAR ARCHIVO"}
                    </span>
                    <span className="material-symbols-outlined text-agro-teal text-xl">upload_file</span>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* SECCIÓN 5: GALERÍA DE ACTIVOS */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 border-white/5 space-y-8 rounded-[2.5rem] border backdrop-blur-sm">
            <h2 className="text-agro-teal font-black text-[10px] uppercase tracking-[0.4em] mb-6">Evidencia Visual del Activo</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* VIDEO UPLOAD */}
              <div className="flex flex-col gap-4">
                <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] ml-1">Video del Lote (MP4 / MAX 15MB)</label>
                <label className="relative group cursor-pointer h-32 border-2 border-dashed border-white/10 rounded-[2.5rem] hover:border-agro-teal/30 transition-all flex flex-col items-center justify-center bg-agro-midnight/30">
                  <input type="file" accept="video/mp4" onChange={(e) => setVideo(e.target.files[0])} className="hidden" />
                  <div className="flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-2xl mb-1">{video ? "✅" : "🎥"}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest">
                      {video ? video.name : "Subir Video de Inspección"}
                    </span>
                  </div>
                </label>
              </div>

              {/* FOTOS UPLOAD */}
              <div className="flex flex-col gap-4">
                <label className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] ml-1">Fotos del Ganado (MAX 5)</label>
                <label className="relative group cursor-pointer h-32 border-2 border-dashed border-white/10 rounded-[2.5rem] hover:border-agro-teal/30 transition-all flex flex-col items-center justify-center bg-agro-midnight/30">
                  <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                  <div className="flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-2xl mb-1">📸</span>
                    <span className="text-[8px] font-black uppercase tracking-widest">Añadir Registro Fotográfico</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-8">
              {fotos.map((f, i) => (
                <div key={i} className="relative group h-20 rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                  <img src={URL.createObjectURL(f)} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => eliminarFoto(i)} className="absolute inset-0 bg-red-900/80 text-white font-black text-[14px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">⨯</button>
                </div>
              ))}
            </div>
          </section>

          <footer className="pt-12">
            <button
              type="submit"
              disabled={loading}
              className="btn-emerald w-full py-8 shadow-teal-glow-lg text-[13px] font-black uppercase tracking-[0.5em] italic transition-all active:scale-95"
            >
              {loading ? "Indexando Activo Vivo..." : "🏗️ DESPLEGAR LOTE EN LA RED"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}