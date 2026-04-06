import { useState, useEffect } from "react";
import tiendaApi from "../api/tiendaApi";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function CrearTienda() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    rubro: "",
    descripcion: "",
    zona: "",
    telefono: "",
    whatsapp: "",
    email: "",
    website: "",
  });

  const [logo, setLogo] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [yaExiste, setYaExiste] = useState(false);

  // Verificar si el usuario ya tiene una terminal activa
  const verificarTienda = async () => {
    try {
      const res = await tiendaApi.obtenerMiTienda();
      // 🛡️ FIX: Solo marcar como existente si el backend NO devuelve noExiste:true
      if (res.data && !res.data.noExiste) {
        setYaExiste(true);
      }
    } catch (_) { }
  };

  useEffect(() => {
    verificarTienda();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogo = (e) => setLogo(e.target.files[0]);

  const handleFotos = (e) => {
    const arr = Array.from(e.target.files);
    setFotos((prev) => [...prev, ...arr]);
  };

  const eliminarFoto = (i) =>
    setFotos((prev) => prev.filter((_, index) => index !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("INICIALIZANDO ESTRUCTURA CORPORATIVA...");

    try {
      // ✅ UNIFICACIÓN EN FORMDATA: Clave para evitar errores de red
      const fd = new FormData();

      // Inyectar campos de texto
      Object.keys(form).forEach(key => fd.append(key, form[key]));
      fd.append("tipoProveedor", "tienda"); // 🔥 Asegurar que sea una tienda

      // Inyectar Logo
      if (logo) fd.append("logo", logo);

      // Inyectar Galería
      if (fotos.length > 0) {
        fotos.forEach((f) => fd.append("fotos", f));
      }

      // Una sola petición robusta
      await tiendaApi.crearTienda(fd);

      toast.success("SHOWROOM FUNDADO EXITOSAMENTE", { id: toastId });
      navigate("/mi-tienda");

    } catch (error) {
      console.error("Error en fundación:", error);
      toast.error(error.response?.data?.mensaje || "FALLO EN EL DESPLIEGUE CORPORATIVO", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (yaExiste) {
    return (
      <div className="bg-agro-midnight min-h-screen flex items-center justify-center px-6">
        <div className="card-midnight p-12 bg-agro-charcoal/40 text-center max-w-xl border border-white/5 rounded-[3.5rem] shadow-2xl animate-reveal">
          <div className="text-6xl mb-8">🏢</div>
          <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">Terminal <br /><span className="text-agro-teal">Ya Activa</span></h2>
          <p className="text-agro-cream/40 text-[10px] font-black uppercase tracking-[0.3em] mb-10 italic leading-relaxed">
            "Su identidad corporativa ya se encuentra indexada. Proceda a la gestión de inventario desde su panel de operaciones."
          </p>
          <Link to="/mi-tienda" className="btn-emerald inline-block py-5 px-10 shadow-teal-glow">
            Ir a Mi Showroom ➔
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-agro-teal/5 blur-[200px] pointer-events-none opacity-30 -ml-40 -mt-40"></div>

      <div className="container mx-auto max-w-4xl relative z-10 animate-reveal">

        <header className="mb-16">
          <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Fundación de Marca Corporativa</span>
          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none uppercase">
            INICIAR <span className="text-agro-teal not-italic font-black">TIENDA</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* SECCIÓN IDENTIDAD */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 space-y-8 rounded-[2.5rem] border border-white/5 shadow-inner">
            <div className="flex items-center gap-6 mb-4">
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase text-agro-teal">Identidad de Marca</h2>
              <div className="h-[1px] bg-white/5 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Nombre Comercial</label>
                <input type="text" name="nombre" required onChange={handleChange} placeholder="Ej: AgroIndustrias del Plata..." className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none text-white font-bold" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Sector Operativo</label>
                <select name="rubro" required onChange={handleChange} className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none text-white font-black uppercase text-[10px] tracking-widest cursor-pointer">
                  <option value="">Selección de Sector</option>
                  <option value="Veterinaria">Veterinaria</option>
                  <option value="Maquinaria">Maquinaria</option>
                  <option value="Insumos">Insumos Agropecuarios</option>
                  <option value="Cabaña">Cabaña / Genética</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Sede Central / Zona</label>
                <input type="text" name="zona" required onChange={handleChange} placeholder="Ej: Montevideo, Uruguay" className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none text-white font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Visión Estratégica</label>
                <textarea name="descripcion" required onChange={handleChange} rows="1" placeholder="Breve descripción corporativa..." className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none text-white font-medium resize-none leading-relaxed" />
              </div>
            </div>
          </section>

          {/* CONTACTO */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 space-y-8 rounded-[2.5rem] border border-white/5">
            <div className="flex items-center gap-6 mb-4">
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase text-agro-teal">Terminal de Enlace</h2>
              <div className="h-[1px] bg-white/5 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">WhatsApp Business</label>
                <input type="text" name="whatsapp" onChange={handleChange} placeholder="+598..." className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none text-white font-black" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Email Corporativo</label>
                <input type="email" name="email" onChange={handleChange} placeholder="empresa@agro.com" className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none text-white font-black" />
              </div>
            </div>
          </section>

          {/* ASSETS */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 space-y-8 rounded-[2.5rem] border border-white/5">
            <div className="flex items-center gap-6 mb-4">
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase text-agro-teal">Activos de Marca</h2>
              <div className="h-[1px] bg-white/5 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Logo Identificador</label>
                <label className="block w-full h-40 border-2 border-dashed border-white/10 rounded-[2rem] hover:border-agro-teal/30 transition-all cursor-pointer relative overflow-hidden group bg-agro-midnight/50">
                  <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                  {logo ? (
                    <div className="absolute inset-0 p-4 animate-in fade-in duration-500">
                      <img src={URL.createObjectURL(logo)} className="w-full h-full object-contain brightness-110" alt="Preview" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🔖</span>
                      <span className="text-[8px] font-black text-agro-cream/20 uppercase tracking-widest">Cargar Símbolo</span>
                    </div>
                  )}
                </label>
              </div>

              <div className="space-y-6">
                <label className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Galería de Tienda</label>
                <label className="block w-full h-40 border-2 border-dashed border-white/10 rounded-[2rem] hover:border-agro-teal/30 transition-all cursor-pointer relative bg-agro-midnight/50 group">
                  <input type="file" accept="image/*" multiple onChange={handleFotos} className="hidden" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🌆</span>
                    <span className="text-[8px] font-black text-agro-cream/20 uppercase tracking-widest">Cargar Instalaciones</span>
                  </div>
                </label>
              </div>
            </div>
          </section>

          <footer className="pt-8 text-center">
            <button type="submit" disabled={loading} className="btn-emerald w-full py-6 text-sm shadow-teal-glow-lg transition-all active:scale-95">
              {loading ? "INICIALIZANDO TERMINAL..." : "🏢 FUNDAR TIENDA EN LA RED"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}