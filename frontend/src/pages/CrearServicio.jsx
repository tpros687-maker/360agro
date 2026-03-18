import { useState, useEffect } from "react";
import servicioApi from "../api/servicioApi";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function CrearServicio() {
  const navigate = useNavigate();
  const [yaExiste, setYaExiste] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificando, setVerificando] = useState(true);

  const [form, setForm] = useState({
    nombre: "",
    tipoServicio: "",
    descripcion: "",
    zona: "",
    telefono: "",
    whatsapp: "",
    email: "",
    website: "",
  });

  const [fotos, setFotos] = useState([]);

  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await servicioApi.obtenerMiServicio();
        if (res.data) setYaExiste(true);
      } catch (_) { 
        // Si falla es porque no tiene servicio, lo cual está bien aquí
      } finally {
        setVerificando(false);
      }
    };
    verificar();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFotos = (e) => {
    const arr = Array.from(e.target.files);
    if (fotos.length + arr.length > 6) {
        return toast.error("Máximo 6 evidencias técnicas permitidas");
    }
    setFotos((prev) => [...prev, ...arr]);
  };

  const eliminarFoto = (i) => setFotos((prev) => prev.filter((_, index) => index !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tId = toast.loading("Configurando terminal profesional...");

    try {
      // 1. Crear el registro base
      await servicioApi.crearServicio(form);

      // 2. Vincular activos visuales si existen
      if (fotos.length > 0) {
        const fd = new FormData();
        fotos.forEach((f) => fd.append("fotos", f));
        await servicioApi.subirFotos(fd);
      }

      toast.success("PERFIL TÉCNICO DESPLEGADO", { id: tId });
      navigate("/panel/proveedor"); // Redirigimos al panel central para ver el estado
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.mensaje || "ERROR EN LA INDEXACIÓN", { id: tId });
    } finally {
      setLoading(false);
    }
  };

  if (verificando) return (
    <div className="bg-agro-midnight min-h-screen flex justify-center items-center">
        <div className="animate-pulse text-agro-teal font-black uppercase tracking-widest">Validando Credenciales...</div>
    </div>
  );

  if (yaExiste) {
    return (
      <div className="bg-agro-midnight min-h-screen flex items-center justify-center px-6">
        <div className="card-midnight p-16 bg-agro-charcoal/40 text-center max-w-xl border border-white/5 rounded-[3rem] shadow-2xl">
          <div className="text-7xl mb-10 group-hover:rotate-12 transition-transform">⚙️</div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-6">Registro Activo</h2>
          <p className="text-agro-cream/30 text-sm font-black uppercase tracking-widest mb-10 leading-loose">
            "Su terminal de servicios profesionales ya se encuentra operativa en la red de Élite Agro."
          </p>
          <Link to="/panel/proveedor" className="btn-emerald py-5 px-10 inline-block">GESTIONAR MI SERVICIO ➔</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-full h-[600px] bg-agro-teal/5 blur-[200px] pointer-events-none opacity-20"></div>

      <div className="container mx-auto max-w-4xl relative z-10">

        <header className="mb-16 border-b border-white/5 pb-10">
          <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Professional Service Deployment</span>
          <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
            SUMAR <span className="text-agro-teal not-italic">SOLUCIÓN</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* IDENTIDAD TÉCNICA */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 border-white/5 space-y-8">
            <h2 className="text-agro-teal font-black text-[10px] uppercase tracking-[0.4em] mb-6">Especificaciones de Servicio</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Nombre Profesional / Empresa</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej: Servicios Agrícolas Sierra" className="bg-agro-midnight p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-agro-teal/30 transition-all font-bold" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Área de Especialidad</label>
                <select name="tipoServicio" value={form.tipoServicio} onChange={handleChange} required className="bg-agro-midnight p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-agro-teal/30 transition-all font-black text-[10px] uppercase tracking-widest appearance-none">
                  <option value="">Seleccionar área...</option>
                  <option value="siembra">🌱 Siembra Profesional</option>
                  <option value="fumigación">🪰 Control de Plagas / Fumigación</option>
                  <option value="trilla">🚜 Cosecha y Trilla</option>
                  <option value="transporte">🚚 Logística y Transporte</option>
                  <option value="agrónomo">👨‍🌾 Asesoría Agronómica</option>
                  <option value="gestor">📋 Gestión de Proyectos</option>
                  <option value="otros">🔧 Otros Servicios Técnicos</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Descripción de Metodología</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows="4" required placeholder="Detalle su flota de maquinaria, certificaciones y experiencia en el sector..." className="bg-agro-midnight p-6 rounded-2xl text-white border border-white/5 outline-none focus:border-agro-teal/30 transition-all resize-none font-medium leading-relaxed"></textarea>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Zona de Operación</label>
              <input type="text" name="zona" value={form.zona} onChange={handleChange} placeholder="Ej: Soriano, Río Negro y Paysandú" required className="bg-agro-midnight p-5 rounded-2xl text-white border border-white/5 outline-none focus:border-agro-teal/30 transition-all font-bold" />
            </div>
          </section>

          {/* CONTACTO */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 border-white/5 space-y-8">
            <h2 className="text-agro-teal font-black text-[10px] uppercase tracking-[0.4em] mb-6">Canales de Enlace Directo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">WhatsApp de Negocios</label>
                <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="Ej: +598 99..." className="bg-agro-midnight p-5 rounded-2xl text-white border border-white/5 outline-none focus:border-agro-teal/30 transition-all font-black" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Email Profesional</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="bg-agro-midnight p-5 rounded-2xl text-white border border-white/5 outline-none focus:border-agro-teal/30 transition-all font-black" />
              </div>
            </div>
          </section>

          {/* EVIDENCIA */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 border-white/5 space-y-8">
            <h2 className="text-agro-teal font-black text-[10px] uppercase tracking-[0.4em] mb-6">Showcase de Operaciones</h2>
            <label className="block w-full h-32 border-2 border-dashed border-white/5 rounded-[2rem] hover:border-agro-teal/30 transition-all cursor-pointer relative overflow-hidden group">
              <input type="file" accept="image/*" multiple onChange={handleFotos} className="hidden" />
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="text-3xl mb-1">📸</span>
                <span className="text-[9px] font-black uppercase tracking-widest">Añadir Evidencia Visual</span>
              </div>
            </label>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-8">
              {fotos.map((f, i) => (
                <div key={i} className="relative group h-20 rounded-xl overflow-hidden border border-white/10">
                  <img src={URL.createObjectURL(f)} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => eliminarFoto(i)} className="absolute inset-0 bg-red-900/80 text-white font-black text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">⨯</button>
                </div>
              ))}
            </div>
          </section>

          <footer className="pt-8">
            <button type="submit" disabled={loading} className="btn-emerald w-full py-7 shadow-teal-glow-lg uppercase tracking-[0.4em] text-xs">
              {loading ? "Indexando Perfil..." : "🏗️ DESPLEGAR EN LA RED"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}