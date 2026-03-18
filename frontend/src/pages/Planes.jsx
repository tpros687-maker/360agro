import PlanAPI from "../api/planApi";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";

export default function Planes() {
  const { usuario, setUsuario } = useContext(AuthContext);

  const cambiarPlan = async (planKey) => {
    const tId = toast.loading("Sincronizando nueva membresía...");
    try {
      const { data } = await PlanAPI.actualizarPlan(planKey);
      const actualizado = { ...usuario, plan: data.usuario.plan };
      
      setUsuario(actualizado);
      localStorage.setItem("usuario", JSON.stringify(actualizado));

      toast.success(`PLAN ACTUALIZADO A: ${planKey.toUpperCase()}`, { id: tId });
    } catch (error) {
      toast.error("Error al procesar la suscripción", { id: tId });
    }
  };

  const planes = [
    {
      nombre: "Observador",
      key: "gratis",
      precio: "FREE",
      desc: ["Navegación en el Radar", "Acceso a Precios de Referencia", "Búsqueda de Servicios"],
      popular: false,
    },
    {
      nombre: "Productor",
      key: "basico",
      precio: "USD 19",
      desc: ["Hasta 5 Lotes Activos", "5 Ofertas de Servicios", "Mensajería Directa"],
      popular: false,
    },
    {
      nombre: "Élite Pro",
      key: "pro",
      precio: "USD 49",
      desc: ["Publicaciones Ilimitadas", "Prioridad en Búsquedas", "Sello de Confianza Pro", "Analíticas de Visitas"],
      popular: true, // Este resaltará con agro-teal
    },
    {
      nombre: "Business",
      key: "empresa",
      precio: "CONSULTAR",
      desc: ["Showroom Corporativo", "Gestión de Insumos (Tienda)", "Validación de Empresa", "Soporte VIP 24/7"],
      popular: false,
    },
  ];

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Glow ambiental */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-agro-teal/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="container mx-auto max-w-7xl relative z-10">
        
        <header className="text-center mb-24 reveal">
          <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.6em] mb-4 block italic">Escalabilidad de Negocio</span>
          <h1 className="text-6xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
            MEMBRESÍAS <span className="text-agro-teal not-italic">ÉLITE</span>
          </h1>
          <p className="text-agro-cream/30 text-sm mt-6 font-bold uppercase tracking-widest italic max-w-2xl mx-auto">
            Seleccione el nivel de tracción que su establecimiento requiere para dominar el mercado.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {planes.map((p, index) => {
            const esActual = usuario?.plan?.toLowerCase() === p.key;
            const esPro = p.key === "pro";

            return (
              <div
                key={p.key}
                className={`relative p-10 rounded-[3rem] border transition-all duration-500 reveal-delayed flex flex-col h-full
                  ${esPro 
                    ? "bg-agro-charcoal border-agro-teal shadow-teal-glow-lg scale-105 z-20" 
                    : "bg-agro-charcoal/20 border-white/5 hover:border-white/20"} 
                  ${esActual ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
              >
                {/* Badge Popular / Pro */}
                {esPro && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-agro-teal text-agro-midnight px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-teal-glow">
                    Sugerencia Táctica
                  </div>
                )}

                <div className="mb-10 text-center">
                  <h3 className={`text-2xl font-black uppercase italic tracking-tighter mb-2 ${esPro ? "text-white" : "text-agro-cream"}`}>
                    {p.nombre}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-4xl font-black italic tracking-tighter ${esPro ? "text-agro-teal" : "text-white"}`}>
                      {p.precio}
                    </span>
                    {p.precio !== "FREE" && p.precio !== "CONSULTAR" && <span className="text-[10px] text-white/20 font-black">/MES</span>}
                  </div>
                </div>

                <ul className="flex-1 space-y-5 mb-12">
                  {p.desc.map((d, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className={`text-xs mt-1 ${esPro ? "text-agro-teal" : "text-agro-cream/40"}`}>✓</span>
                      <span className="text-[11px] font-bold text-agro-cream/60 uppercase tracking-widest leading-relaxed">
                        {d}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => cambiarPlan(p.key)}
                  disabled={esActual}
                  className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-95
                    ${esActual 
                      ? "bg-white/5 text-white/20 border border-white/5 cursor-default" 
                      : esPro 
                        ? "bg-agro-teal text-agro-midnight shadow-teal-glow hover:shadow-teal-glow-lg" 
                        : "bg-white/5 text-white border border-white/10 hover:bg-agro-teal hover:text-agro-midnight hover:border-agro-teal"}`}
                >
                  {esActual ? "PLAN ACTUAL" : "ACTIVAR AHORA ➔"}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center mt-20 text-[9px] font-black text-agro-cream/10 uppercase tracking-[0.5em] italic">
          * Todas las transacciones de pago son procesadas bajo protocolos de encriptación bancaria.
        </p>
      </div>
    </div>
  );
}