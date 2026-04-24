import { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { toast } from "react-hot-toast";
import {
    Activity,
    Users,
    ShieldCheck,
    CreditCard,
    CheckCircle,
    XCircle,
    Terminal,
    Zap,
    KeyRound
} from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [adminSettings, setAdminSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("stats");

    const [chat, setChat] = useState([]);
    const [codigos, setCodigos] = useState([]);
    const [genEmail, setGenEmail] = useState("");
    const [genPlan, setGenPlan] = useState("productor");
    const [genPeriodo, setGenPeriodo] = useState("mensual");
    const [generando, setGenerando] = useState(false);

    useEffect(() => {
        const fetchWelcome = async () => {
            try {
                const { data } = await api.get("/settings");
                setChat([
                    {
                        role: "ia",
                        text: data.ai_welcome_msg || "Bienvenido a la Central de Inteligencia de 360 Agro Elite. Soy su consultor analítico. Estoy capacitado para optimizar su estrategia comercial, gestionar activos complejos y navegar nuestro ecosistema de alta performance. ¿Qué terminal operativa desea iniciar?"
                    }
                ]);
            } catch (error) {
                setChat([{ role: "ia", text: "Conexión con terminal de IA establecida. ¿Cómo puedo ayudarle?" }]);
            }
        };
        fetchWelcome();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [resStats, resUsers, resSubs, resSettings] = await Promise.all([
                api.get("/admin/stats"),
                api.get("/admin/users"),
                api.get("/admin/subscripciones"),
                api.get("/admin/settings")
            ]);
            setStats(resStats.data);
            setUsuarios(resUsers.data);
            setSolicitudes(resSubs.data);
            setAdminSettings(resSettings.data);
        } catch (error) {
            console.error("Error al cargar datos admin:", error);
            toast.error("Error al sincronizar con la terminal central");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        if (activeTab === "codigos") cargarCodigos();
    }, [activeTab]);

    const handleCambiarPlan = async (userId, nuevoPlan) => {
        try {
            await api.patch(`/admin/users/${userId}/plan`, { plan: nuevoPlan });
            toast.success("Plan actualizado");
            setUsuarios(usuarios.map(u => u._id === userId ? { ...u, plan: nuevoPlan } : u));
        } catch (error) {
            toast.error("Error al cambiar plan");
        }
    };

    const handleEliminarUsuario = async (userId, nombre) => {
        if (!window.confirm(`¿Eliminar usuario "${nombre}"? Esta acción no se puede deshacer.`)) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            toast.success("Usuario eliminado");
            setUsuarios(usuarios.filter(u => u._id !== userId));
        } catch (error) {
            toast.error("Error al eliminar usuario");
        }
    };

    const handleToggleVerificacion = async (userId) => {
        try {
            const { data } = await api.patch(`/admin/users/${userId}/verificar`);
            toast.success(data.mensaje);
            setUsuarios(usuarios.map(u => u._id === userId ? { ...u, esVerificado: data.esVerificado } : u));
        } catch (error) {
            toast.error("Error al actualizar verificación");
        }
    };

    const cargarCodigos = async () => {
        try {
            const { data } = await api.get("/codigos");
            setCodigos(data);
        } catch {
            toast.error("Error al cargar códigos");
        }
    };

    const handleGenerarCodigo = async (e) => {
        e.preventDefault();
        if (!genEmail.trim()) return toast.error("Ingresá un email");
        setGenerando(true);
        try {
            const { data } = await api.post("/codigos/generar", { plan: genPlan, periodo: genPeriodo, emailDestino: genEmail });
            toast.success(`Código ${data.codigo} enviado a ${genEmail}`);
            setGenEmail("");
            cargarCodigos();
        } catch (err) {
            toast.error(err.response?.data?.mensaje || "Error al generar código");
        } finally {
            setGenerando(false);
        }
    };

    const handleAprobarSub = async (subId) => {
        try {
            const { data } = await api.patch(`/admin/subscripciones/${subId}/aprobar`);
            toast.success(data.mensaje);
            setSolicitudes(solicitudes.filter(s => s._id !== subId));
            cargarDatos(); // Recargamos para ver planes actualizados
        } catch (error) {
            toast.error("Error al aprobar subscripción");
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            const settingsToUpdate = adminSettings.map(s => ({ key: s.key, value: s.value }));
            const { data } = await api.patch("/admin/settings", { settings: settingsToUpdate });
            toast.success(data.mensaje);
        } catch (error) {
            toast.error("Error al guardar cambios");
        }
    };

    const handleSettingChange = (key, value) => {
        setAdminSettings(adminSettings.map(s => s.key === key ? { ...s, value } : s));
    };

    if (loading) return (
        <div className="bg-background min-h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary shadow-xl"></div>
        </div>
    );

    return (
        <div className="bg-background min-h-screen pt-24 pb-20 px-6 text-on-surface overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[200px] pointer-events-none opacity-40"></div>

            <div className="container mx-auto">
                {/* HEADER MISSION CONTROL */}
                <header className="mb-8 border-b border-outline-variant/60 pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="reveal">
                        <div className="flex items-center gap-3 mb-4">
                            <Terminal className="w-5 h-5 text-primary" />
                            <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] italic">System Administrator</span>
                        </div>
                        <h1 className="text-4xl font-black text-on-surface italic tracking-tighter uppercase leading-none">
                            MISSION <span className="text-primary not-italic">CONTROL</span>
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab("stats")}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-primary text-white shadow-xl' : 'bg-surface-container text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container-high'}`}
                        >
                            Monitor Global
                        </button>
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-xl' : 'bg-surface-container text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container-high'}`}
                        >
                            Usuarios
                        </button>
                        <button
                            onClick={() => setActiveTab("subs")}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'subs' ? 'bg-primary text-white shadow-xl' : 'bg-surface-container text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container-high'}`}
                        >
                            Suscripciones
                        </button>
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-xl' : 'bg-surface-container text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container-high'}`}
                        >
                            Ajustes Web
                        </button>
                        <button
                            onClick={() => setActiveTab("codigos")}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'codigos' ? 'bg-primary text-white shadow-xl' : 'bg-surface-container text-on-surface-variant border border-outline-variant/60 hover:bg-surface-container-high'}`}
                        >
                            Códigos
                        </button>
                    </div>
                </header>

                {/* CONTENIDO DINÁMICO */}
                <div className="animate-reveal">
                    {activeTab === "stats" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <StatCard icon={<Users />} label="Cuentas Totales" value={stats?.totalUsers} color="teal" />
                            <StatCard icon={<Activity />} label="Activos en Mercado" value={stats?.totalLotes + stats?.totalProductos} color="sky" />
                            <StatCard icon={<ShieldCheck />} label="Tiendas Certificadas" value={stats?.totalProveedores} color="ocean" />
                            <StatCard icon={<CreditCard />} label="Pendientes de Cobro" value={stats?.subPendientes} color="red" />
                        </div>
                    )}

                    {activeTab === "users" && (
                        <div className="bg-surface-container-high border border-outline-variant/60 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-outline-variant/60 bg-surface-container-low">
                                        <th className="p-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Usuario</th>
                                        <th className="p-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Plan Actual</th>
                                        <th className="p-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Agro-Trust</th>
                                        <th className="p-8 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant/30">
                                    {usuarios.map(u => (
                                        <tr key={u._id} className="hover:bg-surface-container-lowest/40 transition-colors group">
                                            <td className="p-8">
                                                <p className="text-on-surface font-black uppercase italic tracking-tighter text-lg">{u.nombre}</p>
                                                <p className="text-on-surface-variant/40 text-[10px] font-medium">{u.email}</p>
                                            </td>
                                            <td className="p-8">
                                                <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${u.plan === 'gratis' ? 'text-on-surface-variant/20 border-outline-variant/10' : 'text-primary border-primary/20 shadow-sm'}`}>
                                                    {u.plan}
                                                </span>
                                            </td>
                                            <td className="p-8">
                                                {u.esVerificado ? (
                                                    <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase italic">
                                                        <CheckCircle className="w-4 h-4" /> Certificado
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-on-surface-variant/20 font-black text-[9px] uppercase italic">
                                                        <XCircle className="w-4 h-4" /> Sin Validar
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-8 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <select
                                                        value={u.plan}
                                                        onChange={(e) => handleCambiarPlan(u._id, e.target.value)}
                                                        className="bg-surface-container-lowest border border-outline-variant/50 text-on-surface text-[9px] font-black uppercase rounded-xl px-3 py-2 outline-none focus:border-primary/40 transition-all cursor-pointer shadow-sm"
                                                    >
                                                        {["gratis", "observador", "productor", "pro", "empresa"].map(p => (
                                                            <option key={p} value={p} className="bg-surface-container text-on-surface">{p}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => handleToggleVerificacion(u._id)}
                                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${u.esVerificado ? 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high' : 'machined-gradient text-on-tertiary-fixed shadow-md hover:scale-105'}`}
                                                    >
                                                        {u.esVerificado ? "Retirar" : "Verificar"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminarUsuario(u._id, u.nombre)}
                                                        className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-surface-container text-red-500/60 hover:bg-red-500/10 hover:text-red-500 transition-all border border-outline-variant/60"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                     {activeTab === "subs" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {solicitudes.length > 0 ? solicitudes.map(s => (
                                <div key={s._id} className="bg-surface-container-high border border-outline-variant/60 p-12 rounded-[3.5rem] backdrop-blur-md flex flex-col justify-between group hover:border-primary/30 transition-all duration-500 shadow-2xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-10 -mt-10"></div>

                                    <div>
                                        <div className="flex justify-between items-start mb-10">
                                            <div>
                                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-3 block italic">Solicitud de Activación</span>
                                                <h3 className="text-4xl font-black text-on-surface italic tracking-tighter uppercase leading-none">{s.usuario?.nombre}</h3>
                                            </div>
                                            <div className="machined-gradient text-on-tertiary-fixed p-3 rounded-2xl shadow-xl">
                                                <Zap className="w-6 h-6 animate-pulse" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 mb-12">
                                            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30">
                                                <p className="text-[9px] font-black text-on-surface-variant/40 uppercase mb-2 italic">Plan Solicitado</p>
                                                <p className="text-2xl font-black text-primary italic uppercase">{s.planSolicitado}</p>
                                            </div>
                                            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30">
                                                <p className="text-[9px] font-black text-on-surface-variant/40 uppercase mb-2 italic">Plan Actual</p>
                                                <p className="text-2xl font-black text-on-surface-variant/40 italic uppercase">{s.usuario?.plan}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleAprobarSub(s._id)}
                                        className="w-full machined-gradient text-on-tertiary-fixed font-black py-7 rounded-2xl text-[12px] uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all italic"
                                    >
                                        APROBAR Y ACTIVAR ACCESO
                                    </button>
                                </div>
                            )) : (
                                <div className="col-span-full py-40 text-center border-2 border-dashed border-outline-variant/30 rounded-[4rem]">
                                    <p className="text-on-surface-variant/10 text-xl font-black uppercase tracking-[0.5em] italic">No hay solicitudes pendientes de activación</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "codigos" && (
                        <div className="max-w-4xl mx-auto space-y-10">
                            {/* Generador */}
                            <form onSubmit={handleGenerarCodigo} className="bg-surface-container-high border border-outline-variant/60 p-12 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl">
                                <div className="flex items-center gap-4 mb-10">
                                    <KeyRound className="w-6 h-6 text-primary" />
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-on-surface">Generar Código de Activación</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="md:col-span-3">
                                        <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic block mb-3">Email del usuario</label>
                                        <input
                                            type="email"
                                            value={genEmail}
                                            onChange={e => setGenEmail(e.target.value)}
                                            placeholder="usuario@email.com"
                                            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl px-6 py-5 text-on-surface text-[11px] font-bold outline-none focus:border-primary/40 transition-all shadow-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic block mb-3">Plan</label>
                                        <select
                                            value={genPlan}
                                            onChange={e => setGenPlan(e.target.value)}
                                            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl px-6 py-5 text-on-surface text-[11px] font-bold outline-none focus:border-primary/40 transition-all shadow-sm cursor-pointer"
                                        >
                                            {["productor", "pro", "empresa"].map(p => (
                                                <option key={p} value={p} className="bg-surface-container text-on-surface uppercase">{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic block mb-3">Período</label>
                                        <select
                                            value={genPeriodo}
                                            onChange={e => setGenPeriodo(e.target.value)}
                                            className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl px-6 py-5 text-on-surface text-[11px] font-bold outline-none focus:border-primary/40 transition-all shadow-sm cursor-pointer"
                                        >
                                            {["mensual", "trimestral", "anual"].map(p => (
                                                <option key={p} value={p} className="bg-surface-container text-on-surface">{p}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <button
                                            type="submit"
                                            disabled={generando}
                                            className="w-full machined-gradient text-on-tertiary-fixed font-black py-5 rounded-2xl text-[11px] uppercase tracking-[0.4em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all italic"
                                        >
                                            {generando ? "Enviando..." : "Generar y enviar"}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Listado */}
                            <div className="bg-surface-container-high border border-outline-variant/60 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-outline-variant/60 bg-surface-container-low">
                                            <th className="p-6 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Código</th>
                                            <th className="p-6 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Plan</th>
                                            <th className="p-6 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Email</th>
                                            <th className="p-6 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Estado</th>
                                            <th className="p-6 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic">Usado por</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/30">
                                        {codigos.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-20 text-center text-on-surface-variant/20 font-black uppercase tracking-widest italic text-sm">
                                                    Sin códigos generados
                                                </td>
                                            </tr>
                                        ) : codigos.map(c => (
                                            <tr key={c._id} className="hover:bg-surface-container-lowest/40 transition-colors">
                                                <td className="p-6 font-black tracking-widest text-primary text-sm">{c.codigo}</td>
                                                <td className="p-6 text-[10px] font-black uppercase text-on-surface-variant">{c.plan} · {c.periodo}</td>
                                                <td className="p-6 text-[10px] text-on-surface-variant/60">{c.emailDestino || "—"}</td>
                                                <td className="p-6">
                                                    <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border ${c.usado ? "text-on-surface-variant/30 border-outline-variant/20" : "text-primary border-primary/20"}`}>
                                                        {c.usado ? "Usado" : "Disponible"}
                                                    </span>
                                                </td>
                                                <td className="p-6 text-[10px] text-on-surface-variant/50">{c.usadoPor?.nombre || "—"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="max-w-4xl mx-auto">
                            <form onSubmit={handleUpdateSettings} className="bg-surface-container-high border border-outline-variant/60 p-12 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-10 border-l-4 border-primary pl-8 text-on-surface">Configuración Maestra</h3>

                                <div className="space-y-16">
                                    {["general", "home", "mapa", "ia"].map(cat => (
                                        <div key={cat} className="space-y-8">
                                            <h4 className="text-primary font-black uppercase tracking-[0.6em] text-[11px] border-b border-outline-variant/30 pb-4 mb-8 italic">{cat} - operational_layer</h4>
                                            <div className="space-y-10 pl-4 border-l border-outline-variant/30">
                                                {adminSettings.filter(s => s.category === cat).map(s => (
                                                    <div key={s.key} className="flex flex-col gap-4">
                                                        <label className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-[0.4em] ml-4 italic group-hover:text-primary transition-colors">{s.label || s.key}</label>
                                                        {s.type === "textarea" ? (
                                                            <textarea
                                                                value={s.value}
                                                                onChange={(e) => handleSettingChange(s.key, e.target.value)}
                                                                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl px-6 py-5 text-on-surface text-[11px] outline-none focus:border-primary/40 transition-all font-bold min-h-[100px] shadow-sm"
                                                            />
                                                        ) : (
                                                            <input
                                                                type={s.type || "text"}
                                                                value={s.value}
                                                                onChange={(e) => handleSettingChange(s.key, e.target.value)}
                                                                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-2xl px-6 py-5 text-on-surface text-[11px] outline-none focus:border-primary/40 transition-all font-bold shadow-sm"
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full machined-gradient text-on-tertiary-fixed font-black py-7 rounded-2xl text-[12px] uppercase tracking-[0.4em] shadow-xl mt-16 hover:scale-[1.02] active:scale-95 transition-all italic"
                                >
                                    SINCRONIZAR TERMINAL CORE <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className="bg-surface-container-high border border-outline-variant/60 p-5 rounded-[3.5rem] backdrop-blur-md hover:border-primary/20 transition-all shadow-2xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl -mr-10 -mt-10 ${color === 'teal' ? 'bg-primary' : 'bg-secondary'}`}></div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-outline-variant/50 ${color === 'teal' ? 'text-primary' : 'text-primary'} bg-surface-container-lowest group-hover:scale-110 transition-transform shadow-inner`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] italic mb-3">{label}</p>
            <p className="text-3xl font-black text-on-surface italic tracking-tighter">{value || 0}</p>
        </div>
    );
}
