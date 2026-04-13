import { useEffect, useState, useContext } from "react";
import servicioApi from "../api/servicioApi";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Skeleton from "../components/Skeleton";
import { toast } from "react-hot-toast";
import ModalConfirmar from "../components/ModalConfirmar";

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
  const planSoportaServicios = ["productor", "pro", "empresa"].includes(plan?.toLowerCase());
  const limiteAlcanzado = plan === "productor" && servicios.length >= 3;

  if (loading) {
    return (
      <div className="bg-background min-h-screen pt-32 pb-24 px-6 flex items-center justify-center">
        <div className="animate-pulse text-primary font-black uppercase tracking-[1em] text-xs italic">
            Sincronizando Servicios...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      
      {/* MODAL DE SEGURIDAD OPERATIVA */}
      <ModalConfirmar 
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alConfirmar={confirmarBaja}
        titulo="Baja de Servicio"
        mensaje="¿Desea retirar esta solución profesional de la red 360? La baja es irreversible y cesará toda captación de leads activos."
      />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[180px] pointer-events-none opacity-50"></div>

      <header className="container mx-auto mb-8 relative z-10 reveal flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/70 pb-6">
        <div>
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Dashboard de Soluciones</span>
          <h1 className="text-3xl md:text-5xl font-black text-on-surface italic tracking-tighter leading-none mb-4 uppercase">
            GESTIÓN DE <br /><span className="text-primary not-italic font-black">SERVICIOS</span>
          </h1>
          <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.2em] italic">{usuario?.nombre} • SOCIO {plan.toUpperCase()}</p>
        </div>

        {planSoportaServicios && !limiteAlcanzado && (
          <Link to="/crear-servicio" className="machined-gradient text-on-tertiary-fixed py-4 px-8 text-[10px] rounded-full font-black uppercase tracking-widest shadow-xl">
            <span className="material-symbols-outlined text-sm">add</span> AÑADIR NUEVO SERVICIO
          </Link>
        )}
      </header>

      <div className="container mx-auto relative z-10 animate-reveal">

        {!planSoportaServicios ? (
          <div className="text-center py-32 bg-surface-container-high border-outline-variant/70 border rounded-[3rem] shadow-2xl backdrop-blur-md">
            <span className="material-symbols-outlined text-5xl text-primary mb-6 block">lock</span>
            <h2 className="text-3xl font-black text-on-surface italic mb-4 uppercase tracking-tighter">Acceso de Red Restringido</h2>
            <p className="text-on-surface-variant text-[10px] font-black tracking-widest leading-loose italic mb-10 max-w-lg mx-auto uppercase">
              Su membresía actual no posee las credenciales para ofrecer servicios profesionales. Para activar este terminal, debe realizar un upgrade.
            </p>
            <Link to="/planes" className="machined-gradient text-on-tertiary-fixed py-5 px-12 inline-block rounded-full uppercase tracking-widest font-black text-[11px]">
               UPGRADE A SOCIO PRO / EMPRESA <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        ) : servicios.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-outline-variant/70 rounded-[3rem] bg-surface-container-lowest/50">
            <h2 className="text-4xl font-black text-on-surface/10 italic mb-10 uppercase tracking-tighter">Centro de Servicios Inactivo</h2>
            <Link to="/crear-servicio" className="machined-gradient text-on-tertiary-fixed py-5 px-10 inline-block rounded-full font-black uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">add</span> Activar Primer Servicio <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {servicios.map((servicio, idx) => (
              <section key={servicio._id || idx} className="bg-surface-container-high border-outline-variant/70 border p-10 relative flex flex-col h-full hover:border-primary/30 transition-all duration-700 shadow-xl group rounded-[2.5rem]">
                <div className="flex items-center gap-6 mb-8 border-b border-outline-variant/70 pb-8">
                  <div className="w-20 h-20 bg-surface-container-lowest rounded-[2rem] border border-outline-variant/70 flex items-center justify-center text-3xl shadow-inner group-hover:border-primary/20 transition-all duration-700">
                    <span className="material-symbols-outlined text-2xl text-primary">settings</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-primary/10 text-primary text-[9px] font-black px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest italic">{servicio.tipoServicio}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-xl animate-pulse"></span>
                    </div>
                    <h2 className="text-3xl font-black text-on-surface italic tracking-tighter uppercase line-clamp-1 group-hover:text-primary transition-colors">
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
                    <div key={i} className="bg-surface-container-lowest border border-outline-variant/70 p-5 rounded-3xl text-center shadow-inner hover:border-primary/20 transition-all">
                      <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-2 italic">{stat.label}</p>
                      <p className="text-2xl font-black text-on-surface italic tracking-tighter">{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* BOTONES DE GESTIÓN */}
                <div className="border-t border-outline-variant/70 pt-8 flex gap-4 mt-auto">
                  <Link to={`/servicio/${servicio._id}`} className="flex-1 py-4 bg-background text-on-surface-variant/40 hover:text-on-surface font-black rounded-xl border border-outline-variant/70 hover:bg-surface-container-lowest transition-all uppercase tracking-widest text-[9px] text-center italic">Vista Pública</Link>
                  <Link to={`/editar-servicio/${servicio._id}`} className="flex-1 py-4 bg-primary text-on-tertiary-fixed font-black rounded-xl hover:shadow-xl transition-all uppercase tracking-widest text-[9px] text-center">Editar</Link>
                  <button 
                    onClick={() => prepararBaja(servicio._id)}
                    className="px-5 py-4 bg-red-900/10 text-red-500/40 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </section>
            ))}
          </div>
        )}

        {planSoportaServicios && (
          <div className="mt-16 text-center text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] italic border-t border-outline-variant/70 pt-8">
            {plan === "productor" 
              ? "Plan Productor: 3 Slots de Servicios Profesionales. Upgrade a Pro/Empresa para expansión ilimitada." 
              : "Terminal Corporativo: Slots de Soluciones Activados sin Restricción."}
          </div>
        )}
      </div>
    </div>
  );
}