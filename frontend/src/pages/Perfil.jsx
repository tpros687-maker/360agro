import { useEffect, useState } from "react";
import API from "../api/userApi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ProfileSkeleton } from "../components/Skeleton";

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: userData } = await API.get("/users/perfil");

        setUsuario(userData);
        setForm({ nombre: userData.nombre, email: userData.email });

        // Lotes y mensajes (el interceptor inyecta el token)
        const { data: lotesData } = await API.get("/lots/mis-lotes");
        setLotes(lotesData);

        const { data: mensajesData } = await API.get("/mensajes/recibidos");
        setMensajes(mensajesData);
      } catch (error) {
        console.error("❌ Error al cargar perfil:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          toast.error("SESIÓN EXPIRADA. REINGRESE CREDENCIALES.");
          navigate("/login");
        }
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchData();
  }, [navigate]);

  const handleGuardar = async () => {
    try {
      await API.put("/users/perfil", { nombre: form.nombre, email: form.email });
      setEditando(false);
      toast.success("PERFIL ACTUALIZADO");
    } catch (error) {
      console.error("❌ Error al actualizar perfil:", error);
      toast.error("ERROR EN LA CONSOLIDACIÓN DE CREDENCIALES");
    }
  };

  if (loading) {
    return (
      <div className="bg-agro-midnight min-h-screen pt-32 px-6">
        <div className="container mx-auto max-w-4xl">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (!usuario) return null;

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-agro-teal/5 blur-[200px] pointer-events-none opacity-30 -mr-40 -mt-40"></div>

      <div className="container mx-auto max-w-4xl relative z-10 reveal-delayed">

        <header className="mb-16 reveal border-b border-white/5 pb-12">
          <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Identidad de Usuario</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none">
              PERFIL <br /><span className="text-agro-teal not-italic font-black">PRIVATE</span>
            </h1>
            <div className="flex items-center gap-6 bg-agro-charcoal/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="w-16 h-16 bg-agro-teal/10 rounded-xl flex items-center justify-center text-3xl shadow-inner">
                👤
              </div>
              <div>
                <p className="text-white font-black text-xl italic tracking-tighter uppercase leading-none mb-1">{usuario.nombre}</p>
                <p className="text-agro-cream/20 text-[9px] font-black uppercase tracking-widest">{usuario.email}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* GESTIÓN DE CREDENCIALES (8 COLS) */}
          <section className="lg:col-span-8 space-y-12">
            <div className="card-midnight p-10 bg-agro-charcoal">
              <div className="flex items-center gap-6 mb-10">
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap text-agro-teal">Parámetros de Cuenta</h2>
                <div className="h-[1px] bg-white/5 flex-1"></div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Nombre Completo</label>
                  <input
                    type="text"
                    value={form.nombre}
                    disabled={!editando}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className={`w-full bg-agro-midnight border px-6 py-4 rounded-xl outline-none transition-all duration-500 font-bold text-white shadow-inner ${editando ? "border-agro-teal/50" : "border-white/5 opacity-50 cursor-not-allowed"
                      }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Dirección de Enlace (Email)</label>
                  <input
                    type="email"
                    value={form.email}
                    disabled={!editando}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full bg-agro-midnight border px-6 py-4 rounded-xl outline-none transition-all duration-500 font-bold text-white shadow-inner ${editando ? "border-agro-teal/50" : "border-white/5 opacity-50 cursor-not-allowed"
                      }`}
                  />
                </div>

                <div className="pt-6">
                  {editando ? (
                    <button
                      onClick={handleGuardar}
                      className="btn-emerald w-full py-5 text-[10px]"
                    >
                      💾 CONSOLIDAR CAMBIOS
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditando(true)}
                      className="w-full py-5 bg-white/5 text-white font-black rounded-xl border border-white/5 hover:bg-white/10 transition-all uppercase tracking-widest text-[10px]"
                    >
                      ✏️ RECONFIGURAR PERFIL
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* STATUS DE MEMBRESÍA */}
            <div className="card-midnight p-10 bg-gradient-to-br from-agro-charcoal to-agro-midnight border-agro-teal/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-agro-teal shadow-teal-glow rounded-3xl flex items-center justify-center text-4xl transform -rotate-12 group-hover:rotate-0 transition duration-700">
                    {usuario.plan === "pro" ? "⭐" : usuario.plan === "empresa" ? "🏢" : "🆓"}
                  </div>
                  <div>
                    <p className="text-agro-cream/20 text-[10px] font-black uppercase tracking-widest mb-1">Membresía Activa</p>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{usuario.plan || "Gratis"}</h3>
                  </div>
                </div>
                <Link
                  to="/planes"
                  className="px-8 py-4 bg-agro-midnight text-agro-teal font-black rounded-xl border border-agro-teal/20 hover:bg-agro-teal hover:text-white transition-all duration-500 uppercase tracking-widest text-[9px] shadow-inner"
                >
                  Optimizar Plan ➔
                </Link>
              </div>
            </div>
          </section>

          {/* MÉTRICAS DE ACTIVIDAD (4 COLS) */}
          <section className="lg:col-span-4 space-y-12">
            <div className="card-midnight p-10 bg-agro-midnight border-white/5 shadow-inner">
              <h3 className="text-lg font-black text-white italic tracking-tighter uppercase mb-10">Métricas de Red</h3>

              <div className="space-y-10">
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:bg-agro-teal group-hover:text-white transition-all duration-500 shadow-inner">🐄</div>
                  <div>
                    <p className="text-[9px] font-black text-agro-cream/20 uppercase tracking-widest mb-1">Activos</p>
                    <p className="text-white font-black italic tracking-tighter text-2xl leading-none">{lotes.length}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:bg-agro-teal group-hover:text-white transition-all duration-500 shadow-inner">✉️</div>
                  <div>
                    <p className="text-[9px] font-black text-agro-cream/20 uppercase tracking-widest mb-1">Feedback</p>
                    <p className="text-white font-black italic tracking-tighter text-2xl leading-none">{mensajes.length}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:bg-agro-teal group-hover:text-white transition-all duration-500 shadow-inner">⚡</div>
                  <div>
                    <p className="text-[9px] font-black text-agro-cream/20 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-agro-teal font-black italic tracking-tighter text-sm uppercase leading-none">Verificado</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-white/5 text-center px-4">
                <p className="text-[9px] font-black text-agro-cream/10 uppercase tracking-[0.3em] leading-relaxed">
                  "Su identidad digital es su mayor activo en el mercado 360 Agro."
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
