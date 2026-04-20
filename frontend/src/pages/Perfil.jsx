import { useEffect, useState } from "react";
import API, { toggle2FA } from "../api/userApi";
import subscripcionApi from "../api/subscripcionApi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ProfileSkeleton } from "../components/Skeleton";

const ESTADOS_CANCELAR_VISIBLES = ["activa", "pendiente", null, undefined];

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [lotes, setLotes] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [editando, setEditando] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: userData } = await API.get("/users/perfil");

        setUsuario(userData);
        setForm({ nombre: userData.nombre, email: userData.email, telefono: userData.telefono || "" });

        // Lotes y mensajes (el interceptor inyecta el token)
        const { data: lotesData } = await API.get("/lots/mis-lotes");
        setLotes(lotesData);

        const { data: mensajesData } = await API.get("/mensajes/bandeja");
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

  const handleCancelarSuscripcion = async () => {
    setCancelando(true);
    try {
      const { data } = await subscripcionApi.cancelar();
      setUsuario((prev) => ({ ...prev, estadoSuscripcion: "cancelada" }));
      const fecha = data.proximaFechaCobro
        ? new Date(data.proximaFechaCobro).toLocaleDateString("es-UY")
        : null;
      toast.success(fecha ? `Plan activo hasta el ${fecha}` : "Suscripción cancelada");
      setModalCancelar(false);
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error al cancelar suscripción");
    } finally {
      setCancelando(false);
    }
  };

  const handleGuardar = async () => {
    try {
      await API.put("/users/perfil", { nombre: form.nombre, email: form.email, telefono: form.telefono });
      setEditando(false);
      toast.success("PERFIL ACTUALIZADO");
    } catch (error) {
      console.error("❌ Error al actualizar perfil:", error);
      toast.error("ERROR EN LA CONSOLIDACIÓN DE CREDENCIALES");
    }
  };

  const handleToggle2FA = async () => {
    try {
      const { data } = await toggle2FA();
      setUsuario((prev) => ({ ...prev, twoFactorEnabled: data.twoFactorEnabled }));
      toast.success(data.twoFactorEnabled ? "2FA activado" : "2FA desactivado");
    } catch {
      toast.error("Error al cambiar configuración 2FA");
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-32 px-6">
        <div className="container mx-auto max-w-4xl">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (!usuario) return null;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-UY") : null;
  const fechaInicioFmt = fmtDate(usuario.fechaInicioPlan);
  const proximaFechaFmt = fmtDate(usuario.proximaFechaCobro);

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">

      {/* Modal confirmación cancelar suscripción */}
      {modalCancelar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-surface-container-high border border-outline-variant/20 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black text-on-surface italic uppercase tracking-tighter mb-3">Cancelar Suscripción</h3>
            <p className="text-on-surface-variant/60 text-sm mb-2 leading-relaxed">
              ¿Estás seguro? Tu plan actual permanecerá activo hasta el fin del período ya pagado.
            </p>
            {usuario.proximaFechaCobro && (
              <p className="text-primary font-black text-sm uppercase tracking-wider mb-6">
                Activo hasta: {proximaFechaFmt}
              </p>
            )}
            <p className="text-on-surface-variant/40 text-xs mb-8 italic">Después pasarás automáticamente al plan Observador.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setModalCancelar(false)}
                className="flex-1 py-4 bg-surface-container text-on-surface-variant/60 hover:bg-surface-container-high rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Mantener plan
              </button>
              <button
                onClick={handleCancelarSuscripcion}
                disabled={cancelando}
                className="flex-1 py-4 bg-red-900/20 text-red-400 hover:bg-red-500 hover:text-white border border-red-900/30 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {cancelando ? "Cancelando..." : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[200px] pointer-events-none opacity-30 -mr-40 -mt-40"></div>

      <div className="container mx-auto max-w-4xl relative z-10 reveal-delayed">

        <header className="mb-8 reveal border-b border-outline-variant/70 pb-8">
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Identidad de Usuario</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <h1 className="text-3xl md:text-5xl font-black text-on-surface italic tracking-tighter leading-none">
              PERFIL <br /><span className="text-primary not-italic font-black">PRIVATE</span>
            </h1>
            <div className="flex items-center gap-6 bg-surface-container-high p-4 rounded-2xl border border-outline-variant/70 backdrop-blur-sm">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center shadow-inner text-primary">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
              <div>
                <p className="text-on-surface font-black text-xl italic tracking-tighter uppercase leading-none mb-1">{usuario.nombre}</p>
                <p className="text-on-surface-variant/40 text-[9px] font-black uppercase tracking-widest">{usuario.email}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* GESTIÓN DE CREDENCIALES (8 COLS) */}
          <section className="lg:col-span-8 space-y-12">
            <div className="bg-surface-container-high border border-outline-variant/70 rounded-[2rem] p-8">
              <div className="flex items-center gap-6 mb-10">
                <h2 className="text-xl font-black text-on-surface italic tracking-tighter uppercase whitespace-nowrap text-primary">Parámetros de Cuenta</h2>
                <div className="h-[1px] bg-outline-variant/20 flex-1"></div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Nombre Completo</label>
                  <input
                    type="text"
                    value={form.nombre}
                    disabled={!editando}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className={`w-full bg-surface-container-lowest border px-6 py-4 rounded-xl outline-none transition-all duration-500 font-bold text-on-surface shadow-inner ${editando ? "border-primary/50" : "border-outline-variant/50 opacity-50 cursor-not-allowed"
                      }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Dirección de Enlace (Email)</label>
                  <input
                    type="email"
                    value={form.email}
                    disabled={!editando}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full bg-surface-container-lowest border px-6 py-4 rounded-xl outline-none transition-all duration-500 font-bold text-on-surface shadow-inner ${editando ? "border-primary/50" : "border-outline-variant/50 opacity-50 cursor-not-allowed"
                      }`}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">WhatsApp / Teléfono</label>
                  <input
                    type="tel"
                    value={form.telefono}
                    disabled={!editando}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="+598 99 000 000"
                    className={`w-full bg-surface-container-lowest border px-6 py-4 rounded-xl outline-none transition-all duration-500 font-bold text-on-surface shadow-inner ${editando ? "border-primary/50" : "border-outline-variant/50 opacity-50 cursor-not-allowed"
                      }`}
                  />
                </div>

                <div className="flex items-center justify-between py-4 border-t border-outline-variant/20">
                  <div>
                    <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Verificación en dos pasos (2FA)</p>
                    <p className="text-[10px] text-on-surface-variant/30 ml-2 mt-0.5">Recibís un código por email al iniciar sesión</p>
                  </div>
                  <button
                    onClick={handleToggle2FA}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${usuario.twoFactorEnabled ? "bg-primary" : "bg-outline-variant/40"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${usuario.twoFactorEnabled ? "translate-x-7" : "translate-x-1"}`} />
                  </button>
                </div>

                <div className="pt-6">
                  {editando ? (
                    <button
                      onClick={handleGuardar}
                      className="machined-gradient text-on-tertiary-fixed w-full py-5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">save</span> CONSOLIDAR CAMBIOS
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditando(true)}
                      className="w-full py-5 bg-background text-on-surface font-black rounded-full border border-outline-variant/70 hover:bg-surface-container-lowest transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span> RECONFIGURAR PERFIL
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* STATUS DE MEMBRESÍA */}
            <div className="bg-surface-container-high border border-outline-variant/70 rounded-[2rem] p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center text-4xl shadow-xl">
                    {usuario.plan === "pro" ? <span className="material-symbols-outlined">star</span> : usuario.plan === "empresa" ? <span className="material-symbols-outlined text-2xl">business</span> : "🆓"}
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${usuario.estadoSuscripcion === "cancelada" ? "text-red-400/70" : "text-on-surface-variant/40"}`}>
                      {usuario.estadoSuscripcion === "cancelada" ? "Membresía Cancelada" : "Membresía Activa"}
                    </p>
                    <h3 className="text-3xl font-black text-on-surface italic tracking-tighter uppercase">{usuario.plan || "Gratis"}</h3>
                    {usuario.estadoSuscripcion === "cancelada" && proximaFechaFmt ? (
                      <p className="text-xs text-amber-400/70 mt-1">Activo hasta el {proximaFechaFmt} · No se renovará</p>
                    ) : fechaInicioFmt && proximaFechaFmt ? (
                      <p className="text-xs text-on-surface-variant/50 mt-1">Activo del {fechaInicioFmt} al {proximaFechaFmt}</p>
                    ) : proximaFechaFmt ? (
                      <p className="text-xs text-on-surface-variant/50 mt-1">Activo hasta el {proximaFechaFmt}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    to="/planes"
                    className="px-8 py-4 bg-background text-primary font-black rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-all duration-500 uppercase tracking-widest text-[9px] text-center"
                  >
                    Optimizar Plan <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                  {ESTADOS_CANCELAR_VISIBLES.includes(usuario.estadoSuscripcion) && usuario.plan !== "observador" && (
                    <button
                      onClick={() => setModalCancelar(true)}
                      className="px-8 py-3 text-red-400/60 hover:text-red-400 font-black rounded-full border border-red-900/20 hover:border-red-900/40 transition-all text-[9px] uppercase tracking-widest"
                    >
                      Cancelar suscripción
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* FACTURACIÓN */}
            {usuario.plan !== "observador" && (
              <div className="bg-surface-container-high border border-outline-variant/70 rounded-[2rem] p-8">
                <div className="flex items-center gap-3 mb-8">
                  <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest">Facturación</p>
                  {usuario.estadoSuscripcion === "activa" && (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[9px] font-black uppercase tracking-widest">Activa</span>
                  )}
                  {usuario.estadoSuscripcion === "cancelada" && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[9px] font-black uppercase tracking-widest">
                      Cancelada{proximaFechaFmt ? ` — vence ${proximaFechaFmt}` : ""}
                    </span>
                  )}
                  {usuario.estadoSuscripcion === "pendiente" && (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-[9px] font-black uppercase tracking-widest">Pendiente</span>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-xl">{usuario.suscripcionId ? "credit_card" : "admin_panel_settings"}</span>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Medio de pago</p>
                      <p className="font-black text-on-surface">{usuario.suscripcionId ? "MercadoPago" : "Asignado por administrador"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-xl">calendar_today</span>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Inicio del plan</p>
                      <p className="font-black text-on-surface">{fechaInicioFmt ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-xl">event</span>
                    <div>
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{usuario.estadoSuscripcion === "cancelada" ? "Vence el" : "Vigencia"}</p>
                      <p className="font-black text-on-surface">{proximaFechaFmt ?? "Sin fecha definida"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* MÉTRICAS DE ACTIVIDAD (4 COLS) */}
          <section className="lg:col-span-4 space-y-12">
            <div className="bg-surface-container-high border border-outline-variant/70 rounded-[2rem] p-8 shadow-inner">
              <h3 className="text-lg font-black text-on-surface italic tracking-tighter uppercase mb-10 text-primary">Métricas de Red</h3>

              <div className="space-y-6">
                <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-background border border-outline-variant/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 text-primary shadow-sm">
                    <span className="material-symbols-outlined text-2xl">pets</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1 italic">Activos</p>
                    <p className="text-on-surface font-black italic tracking-tighter text-2xl leading-none">{lotes.length}</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-background border border-outline-variant/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 text-primary shadow-sm">
                    <span className="material-symbols-outlined text-2xl">mail</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1 italic">Feedback</p>
                    <p className="text-on-surface font-black italic tracking-tighter text-2xl leading-none">{mensajes.length}</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-background border border-outline-variant/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 text-primary shadow-sm">
                    <span className="material-symbols-outlined text-2xl">bolt</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1 italic">Status</p>
                    <p className="text-primary font-black italic tracking-tighter text-sm uppercase leading-none">Verificado</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-outline-variant/20 text-center px-4">
                <p className="text-[9px] font-black text-on-surface-variant/20 uppercase tracking-[0.3em] leading-relaxed italic">
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
