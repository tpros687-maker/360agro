import { useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    plan: "gratis" // 'gratis' para compradores, 'empresa' para vendedores iniciales
  });
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tId = toast.loading("Registrando nuevo socio en la red...");
    
    try {
      await api.post("/users/register", formData);
      setExito(true);
      toast.success("MEMBRESÍA GENERADA", { id: tId });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al procesar el registro";
      toast.error(msg, { id: tId });
    } finally {
      setLoading(false);
    }
  };

  if (exito) {
    return (
      <div className="bg-agro-midnight min-h-screen flex items-center justify-center text-center px-6">
        <div className="reveal space-y-8">
          <div className="w-24 h-24 bg-agro-teal/10 rounded-[3rem] border border-agro-teal/20 flex items-center justify-center text-5xl mx-auto shadow-teal-glow animate-pulse">
            ✅
          </div>
          <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
            SOLICITUD <br /> <span className="text-agro-teal">PROCESADA</span>
          </h2>
          <p className="text-agro-cream/40 font-bold uppercase tracking-[0.3em] text-[10px] italic">
            "Redirigiendo al terminal de acceso seguro..."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-agro-midnight min-h-screen flex items-center justify-center px-6 py-24 relative overflow-hidden">
      {/* Luces de fondo cinemáticas */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-agro-teal/5 rounded-full blur-[200px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-agro-teal/10 rounded-full blur-[150px] pointer-events-none opacity-30"></div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">

          {/* COLUMNA DE MARCA E INFO */}
          <div className="lg:w-1/2 space-y-12">
            <header>
                <span className="text-agro-teal font-black text-[11px] uppercase tracking-[0.6em] mb-4 block italic">Plataforma de Activos 360</span>
                <h1 className="text-7xl md:text-8xl font-black text-white italic tracking-tighter leading-none uppercase">
                    ÚNETE A LA <br />
                    <span className="text-agro-teal not-italic">EXCELENCIA</span>
                </h1>
            </header>
            
            <p className="text-agro-cream/40 text-xl leading-relaxed italic border-l-2 border-agro-teal/20 pl-8 max-w-lg">
                "Acceda a un ecosistema de negocios diseñado para la máxima eficiencia agropecuaria y trazabilidad total."
            </p>
            
            <div className="grid grid-cols-1 gap-6 pt-6">
               {["Certificación de Identidad", "Mensajería Directa B2B", "Terminal de Ventas Pro"].map((text, i) => (
                 <div key={i} className="flex items-center gap-5 font-black uppercase text-[9px] tracking-[0.4em] text-white/40">
                    <span className="w-8 h-8 rounded-2xl bg-agro-teal/10 flex items-center justify-center text-agro-teal border border-agro-teal/20">{i+1}</span>
                    {text}
                 </div>
               ))}
            </div>
          </div>

          {/* FORMULARIO DE REGISTRO */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-agro-charcoal/30 backdrop-blur-3xl p-10 md:p-14 rounded-[4rem] border border-white/5 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* SELECTOR DE PERFIL OPERATIVO */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-agro-cream/20 uppercase tracking-widest ml-4 italic">Naturaleza del Socio</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, plan: 'gratis'})}
                      className={`py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border transition-all ${formData.plan === 'gratis' ? 'bg-agro-teal text-agro-midnight border-agro-teal shadow-teal-glow' : 'bg-agro-midnight text-white/30 border-white/5 hover:border-white/20'}`}
                    >
                      Comprador
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, plan: 'empresa'})}
                      className={`py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border transition-all ${formData.plan === 'empresa' ? 'bg-agro-teal text-agro-midnight border-agro-teal shadow-teal-glow' : 'bg-agro-midnight text-white/30 border-white/5 hover:border-white/20'}`}
                    >
                      Vendedor
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                    <label className="text-[9px] font-black text-agro-teal uppercase tracking-[0.3em] ml-4 italic">Nombre del Establecimiento</label>
                    <input
                        type="text"
                        className="w-full bg-agro-midnight border border-white/5 rounded-2xl p-5 focus:border-agro-teal outline-none text-white font-bold transition-all shadow-inner text-sm"
                        placeholder="Ej: Agropecuaria del Sur"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                    />
                    </div>

                    <div className="space-y-3">
                    <label className="text-[9px] font-black text-agro-teal uppercase tracking-[0.3em] ml-4 italic">E-mail de Gestión</label>
                    <input
                        type="email"
                        className="w-full bg-agro-midnight border border-white/5 rounded-2xl p-5 focus:border-agro-teal outline-none text-white font-bold transition-all shadow-inner text-sm"
                        placeholder="socio@redagro.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    </div>

                    <div className="space-y-3">
                    <label className="text-[9px] font-black text-agro-teal uppercase tracking-[0.3em] ml-4 italic">Contraseña de Seguridad</label>
                    <input
                        type="password"
                        className="w-full bg-agro-midnight border border-white/5 rounded-2xl p-5 focus:border-agro-teal outline-none text-white font-bold transition-all shadow-inner text-sm"
                        placeholder="••••••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-agro-teal py-7 rounded-2xl font-black text-agro-midnight text-[11px] uppercase tracking-[0.5em] hover:shadow-teal-glow transition-all active:scale-95 disabled:opacity-50 mt-4"
                >
                  {loading ? "Sincronizando..." : "SOLICITAR MEMBRESÍA ➔"}
                </button>
              </form>

              <div className="mt-12 text-center pt-8 border-t border-white/5">
                <p className="text-agro-cream/20 text-[10px] font-black uppercase tracking-widest italic">
                   ¿Ya posee credenciales? <Link to="/login" className="text-agro-teal hover:text-white transition underline underline-offset-8 decoration-agro-teal/30">Acceder al Terminal</Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}