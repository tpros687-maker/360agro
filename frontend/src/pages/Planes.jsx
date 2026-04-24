import PlanAPI from "../api/planApi";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import { useState, useEffect, useContext } from "react";
import CheckoutSuscripcion from "../components/CheckoutSuscripcion";
import subscripcionApi from "../api/subscripcionApi";
import api from "../api/axiosConfig";
import { CheckCircle2, ShieldCheck, Zap, Globe } from "lucide-react";
import SEO from "../components/SEO";

export default function Planes() {
  const { usuario, setUsuario } = useContext(AuthContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [solicitudPendiente, setSolicitudPendiente] = useState(null);
  const [periodo, setPeriodo] = useState("mensual");
  const [codigo, setCodigo] = useState("");
  const [activando, setActivando] = useState(false);

  useEffect(() => {
    const cargarEstado = async () => {
      try {
        const { data } = await subscripcionApi.obtenerMiSolicitud();
        if (data && data.planSolicitado) {
          const fechaSolicitud = new Date(data.fechaSolicitud);
          const ahora = new Date();
          const horas = (ahora - fechaSolicitud) / (1000 * 60 * 60);
          if (horas < 24) setSolicitudPendiente(data.planSolicitado);
        }
      } catch (error) {
        console.log("Sin solicitudes pendientes.");
      }
    };
    cargarEstado();
  }, [usuario]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pago = params.get("pago");
    if (pago === "ok") {
      toast.success("¡Pago recibido! Tu plan se activará en instantes.");
      refrescarUsuario();
      window.history.replaceState({}, "", "/planes");
    } else if (pago === "error") {
      toast.error("El pago no pudo procesarse. Intentá de nuevo.");
      window.history.replaceState({}, "", "/planes");
    }
  }, []);

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

    try {
      await api.delete("/subscripciones/mi-solicitud");
    } catch {}
    setSolicitudPendiente(null);
    setPlanSeleccionado(p);
    setModalOpen(true);
  };

  const planes = [
    {
      nombre: "Observador",
      key: "gratis",
      precioMensual: 0,
      precioTrimestral: 0,
      precioAnual: 0,
      limites: ["Solo lectura del marketplace", "Contactar vendedores", "Mensajería interna"],
      icon: Globe,
    },
    {
      nombre: "Productor",
      key: "productor",
      precioMensual: 4,
      precioTrimestral: 10,
      precioAnual: 36,
      limites: ["Hasta 3 lotes activos", "Hasta 3 servicios", "Acceso a AgroIA", "Mensajería directa", "Métricas básicas"],
      icon: Zap,
    },
    {
      nombre: "Pro",
      key: "pro",
      precioMensual: 9,
      precioTrimestral: 23,
      precioAnual: 81,
      limites: ["Lotes y servicios ilimitados", "AgroIA ilimitada", "Métricas completas", "Publicaciones destacadas"],
      icon: ShieldCheck,
      popular: true,
    },
    {
      nombre: "Empresa",
      key: "empresa",
      precioMensual: 19,
      precioTrimestral: 49,
      precioAnual: 169,
      limites: ["Todo lo de Pro", "Tienda online", "Panel de métricas avanzado", "Productos destacados", "Soporte prioritario", "Acceso a 360 Finance"],
      icon: ShieldCheck,
    },
  ];

  const refrescarUsuario = async () => {
    try {
      const { data } = await api.get("/users/perfil");
      const actualizado = { ...usuario, plan: data.plan };
      setUsuario(actualizado);
      localStorage.setItem("usuario", JSON.stringify(actualizado));
    } catch {}
  };

  const activarCodigo = async () => {
    if (!codigo.trim()) return toast.error("Ingresá un código");
    setActivando(true);
    try {
      const { data } = await api.post("/codigos/activar", { codigo });
      toast.success(`¡Plan ${data.plan.toUpperCase()} activado!`);
      await refrescarUsuario();
      setCodigo("");
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Código inválido");
    } finally {
      setActivando(false);
    }
  };

  const precioLabel = (p) => {
    if (p.key === "gratis") return "Gratis";
    const mapa = { mensual: p.precioMensual, trimestral: p.precioTrimestral, anual: p.precioAnual };
    return `USD ${mapa[periodo]}`;
  };

  return (
    <div className="bg-background min-h-screen pt-48 pb-32 px-6 relative overflow-hidden">
      <SEO
        title="Planes y Precios — 360 Agro"
        description="Elegí el plan que se adapta a tu negocio rural. Publicá lotes, creá tu tienda y conectá con el mercado agropecuario."
        url="https://360agro.vercel.app/planes"
      />

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-primary/5 blur-[250px] rounded-full pointer-events-none opacity-40"></div>

      <div className="container mx-auto max-w-7xl relative z-10">

        <header className="text-center mb-12 reveal">
          <span className="text-primary font-black text-[11px] uppercase tracking-[0.8em] mb-4 block italic">Escalabilidad de Negocio</span>
          <h1 className="text-5xl md:text-7xl font-black text-on-surface italic tracking-tighter uppercase leading-none">
            MEMBRESÍAS <span className="text-primary not-italic">SOBERANAS</span>
          </h1>
          <p className="text-on-surface-variant/60 text-lg mt-12 font-bold uppercase tracking-[0.3em] italic max-w-3xl mx-auto leading-relaxed border-t border-outline-variant/30 pt-10">
            GESTIONE SU CRECIMIENTO ESTRATÉGICO CON ACCESO AI E INFRAESTRUCTURA DE ALTA TRACCIÓN COMERCIAL.
          </p>
        </header>

        <div className="flex justify-center gap-3 mb-16">
          {[["mensual", "Mensual"], ["trimestral", "Trimestral (-15%)"], ["anual", "Anual (-25%)"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setPeriodo(key)}
              className={`px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${periodo === key
                ? "machined-gradient text-on-tertiary-fixed border-none shadow-[0_0_20px_rgba(35,83,71,0.3)] scale-105"
                : "bg-surface-container-low text-on-surface-variant border-outline-variant/10 hover:border-primary/40 hover:text-on-surface"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {planes.map((p, index) => {
            const esActual = usuario?.plan?.toLowerCase() === p.key.toLowerCase();
            const esPro = p.popular;
            const Icon = p.icon;

            return (
              <div
                key={p.key}
                className={`relative p-8 rounded-[4rem] border transition-all duration-700 reveal-delayed flex flex-col h-full group
                  ${esPro
                    ? "bg-surface-container-high border-primary shadow-2xl scale-105 z-20 backdrop-blur-3xl"
                    : "bg-surface-container-high border-outline-variant/60 hover:border-primary/30"} 
                  ${esActual ? "opacity-100" : "opacity-90 hover:opacity-100 disabled:opacity-50"}`}
              >
                {esPro && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 machined-gradient text-on-tertiary-fixed px-10 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl italic">
                    Recomendación Pro
                  </div>
                )}

                <div className="mb-14 text-center">
                  <div className={`w-20 h-20 rounded-[2rem] mx-auto mb-10 flex items-center justify-center border shadow-xl transition-all duration-500
                    ${esPro ? "bg-primary text-white border-primary/20" : "bg-surface-container-lowest text-primary/40 border-outline-variant/30 group-hover:bg-primary group-hover:text-white"}`}>
                    <Icon className="w-10 h-10 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className={`text-3xl font-black uppercase italic tracking-tighter mb-6 ${esPro ? "text-on-surface" : "text-on-surface"}`}>
                    {p.nombre}
                  </h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className={`text-4xl font-black italic tracking-tighter ${esPro ? "text-primary" : "text-on-surface"}`}>
                      {precioLabel(p)}
                    </span>
                    {p.key !== "gratis" && <span className="text-[11px] text-on-surface-variant/40 font-black uppercase tracking-[0.4em] ml-2 italic">/ {periodo}</span>}
                  </div>
                </div>

                <ul className="flex-1 space-y-8 mb-20 px-4">
                  {p.limites.map((d, idx) => (
                    <li key={idx} className="flex items-start gap-5">
                      <CheckCircle2 className={`w-5 h-5 mt-0.5 ${esPro ? "text-primary shadow-sm" : "text-outline-variant/40"}`} />
                      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.2em] leading-relaxed italic group-hover:text-on-surface transition-colors">
                        {d}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleActivar(p)}
                  disabled={esActual}
                  className={`w-full py-7 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.5em] transition-all hover:scale-[1.05] active:scale-95 shadow-2xl
                    ${esActual
                      ? "bg-surface-container-low text-on-surface-variant/20 border border-outline-variant/30 cursor-default"
                      : esPro
                        ? "machined-gradient text-on-tertiary-fixed shadow-primary/20"
                        : "bg-surface-container-lowest border border-outline-variant/60 text-on-surface hover:bg-primary hover:text-white hover:border-primary"}`}
                >
                  {esActual ? "Estatus Actual" : "Activar Terminal"}
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

        <div className="mt-16 max-w-md mx-auto">
          <p className="text-center text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-4">¿Tenés un código de activación?</p>
          <div className="flex gap-3">
            <input
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              placeholder="PRO-XXXX-XXXX"
              className="flex-1 bg-surface-container-high border border-outline-variant/60 rounded-2xl px-6 py-4 text-on-surface font-black tracking-widest text-sm outline-none focus:border-primary/50"
            />
            <button
              onClick={activarCodigo}
              disabled={activando}
              className="machined-gradient text-on-tertiary-fixed px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
            >
              {activando ? "..." : "Activar"}
            </button>
          </div>
        </div>

        <div className="mt-16 text-center space-y-6">
          <a
            href="mailto:contacto@360agro.com"
            className="text-[10px] font-bold text-on-surface-variant/30 hover:text-primary uppercase tracking-widest transition-colors"
          >
            ¿Problemas con tu plan? Contactar soporte
          </a>
          <p className="text-[11px] font-black text-on-surface-variant/10 uppercase tracking-[1.5em] italic">
            Certificación de Transacciones Soberanas
          </p>
        </div>
      </div>
    </div>
  );
}
