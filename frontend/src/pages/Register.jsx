import { useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { UserPlus, Mail, Lock, ShieldCheck, CheckCircle2, Sparkles } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    plan: "observador"
  });
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tId = toast.loading("Registrando nuevo socio en la red...");

    try {
      const { data } = await api.post("/users/register", formData);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        _id: data._id, nombre: data.nombre,
        email: data.email, plan: data.plan
      }));
      setExito(true);
      toast.success("MEMBRESÍA GENERADA", { id: tId });
      setTimeout(() => navigate("/verificar-email"), 1000);
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al procesar el registro";
      toast.error(msg, { id: tId });
    } finally {
      setLoading(false);
    }
  };

  if (exito) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center text-center px-6 selection:bg-primary-container selection:text-on-primary-container">
        <div className="space-y-12">
          <div className="w-32 h-32 machined-gradient rounded-full flex items-center justify-center text-on-tertiary-fixed mx-auto shadow-[0_0_30px_rgba(63,111,118,0.5)] animate-bounce">
            <span className="material-symbols-outlined text-6xl">check_circle</span>
          </div>
          <h2 className="text-7xl font-black text-on-surface italic tracking-tighter uppercase leading-none glow-text">
            SOLICITUD <br /> <span className="text-primary">PROCESADA</span>
          </h2>
          <p className="text-on-surface-variant text-[12px] font-bold uppercase tracking-[0.6em] italic opacity-40">
            "Sincronizando terminal de acceso seguro..."
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-6 py-32 relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Luces de fondo cinemáticas */}
      <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-primary/5 rounded-full blur-[250px] pointer-events-none opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] pointer-events-none opacity-30"></div>

      <div className="w-full max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">

          {/* COLUMNA DE MARCA E INFO */}
          <div className="lg:w-1/2 space-y-16">
            <header>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-0.5 machined-gradient shadow-[0_0_10px_rgba(63,111,118,0.4)]"></div>
                <span className="text-primary font-bold text-[12px] uppercase tracking-[0.8em] block italic">Ecosistema Soberano 360</span>
              </div>
              <h1 className="text-7xl md:text-[9.5rem] font-black text-on-surface italic tracking-tighter leading-[0.8] uppercase glow-text">
                ÚNETE A LA <br />
                <span className="text-primary not-italic">RED LÍDER</span>
              </h1>
            </header>

            <p className="text-on-surface-variant text-2xl leading-relaxed italic border-l-4 border-primary/20 pl-10 max-w-2xl uppercase tracking-[0.1em] font-medium opacity-60">
              "ACCEDA A UNA INFRAESTRUCTURA DE NEGOCIOS DISEÑADA PARA LA MÁXIMA PERFORMANCE AGROPECUARIA."
            </p>

            <div className="grid grid-cols-1 gap-10 pt-8">
              {[
                { text: "Certificación de Activos Corporativos", icon: "verified" },
                { text: "Conectividad Estratégica Soberana", icon: "hub" },
                { text: "Protocolos de Seguridad de Elite", icon: "lock" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 font-bold uppercase text-[10px] tracking-[0.4em] text-on-surface-variant/40 group cursor-default">
                  <div className="w-14 h-14 rounded-[1.5rem] bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/60 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-500 shadow-xl">
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* FORMULARIO DE REGISTRO */}
          <div className="lg:w-5/12 w-full lg:ml-auto">
            <div className="bg-surface-container-high border border-outline-variant/60 p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-1.5 machined-gradient opacity-50"></div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] ml-6 italic opacity-80">Identidad de la Terminal</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 text-xl">account_circle</span>
                      <input
                        type="text"
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 pl-14 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none text-on-surface font-bold transition-all shadow-inner text-base placeholder:text-on-surface-variant/10 italic uppercase tracking-widest"
                        placeholder="EJ: ESTABLECIMIENTO PLATINUM"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] ml-6 italic opacity-80">Canal Operativo (Email)</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 text-xl">mail</span>
                      <input
                        type="email"
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 pl-14 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none text-on-surface font-bold transition-all shadow-inner text-base placeholder:text-on-surface-variant/10 italic uppercase tracking-widest"
                        placeholder="NODO@360AGRO.COM"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] ml-6 italic opacity-80">Clave de Acceso Blindada</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 text-xl">lock</span>
                      <input
                        type="password"
                        className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-6 pl-14 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none text-on-surface font-bold transition-all shadow-inner text-base placeholder:text-on-surface-variant/10 italic"
                        placeholder="••••••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="machined-gradient w-full py-6 rounded-full font-black text-on-tertiary-fixed text-[11px] uppercase tracking-[0.5em] shadow-xl hover:scale-[1.03] transition-all active:scale-95 disabled:opacity-50 mt-4 italic"
                >
                  {loading ? "Sincronizando Red..." : <>SOLICITAR ALTA <span className="material-symbols-outlined text-sm">arrow_forward</span></>}
                </button>
              </form>

              <div className="mt-16 text-center pt-10 border-t border-outline-variant/60">
                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest italic opacity-40">
                  ¿Ya posee una terminal activa? <br />
                  <Link to="/login" className="text-primary mt-4 inline-block hover:text-on-surface transition-all underline underline-offset-[10px] font-bold text-[11px]">Acceder al Nodo Central</Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
