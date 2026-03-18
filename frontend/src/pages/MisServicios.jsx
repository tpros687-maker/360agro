import { useEffect, useState, useContext } from "react";
import servicioApi from "../api/servicioApi";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Skeleton from "../components/Skeleton";
import { toast } from "react-hot-toast";
import ModalConfirmar from "../components/ModalConfirmar"; // Guardián de seguridad

export default function MisServicios() {
  const { usuario } = useContext(AuthContext);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de eliminación
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idABorrar, setIdABorrar] = useState(null);

  const cargarDatos = async () => {
    try {
      const resp = await servicioApi.obtenerMiServicio();
      if (Array.isArray(resp.data)) {
        setServicios(resp.data);
      } else if (resp.data && typeof resp.data === 'object') {
        setServicios([resp.data]);
      } else {
        setServicios([]);
      }
    } catch (error) {
      console.error("❌ Error cargando Mis Servicios:", error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    if (usuario) cargarDatos();
  }, [usuario]);

  // Preparar baja
  const prepararBaja = (id) => {
    setIdABorrar(id);
    setModalAbierto(true);
  };

  // Confirmar eliminación definitiva
  const confirmarBaja = async () => {
    try {
      // Asumiendo que tu API tiene eliminarServicio, sino ajusta el nombre
      await servicioApi.eliminarServicio(idABorrar); 
      toast.success("SERVICIO RETIRADO DE LA RED");
      cargarDatos();
    } catch (error) {
      toast.error("Error al procesar la baja técnica");
    } finally {
      setModalAbierto(false);
      setIdABorrar(null);
    }
  };

  const plan = usuario?.plan || "gratis";
  const planSoportaServicios = plan !== "gratis" && plan !== "basico";
  const limiteAlcanzado = plan !== "empresa" && servicios.length >= 1;

  if (loading) {
    return (
      <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 flex items-center justify-center">
        <div className="animate-pulse text-agro-teal font-black uppercase tracking-[1em] text-xs italic">
            Sincronizando Servicios...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      
      {/* MODAL DE SEGURIDAD OPERATIVA */}
      <ModalConfirmar 
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alConfirmar={confirmarBaja}
        titulo="Baja de Servicio"
        mensaje="¿Desea retirar esta solución profesional de la red 360? La baja es irreversible y cesará toda captación de leads activos."
      />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-radial from-agro-teal/5 to-transparent pointer-events-none opacity-50"></div>

      <header className="container mx-auto mb-16 relative z-10 reveal flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-10">
        <div>
          <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Dashboard de Soluciones</span>
          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none mb-4 uppercase">
            GESTIÓN DE <br /><span className="text-agro-teal not-italic font-black">SERVICIOS</span>
          </h1>
          <p className="text-agro-cream/20 text-[10px] font-black uppercase tracking-[0.2em] italic">{usuario?.nombre} • SOCIO {plan.toUpperCase()}</p>
        </div>

        {planSoportaServicios && !limiteAlcanzado && (
          <Link to="/crear-servicio" className="btn-emerald py-4 px-8 text-[10px] shadow-teal-glow">
            ➕ AÑADIR NUEVO SERVICIO
          </Link>
        )}
      </header>

      <div className="container mx-auto relative z-10 animate-reveal">

        {!planSoportaServicios ? (
          <div className="text-center py-32 card-midnight bg-agro-charcoal/20 border-white/10 shadow-2xl backdrop-blur-md">
            <span className="text-6xl mb-6 block">🔒</span>
            <h2 className="text-3xl font-black text-white italic mb-4 uppercase tracking-tighter">Acceso de Red Restringido</h2>
            <p className="text-agro-cream/30 mb-10 max-w-lg mx-auto uppercase text-[10px] font-black tracking-widest leading-loose italic">
              Su membresía actual no posee las credenciales para ofrecer servicios profesionales. Para activar este terminal, debe realizar un upgrade.
            </p>
            <Link to="/planes" className="btn-emerald py-5 px-12 inline-block">
              ⭐ UPGRADE A SOCIO PRO / EMPRESA ➔
            </Link>
          </div>
        ) : servicios.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <h2 className="text-4xl font-black text-white/10 italic mb-10 uppercase tracking-tighter">Centro de Servicios Inactivo</h2>
            <Link to="/crear-servicio" className="btn-emerald py-5 inline-block">
              ➕ Activar Primer Servicio ➔
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {servicios.map((servicio, idx) => (
              <section key={servicio._id || idx} className="card-midnight p-10 bg-agro-charcoal/40 relative flex flex-col h-full hover:border-agro-teal/30 transition-all duration-700 shadow-xl group">
                <div className="flex items-center gap-6 mb-8 border-b border-white/5 pb-8">
                  <div className="w-20 h-20 bg-agro-midnight rounded-[2rem] border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:border-agro-teal/20 transition-all duration-700">
                    <span className="grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">⚙️</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-agro-teal/10 text-agro-teal text-[9px] font-black px-3 py-1 rounded-full border border-agro-teal/10 uppercase tracking-widest italic">{servicio.tipoServicio}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-agro-teal shadow-teal-glow animate-pulse"></span>
                    </div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase line-clamp-1 group-hover:text-agro-teal transition-colors">
                      {servicio.nombre}
                    </h2>
                  </div>
                </div>

                {/* GRID DE MÉTRICAS */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Visitas", value: servicio.estadisticas?.visitas || 0 },
                    { label: "WA Hits", value: servicio.estadisticas?.whatsapp || 0 },
                    { label: "Leads Tel", value: servicio.estadisticas?.telefono || 0 }
                  ].map((stat, i) => (
                    <div key={i} className="bg-agro-midnight/40 border border-white/5 p-5 rounded-3xl text-center shadow-inner hover:border-agro-teal/20 transition-all">
                      <p className="text-[8px] font-black text-agro-cream/10 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                      <p className="text-2xl font-black text-white italic tracking-tighter">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* BOTONES DE GESTIÓN */}
                <div className="border-t border-white/5 pt-8 flex gap-4 mt-auto">
                  <Link to={`/servicio/${servicio._id}`} className="flex-1 py-4 bg-white/5 text-white/30 hover:text-white font-black rounded-xl border border-white/5 hover:bg-white/10 transition-all uppercase tracking-widest text-[9px] text-center italic">Vista Pública</Link>
                  <Link to={`/editar-servicio/${servicio._id}`} className="flex-1 py-4 bg-agro-teal text-agro-midnight font-black rounded-xl hover:shadow-teal-glow transition-all uppercase tracking-widest text-[9px] text-center">Editar</Link>
                  <button 
                    onClick={() => prepararBaja(servicio._id)}
                    className="px-5 py-4 bg-red-900/10 text-red-500/40 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                  >
                    🗑️
                  </button>
                </div>
              </section>
            ))}
          </div>
        )}

        {planSoportaServicios && (
          <div className="mt-16 text-center text-[9px] font-black text-agro-cream/10 uppercase tracking-[0.4em] italic border-t border-white/5 pt-8">
            {plan === "pro" 
              ? "Terminal Profesional: 1 Slot de Servicio Activo. Upgrade a Empresa para slots ilimitados." 
              : "Terminal Corporativo: Slots de Soluciones Ilimitados Activados."}
          </div>
        )}
      </div>
    </div>
  );
}