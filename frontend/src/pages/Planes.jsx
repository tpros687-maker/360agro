import PlanAPI from "../api/planApi";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { useState, useEffect, useContext } from "react";
import CheckoutSuscripcion from "../components/CheckoutSuscripcion";
import subscripcionApi from "../api/subscripcionApi";
import { CheckCircle2, ShieldCheck, Zap, Globe } from "lucide-react";

export default function Planes() {
  const { usuario, setUsuario } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [solicitudPendiente, setSolicitudPendiente] = useState(null);

  useEffect(() => {
    const cargarEstado = async () => {
      try {
        const { data } = await subscripcionApi.obtenerMiSolicitud();
        if (data) setSolicitudPendiente(data.planSolicitado);
      } catch (error) {
        console.log("Sin solicitudes pendientes.");
      }
    };
    cargarEstado();
  }, [usuario]);

  const handleActivar = async (p) => {
    if (p.key === "gratis") {
      const tId = toast.loading("Sincronizando membresía gratuita...");
      try {
        const { data } = await PlanAPI.actualizarPlan(p.key);
        const actualizado = { ...usuario, plan: data.usuario.plan };
        setUsuario(actualizado);
        localStorage.setItem("usuario", JSON.stringify(actualizado));
        toast.success("MEMBRESÍA ACTIVA: OBSERVADOR", { id: tId });
      } catch (error) {
        toast.error("Error al procesar", { id: tId });
      }
      return;
    }

    setPlanSeleccionado(p);
    setModalOpen(true);
  };

  const planes = [
    {
      nombre: "Observador",
      key: "gratis",
      precio: "FREE",
      desc: ["Navegación en el Radar", "Acceso a Precios de Referencia", "Búsqueda de Servicios"],
      icon: Globe,
    },
    {
      nombre: "Productor",
      key: "basico",
      precio: "USD 19",
      desc: ["Hasta 5 Lotes Activos", "5 Ofertas de Servicios", "Calculadora Agro Profit", "Mensajería Directa"],
      icon: Zap,
    },
    {
      nombre: "Élite Pro",
      key: "pro",
      precio: "USD 49",
      desc: ["Publicaciones Ilimitadas", "Agro Profit Ilimitado", "Prioridad en Búsquedas", "Sello de Confianza Pro", "Analíticas de Visitas"],
      icon: ShieldCheck,
      popular: true,
    },
    {
      nombre: "Business",
      key: "empresa",
      precio: "CONSULTAR",
      desc: ["Showroom Corporativo", "Gestión de Insumos (Tienda)", "Validación de Empresa", "Herramientas de Inteligencia", "Soporte VIP 24/7"],
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="bg-agro-midnight min-h-screen pt-48 pb-32 px-6 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-agro-ocean/5 blur-[250px] rounded-full pointer-events-none opacity-40"></div>

      <div className="container mx-auto max-w-7xl relative z-10">

        <header className="text-center mb-32 reveal">
          <span className="text-agro-sky font-black text-[11px] uppercase tracking-[0.8em] mb-4 block italic shadow-blue-accent">Escalabilidad de Negocio</span>
          <h1 className="text-8xl md:text-[9rem] font-black text-white italic tracking-tighter uppercase leading-none">
            MEMBRESÍAS <span className="text-agro-ocean not-italic">SOBERANAS</span>
          </h1>
          <p className="text-white/20 text-lg mt-12 font-bold uppercase tracking-[0.3em] italic max-w-3xl mx-auto leading-relaxed border-t border-white/5 pt-10">
            GESTIONE SU CRECIMIENTO ESTRATÉGICO CON ACCESO AI E INFRAESTRUCTURA DE ALTA TRACCIÓN COMERCIAL.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 items-stretch">
          {planes.map((p, index) => {
            const esActual = usuario?.plan?.toLowerCase() === p.key;
            const esPro = p.popular;
            const Icon = p.icon;

            return (
              <div
                key={p.key}
                className={`relative p-14 rounded-[4rem] border transition-all duration-700 reveal-delayed flex flex-col h-full group
                  ${esPro
                    ? "bg-agro-charcoal/60 border-agro-ocean shadow-blue-accent-lg scale-105 z-20 backdrop-blur-3xl"
                    : "bg-white/5 border-white/10 hover:border-agro-ocean/30"} 
                  ${esActual ? "opacity-100" : "opacity-90 hover:opacity-100 disabled:opacity-50"}`}
              >
                {esPro && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-agro-navy px-10 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl italic border border-agro-sky/30">
                    Recomendación Pro
                  </div>
                )}

                <div className="mb-14 text-center">
                  <div className={`w-20 h-20 rounded-[2rem] mx-auto mb-10 flex items-center justify-center border shadow-2xl transition-all duration-500
                    ${esPro ? "bg-agro-ocean text-white border-white/20" : "bg-white/5 text-agro-sky/40 border-white/10 group-hover:bg-agro-ocean group-hover:text-white"}`}>
                    <Icon className="w-10 h-10 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className={`text-3xl font-black uppercase italic tracking-tighter mb-6 ${esPro ? "text-white" : "text-white/60"}`}>
                    {p.nombre}
                  </h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className={`text-6xl font-black italic tracking-tighter ${esPro ? "text-white text-glow-blue" : "text-white"}`}>
                      {p.precio}
                    </span>
                    {p.precio !== "FREE" && p.precio !== "CONSULTAR" && <span className="text-[11px] text-white/20 font-black uppercase tracking-[0.4em] ml-2 italic">/ mes</span>}
                  </div>
                </div>

                <ul className="flex-1 space-y-8 mb-20 px-4">
                  {p.desc.map((d, idx) => (
                    <li key={idx} className="flex items-start gap-5">
                      <CheckCircle2 className={`w-5 h-5 mt-0.5 ${esPro ? "text-agro-sky shadow-blue-accent" : "text-white/10"}`} />
                      <span className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] leading-relaxed italic group-hover:text-white/60 transition-colors">
                        {d}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleActivar(p)}
                  disabled={esActual || solicitudPendiente === p.key}
                  className={`w-full py-7 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.5em] transition-all hover:scale-[1.05] active:scale-95 shadow-2xl
                    ${esActual
                      ? "bg-white/5 text-white/10 border border-white/5 cursor-default"
                      : (solicitudPendiente === p.key)
                        ? "bg-agro-charcoal border border-agro-ocean/20 text-agro-sky/40 cursor-wait"
                        : esPro
                          ? "bg-white text-agro-navy hover:bg-agro-sky"
                          : "bg-agro-navy border border-white/10 text-white hover:bg-agro-ocean hover:border-agro-ocean"}`}
                >
                  {esActual ? "Estatus Actual" : (solicitudPendiente === p.key) ? "Sincronizando..." : "Activar Terminal"}
                </button>
              </div>
            );
          })}
        </div>

        <CheckoutSuscripcion
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          plan={planSeleccionado}
          onSuccess={(key) => setSolicitudPendiente(key)}
        />

        <div className="mt-40 text-center">
          <p className="text-[11px] font-black text-white/5 uppercase tracking-[1.5em] italic">
            Certificación de Transacciones Soberanas
          </p>
        </div>
      </div>
    </div>
  );
}
