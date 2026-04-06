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
    Zap
} from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [usuarios, setUsuarios] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [adminSettings, setAdminSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("stats");

    const [chat, setChat] = useState([]);

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

    const handleToggleVerificacion = async (userId) => {
        try {
            const { data } = await api.patch(`/admin/users/${userId}/verificar`);
            toast.success(data.mensaje);
            setUsuarios(usuarios.map(u => u._id === userId ? { ...u, esVerificado: data.esVerificado } : u));
        } catch (error) {
            toast.error("Error al actualizar verificación");
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
        <div className="bg-agro-midnight min-h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-agro-teal shadow-teal-glow"></div>
        </div>
    );

    return (
        <div className="bg-agro-midnight min-h-screen pt-32 pb-20 px-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-agro-teal/5 blur-[200px] pointer-events-none"></div>

            <div className="container mx-auto">
                {/* HEADER MISSION CONTROL */}
                <header className="mb-16 border-b border-white/5 pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div className="reveal">
                        <div className="flex items-center gap-3 mb-4">
                            <Terminal className="w-5 h-5 text-agro-teal" />
                            <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] italic">System Administrator</span>
                        </div>
                        <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                            MISSION <span className="text-agro-teal not-italic">CONTROL</span>
                        </h1>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab("stats")}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'stats' ? 'bg-agro-teal text-agro-midnight shadow-teal-glow' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                        >
                            Monitor Global
                        </button>
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-agro-teal text-agro-midnight shadow-teal-glow' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                        >
                            Usuarios
                        </button>
                        <button
                            onClick={() => setSolicitudes([])} // Placeholder/Clear if needed
                            className="hidden"
                        ></button>
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'bg-agro-teal text-agro-midnight shadow-teal-glow' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                        >
                            Ajustes Web
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
                        <div className="bg-agro-charcoal/40 border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-widest italic">Usuario</th>
                                        <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-widest italic">Plan Actual</th>
                                        <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-widest italic">Agro-Trust</th>
                                        <th className="p-8 text-[10px] font-black text-white/40 uppercase tracking-widest italic text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {usuarios.map(u => (
                                        <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-8">
                                                <p className="text-white font-black uppercase italic tracking-tighter text-lg">{u.nombre}</p>
                                                <p className="text-white/20 text-[10px] font-medium">{u.email}</p>
                                            </td>
                                            <td className="p-8">
                                                <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${u.plan === 'gratis' ? 'text-white/20 border-white/5' : 'text-agro-teal border-agro-teal/20 shadow-teal-glow-sm'}`}>
                                                    {u.plan}
                                                </span>
                                            </td>
                                            <td className="p-8">
                                                {u.esVerificado ? (
                                                    <div className="flex items-center gap-2 text-agro-teal font-black text-[9px] uppercase italic">
                                                        <CheckCircle className="w-4 h-4" /> Certificado
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-white/10 font-black text-[9px] uppercase italic">
                                                        <XCircle className="w-4 h-4" /> Sin Validar
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-8 text-right">
                                                <button
                                                    onClick={() => handleToggleVerificacion(u._id)}
                                                    className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${u.esVerificado ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-agro-teal text-agro-midnight shadow-teal-glow hover:scale-105'}`}
                                                >
                                                    {u.esVerificado ? "Retirar Verificación" : "Verificar Ahora"}
                                                </button>
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
                                <div key={s._id} className="bg-agro-charcoal/40 border border-white/5 p-12 rounded-[3.5rem] backdrop-blur-md flex flex-col justify-between group hover:border-agro-teal/30 transition-all duration-500 shadow-2xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-agro-teal/5 blur-3xl -mr-10 -mt-10"></div>

                                    <div>
                                        <div className="flex justify-between items-start mb-10">
                                            <div>
                                                <span className="text-[10px] font-black text-agro-teal uppercase tracking-[0.5em] mb-3 block italic">Solicitud de Activación</span>
                                                <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{s.usuario?.nombre}</h3>
                                            </div>
                                            <div className="bg-agro-teal text-agro-midnight p-3 rounded-2xl shadow-teal-glow">
                                                <Zap className="w-6 h-6 animate-pulse" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 mb-12">
                                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                                <p className="text-[9px] font-black text-white/20 uppercase mb-2">Plan Solicitado</p>
                                                <p className="text-2xl font-black text-agro-sky italic uppercase">{s.planSolicitado}</p>
                                            </div>
                                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                                <p className="text-[9px] font-black text-white/20 uppercase mb-2">Plan Actual</p>
                                                <p className="text-2xl font-black text-white/40 italic uppercase">{s.usuario?.plan}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleAprobarSub(s._id)}
                                        className="w-full bg-agro-teal text-agro-midnight font-black py-7 rounded-2xl text-[12px] uppercase tracking-[0.4em] shadow-teal-glow hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        APROBAR Y ACTIVAR ACCESO
                                    </button>
                                </div>
                            )) : (
                                <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-[4rem]">
                                    <p className="text-white/10 text-xl font-black uppercase tracking-[0.5em] italic">No hay solicitudes pendientes de activación</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="max-w-4xl mx-auto">
                            <form onSubmit={handleUpdateSettings} className="bg-agro-charcoal/40 border border-white/5 p-12 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-10 border-l-4 border-agro-teal pl-8">Configuración Maestra</h3>

                                <div className="space-y-16">
                                    {["general", "home", "mapa", "ia"].map(cat => (
                                        <div key={cat} className="space-y-8">
                                            <h4 className="text-agro-teal font-black uppercase tracking-[0.6em] text-[11px] border-b border-agro-teal/20 pb-4 mb-8 italic">{cat} - operational_layer</h4>
                                            <div className="space-y-10 pl-4 border-l border-white/5">
                                                {adminSettings.filter(s => s.category === cat).map(s => (
                                                    <div key={s.key} className="flex flex-col gap-4">
                                                        <label className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] ml-4 italic group-hover:text-agro-teal transition-colors">{s.label || s.key}</label>
                                                        {s.type === "textarea" ? (
                                                            <textarea
                                                                value={s.value}
                                                                onChange={(e) => handleSettingChange(s.key, e.target.value)}
                                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-[11px] outline-none focus:border-agro-teal/40 transition-all font-bold min-h-[100px]"
                                                            />
                                                        ) : (
                                                            <input
                                                                type={s.type || "text"}
                                                                value={s.value}
                                                                onChange={(e) => handleSettingChange(s.key, e.target.value)}
                                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-[11px] outline-none focus:border-agro-teal/40 transition-all font-bold"
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
                                    className="w-full bg-agro-teal text-agro-midnight font-black py-7 rounded-2xl text-[12px] uppercase tracking-[0.4em] shadow-teal-glow mt-16 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    SINCRONIZAR TERMINAL CORE ➔
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
        <div className="bg-agro-charcoal/40 border border-white/5 p-10 rounded-[3.5rem] backdrop-blur-md hover:border-agro-teal/20 transition-all shadow-2xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl -mr-10 -mt-10 bg-agro-${color === 'teal' ? 'teal' : 'ocean'}`}></div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-white/10 text-agro-${color === 'teal' ? 'teal' : 'sky'} bg-white/5 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic mb-3">{label}</p>
            <p className="text-5xl font-black text-white italic tracking-tighter shadow-blue-accent">{value || 0}</p>
        </div>
    );
}
