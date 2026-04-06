import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import tiendaApi from "../api/tiendaApi";
import productoApi from "../api/productoApi";
import { BASE_URL } from "../api/axiosConfig";
import { toast } from "react-hot-toast";
import ModalConfirmar from "../components/ModalConfirmar"; // Inyectamos el guardián

export default function MiTienda() {
  const [tienda, setTienda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de eliminación
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idABorrar, setIdABorrar] = useState(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // 🔥 Sincronización robusta: Si falla productos, aún mostramos la tienda
      const resTienda = await tiendaApi.obtenerMiTienda();
      setTienda(resTienda.data);

      if (resTienda.data && !resTienda.data.noExiste) {
        try {
          const resProds = await productoApi.obtenerMisProductos();
          setProductos(resProds.data);
        } catch (errProds) {
          console.error("⚠️ Error (no crítico) al cargar inventario:", errProds);
          setProductos([]);
        }
      }
    } catch (err) {
      console.error("❌ Error CRÍTICO al cargar identidad de marca:", err);
      setTienda(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función que prepara la eliminación abriendo el modal
  const prepararEliminacion = (id) => {
    setIdABorrar(id);
    setModalAbierto(true);
  };

  // Ejecución definitiva tras confirmar en el modal
  const confirmarEliminar = async () => {
    try {
      await productoApi.eliminarProducto(idABorrar);
      toast.success("ACTIVO REMOVIDO DEL CATÁLOGO");
      cargarDatos();
    } catch (error) {
      toast.error("Error al procesar la baja");
    } finally {
      setModalAbierto(false);
      setIdABorrar(null);
    }
  };

  if (loading) return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden text-center flex items-center justify-center">
      <div className="animate-pulse text-agro-teal font-black uppercase tracking-[1em] text-xs italic">Sincronizando Showroom...</div>
    </div>
  );

  if (!tienda || tienda.noExiste) {
    return (
      <div className="bg-agro-midnight min-h-screen flex flex-col items-center justify-center px-6">
        <div className="text-center space-y-8 card-midnight p-16 border-dashed border-white/10 animate-reveal">
          <span className="text-6xl block mb-6">🏪</span>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
            Tienda <br /> <span className="text-agro-teal not-italic">No Detectada</span>
          </h2>
          <p className="text-agro-cream/30 max-w-sm mx-auto uppercase text-[10px] font-black tracking-widest leading-loose italic">
            Para comercializar insumos y productos, primero debe configurar su identidad corporativa en la red.
          </p>
          <Link to="/crear-tienda" className="btn-emerald py-5 px-12 inline-block">
            CONFIGURAR TIENDA ➔
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">

      {/* MODAL DE SEGURIDAD PARA INVENTARIO */}
      <ModalConfirmar
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alConfirmar={confirmarEliminar}
        titulo="Retirar Producto"
        mensaje="¿Desea retirar permanentemente este activo de su catálogo élite? Esta acción eliminará el stock de la tienda pública."
      />

      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-agro-teal/5 rounded-full blur-[200px] pointer-events-none -mr-40 -mt-40"></div>

      <div className="container mx-auto space-y-16 relative z-10 animate-reveal">

        {/* --- HEADER CORPORATIVO --- */}
        <section className="card-midnight bg-agro-charcoal/40 p-12 border-white/5 relative overflow-hidden group shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
            <div className="w-40 h-40 bg-agro-midnight rounded-[2.5rem] border border-white/10 flex items-center justify-center p-6 group-hover:border-agro-teal/30 transition-all duration-700 shadow-inner">
              <img
                src={tienda.logo ? `${BASE_URL}${tienda.logo}` : "/placeholder.png"}
                className="w-full h-full object-contain brightness-110 group-hover:scale-105 transition duration-700"
                alt="Logo"
              />
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center gap-4 justify-center lg:justify-start mb-4">
                <span className="bg-agro-teal text-agro-midnight text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest italic">{tienda.rubro}</span>
              </div>
              <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">
                {tienda.nombre}
              </h1>
              <p className="text-agro-cream/30 text-sm font-medium italic leading-relaxed max-w-2xl">
                "{tienda.descripcion}"
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full lg:w-fit">
              <Link to={`/tienda/${tienda.slug}`} className="px-8 py-4 bg-white/5 text-white font-black rounded-xl border border-white/5 hover:bg-agro-teal hover:text-agro-midnight transition-all text-[10px] uppercase text-center tracking-widest italic">
                VER VISTA PÚBLICA
              </Link>
              <Link to={`/editar-tienda/${tienda._id}`} className="px-8 py-4 bg-agro-teal/10 text-agro-teal font-black rounded-xl border border-agro-teal/20 hover:bg-agro-teal hover:text-agro-midnight transition-all text-[10px] uppercase text-center tracking-widest italic shadow-teal-glow-sm">
                ⚙️ CONFIGURAR PERFIL
              </Link>
            </div>
          </div>

          {/* DASHBOARD DE MÉTRICAS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/5">
            {[
              { label: "Alcance Total", value: tienda.estadisticas?.visitas, icon: "👁️" },
              { label: "Interés WhatsApp", value: tienda.estadisticas?.whatsapp, icon: "📲" },
              { label: "Leads Telefónicos", value: tienda.estadisticas?.telefono, icon: "📞" },
              { label: "Activos en Stock", value: productos.length, icon: "📦" },
            ].map((stat, i) => (
              <div key={i} className="bg-agro-midnight/40 p-6 rounded-[2rem] text-center border border-white/5 shadow-inner group transition-all hover:border-agro-teal/20">
                <p className="text-[8px] font-black text-agro-cream/10 uppercase tracking-widest mb-3 group-hover:text-agro-teal transition-colors italic">{stat.label}</p>
                <h3 className="text-3xl font-black text-white italic tracking-tighter">{stat.value || 0}</h3>
              </div>
            ))}
          </div>
        </section>

        {/* --- LISTADO DE INVENTARIO --- */}
        <section>
          <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-8">
            <div>
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Inventario <span className="text-agro-teal">Corporativo</span></h2>
              <p className="text-[10px] font-black text-agro-cream/20 uppercase tracking-widest mt-2 italic">Gestión de stock y catálogo de la tienda</p>
            </div>
            <Link to="/crear-producto" className="btn-emerald py-4 px-8 text-[10px] shadow-teal-glow">
              ➕ AÑADIR PRODUCTO ➔
            </Link>
          </div>

          {productos.length === 0 ? (
            <div className="text-center py-32 bg-agro-charcoal/20 border-2 border-dashed border-white/5 rounded-[3.5rem]">
              <p className="text-agro-cream/10 text-2xl font-black uppercase tracking-[0.5em] italic">Catálogo de Activos Vacío</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {productos.map((p) => (
                <div key={p._id} className="card-midnight group bg-agro-charcoal/40 border-white/5 flex flex-col h-full hover:border-agro-teal/30 transition-all duration-500 shadow-xl overflow-hidden">
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={p.fotoPrincipal ? `${BASE_URL}${p.fotoPrincipal}` : (p.fotos?.[0] ? `${BASE_URL}${p.fotos[0]}` : "/placeholder.png")}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-[1.5s]"
                      alt={p.titulo}
                    />
                    <div className="absolute bottom-4 left-6">
                      <span className={`text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border backdrop-blur-md ${p.stock === "disponible" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                        {p.stock === "disponible" ? "● En Stock" : "○ Agotado"}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-lg font-black text-white italic tracking-tighter uppercase mb-2 truncate group-hover:text-agro-teal transition-colors">{p.titulo}</h3>
                    <p className="text-[10px] font-black text-agro-teal/40 uppercase mb-6 tracking-widest italic">{p.categoria}</p>

                    <div className="bg-agro-midnight p-5 rounded-2xl border border-white/5 mb-8 shadow-inner">
                      <p className="text-2xl font-black text-white italic tracking-tighter text-glow-teal">USD {p.precio.toLocaleString()}</p>
                    </div>

                    <div className="mt-auto flex justify-between gap-4 pt-6 border-t border-white/5">
                      <Link to={`/editar-producto/${p._id}`} className="flex-1 text-center py-4 bg-white/5 rounded-xl text-[9px] font-black uppercase text-agro-cream/40 hover:text-white transition-all border border-white/5 italic">Editar</Link>
                      <button
                        onClick={() => prepararEliminacion(p._id)}
                        className="px-5 py-4 bg-red-900/10 text-red-500/40 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}