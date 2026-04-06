import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import lotApi from "../api/lotApi";
import api, { BASE_URL } from "../api/axiosConfig";
import productoApi from "../api/productoApi";
import servicioApi from "../api/servicioApi";
import { getGisAssets } from "../api/gisApi";
import { getExpenses } from "../api/expenseApi";
import { toast } from "react-hot-toast";
import ModalConfirmar from "../components/ModalConfirmar";
import { LayoutDashboard, TrendingUp, DollarSign, Activity, Target } from "lucide-react";

export default function PanelVendedor() {
  const { usuario } = useContext(AuthContext);
  const [stats, setStats] = useState({
    lotes: { total: 0, visitas: 0, interacciones: 0 },
    tienda: { productos: 0, visitas: 0, whatsapp: 0 },
    servicios: { activos: 0, consultas: 0 }
  });

  // Listas para gestión directa
  const [lotes, setLotes] = useState([]);
  const [tienda, setTienda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [servicios, setServicios] = useState([]);

  const [loading, setLoading] = useState(true);

  // Control de Modal de Eliminación
  const [modal, setModal] = useState({ abierto: false, tipo: null, id: null, titulo: "", mensaje: "" });

  const cargarMetricas = async () => {
    try {
      setLoading(true);
      // Sincronización multirrubro en paralelo con manejo de errores individual
      const [resLotes, resTienda, resServicios, resProds, resGis, resGastos] = await Promise.all([
        lotApi.obtenerMisLotes().catch(() => ({ data: [] })),
        api.get("/proveedores/me").catch(() => ({ data: null })),
        servicioApi.obtenerMiServicio().catch(() => ({ data: [] })),
        productoApi.obtenerMisProductos().catch(() => ({ data: [] })),
        getGisAssets().catch(() => ({ data: [] })),
        getExpenses().catch(() => ({ data: [] }))
      ]);

      // 1. Lotes
      const listaLotes = Array.isArray(resLotes.data) ? resLotes.data : [];
      setLotes(listaLotes);
      const visitsLotes = listaLotes.reduce((acc, l) => acc + (l.estadisticas?.visitas || 0), 0);
      const wapLotes = listaLotes.reduce((acc, l) => acc + (l.estadisticas?.whatsapp || 0), 0);

      // 2. Tienda y Productos
      const dataTienda = resTienda.data;
      setTienda(dataTienda);
      const listaProds = Array.isArray(resProds.data) ? resProds.data : [];
      setProductos(listaProds);

      // 3. Servicios - Unificamos fuentes (algunos perfiles los traen en el proveedor, otros por el endpoint dedicado)
      const servsEndpoint = Array.isArray(resServicios.data) ? resServicios.data : [];
      const servsTienda = Array.isArray(dataTienda?.servicios) ? dataTienda.servicios : [];

      // Mergeamos para asegurar que aparezcan (por si hay inconsistencia en el populate/filtrado)
      // Usamos un Map para evitar duplicados por ID
      const servsMap = new Map();
      [...servsTienda, ...servsEndpoint].forEach(s => {
        if (s?._id) servsMap.set(s._id.toString(), s);
      });
      const listaServs = Array.from(servsMap.values());
      setServicios(listaServs);

      // 4. Agro-Ledger (GIS) Metrics processing
      const gisData = resGis.data || [];
      const gastosData = resGastos.data || [];
      const totalInvested = gastosData.reduce((acc, g) => acc + g.monto, 0);
      const totalHectares = gisData.reduce((acc, a) => acc + (a.hectareas || 0), 0);
      const roiProyectado = Math.floor(totalHectares * 1100 - totalInvested);

      setStats({
        lotes: { total: listaLotes.length, visitas: visitsLotes, interacciones: wapLotes },
        tienda: { productos: listaProds.length, visitas: dataTienda?.estadisticas?.visitas || 0, whatsapp: dataTienda?.estadisticas?.whatsapp || 0 },
        servicios: { activos: listaServs.length, consultas: listaServs.reduce((acc, s) => acc + (s.estadisticas?.whatsapp || 0), 0) },
        agroLedger: { inversion: totalInvested, roi: roiProyectado, hectareas: totalHectares }
      });

    } catch (error) {
      console.error("Error en panel:", error);
      toast.error("Error al sincronizar la central de mando");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMetricas();
  }, []);

  // --- GESTIÓN DE ELIMINACIONES ---
  const prepararEliminar = (tipo, id, nombre) => {
    const config = {
      lote: { titulo: "Retirar Lote", mensaje: `¿Confirmas la baja de "${nombre}"? El registro será eliminado permanentemente de la red ganadera.` },
      producto: { titulo: "Eliminar Producto", mensaje: `¿Deseas quitar "${nombre}" de tu catálogo de insumos?` },
      servicio: { titulo: "Baja de Servicio", mensaje: `¿Confirmas el cese de la solución "${nombre}"?` },
      tienda: { titulo: "ELIMINAR PERFIL DE NEGOCIO", mensaje: "⚠️ ¡ATENCIÓN! Está por eliminar su perfil corporativo completo. Esto borrará su logo, descripción y visibilidad en el mapa de tiendas. Los productos no se borrarán pero quedarán huérfanos." }
    };
    setModal({ abierto: true, tipo, id, ...config[tipo] });
  };

  const confirmarEliminar = async () => {
    const { tipo, id } = modal;
    try {
      if (tipo === "lote") await lotApi.eliminarLote(id);
      if (tipo === "producto") await productoApi.eliminarProducto(id);
      if (tipo === "servicio") await servicioApi.eliminarServicio(id);
      if (tipo === "tienda") await api.delete(`/proveedores/${tienda._id}`);

      toast.success("Operación ejecutada con éxito");
      cargarMetricas(); // Recargar todo
    } catch (error) {
      toast.error("No se pudo completar la operación");
    } finally {
      setModal({ ...modal, abierto: false });
    }
  };

  if (loading) return (
    <div className="bg-background min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary shadow-[0_0_20px_rgba(63,111,118,0.4)]"></div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <ModalConfirmar
        abierto={modal.abierto}
        alCerrar={() => setModal({ ...modal, abierto: false })}
        alConfirmar={confirmarEliminar}
        titulo={modal.titulo}
        mensaje={modal.mensaje}
      />

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-agro-teal/5 rounded-full blur-[150px] -mr-40 -mt-40"></div>

      <div className="container mx-auto max-w-6xl relative z-10">

        {/* --- HEADER --- */}
        <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-16">
          <div>
            <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.6em] mb-4 block italic">Ecosistema de Negocios 360</span>
            <h1 className="text-6xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
              PANEL DE <span className="text-agro-teal not-italic">VENDEDOR</span>
            </h1>
          </div>
          <div className="text-right border-l border-white/5 pl-8 hidden md:block">
            <p className="text-white font-black text-lg uppercase italic leading-none mb-2">{usuario?.nombre}</p>
            <p className="text-agro-teal text-[10px] font-black uppercase tracking-widest italic">Plan {usuario?.plan} Sincronizado</p>
          </div>
        </header>

        {/* --- TARJETAS DE MANDO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          <StatCard title="Lotes" value={stats.lotes.total} icon="🐂" sub1="Vistas" val1={stats.lotes.visitas} sub2="Interés" val2={stats.lotes.interacciones} link="/mis-lotes" context="Ganado" />
          <StatCard title="Tiendas" value={stats.tienda.productos} icon="🏪" sub1="Alcance" val1={stats.tienda.visitas} sub2="Pedidos" val2={stats.tienda.whatsapp} link="/mi-tienda" context="Insumos" />
          <StatCard title="Servicios" value={stats.servicios.activos} icon="🚜" sub1="Interés" val1={stats.servicios.consultas} sub2="Status" val2="ONLINE" link="/mis-servicios" context="Soluciones" />
        </div>

        {/* --- SECCIÓN DE GESTIÓN CENTRALIZADA --- */}
        <div className="space-y-16">

          {/* ESTADO INICIAL: SIN PERFIL CONFIGURADO */}
          {!tienda && (
            <section className="bg-agro-ocean/10 rounded-[3rem] p-16 border border-agro-ocean/30 text-center backdrop-blur-md animate-reveal shadow-blue-accent-lg">
              <div className="max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8 border border-white/10 shadow-inner">🏢</div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Perfil Corporativo <span className="text-agro-teal">No Detectado</span></h2>
                <p className="text-[11px] text-agro-cream/40 font-black uppercase tracking-[0.3em] leading-relaxed mb-10 italic">
                  Para operar en el ecosistema 360 como vendedor o contratista, debe primero configurar su terminal de negocio. Esto habilitará su showroom público y mapa de servicios.
                </p>
                <Link to="/crear-tienda" className="inline-block px-12 py-6 bg-agro-teal text-agro-midnight rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white transition-all shadow-teal-glow active:scale-95">
                  CONFIGURAR TERMINAL ➔
                </Link>
              </div>
            </section>
          )}

          {/* GESTIÓN DE TIENDA */}
          {tienda && (
            <section className="bg-agro-charcoal/30 rounded-[3rem] p-12 border border-white/5">
              <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-agro-midnight rounded-2xl overflow-hidden border border-white/10">
                    <img src={tienda.logo ? `${BASE_URL}${tienda.logo}` : "/placeholder.png"} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Mi Negocio: {tienda.nombre}</h2>
                    <p className="text-agro-teal text-[9px] font-black uppercase tracking-widest">{tienda.rubro}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link to={`/editar-tienda/${tienda._id}`} className="px-6 py-3 bg-white/5 text-agro-teal border border-agro-teal/30 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-agro-teal hover:text-agro-midnight transition-all">Configurar Perfil</Link>
                  <button onClick={() => prepararEliminar("tienda", tienda._id, tienda.nombre)} className="p-3 bg-red-900/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                </div>
              </div>

              {/* Lista de Productos de la Tienda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {productos.slice(0, 4).map(p => (
                  <ItemRow key={p._id} item={p} tipo="producto" onEliminar={() => prepararEliminar("producto", p._id, p.titulo)} editLink={`/editar-producto/${p._id}`} />
                ))}
                {productos.length > 4 && (
                  <Link to="/mi-tienda" className="col-span-full text-center p-4 text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.5em] hover:text-agro-teal transition-all italic">Ver todos los productos ({productos.length}) ➔</Link>
                )}
              </div>
            </section>
          )}

          {/* GESTIÓN DE LOTES */}
          {lotes.length > 0 && (
            <section className="bg-agro-charcoal/20 rounded-[3rem] p-12 border border-white/5">
              <h3 className="text-white font-black uppercase italic tracking-tighter text-2xl mb-10 border-l-4 border-agro-teal pl-8 text-glow-teal">Inventario de Lotes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lotes.slice(0, 4).map(l => (
                  <ItemRow key={l._id} item={l} tipo="lote" onEliminar={() => prepararEliminar("lote", l._id, l.titulo)} editLink={`/editar-lote/${l._id}`} />
                ))}
                {lotes.length > 4 && (
                  <Link to="/mis-lotes" className="col-span-full text-center p-4 text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.5em] hover:text-agro-teal transition-all italic">Ver inventario completo ({lotes.length}) ➔</Link>
                )}
              </div>
            </section>
          )}

          {/* GESTIÓN DE SERVICIOS */}
          <section className="bg-agro-charcoal/20 rounded-[3rem] p-12 border border-white/5">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-white font-black uppercase italic tracking-tighter text-2xl border-l-4 border-white/10 pl-8">Servicios</h3>
              <Link to="/crear-servicio" className="px-6 py-3 bg-agro-teal text-agro-midnight rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-teal-glow">Añadir Solución ➔</Link>
            </div>

            {servicios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {servicios.slice(0, 4).map(s => (
                  <ItemRow key={s._id} item={s} tipo="servicio" onEliminar={() => prepararEliminar("servicio", s._id, s.nombre)} editLink={`/editar-servicio/${s._id}`} />
                ))}
                {servicios.length > 4 && (
                  <Link to="/mis-servicios" className="col-span-full text-center p-4 text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.5em] hover:text-agro-teal transition-all italic">Gestionar todos los servicios ({servicios.length}) ➔</Link>
                )}
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-agro-midnight/20">
                <p className="text-agro-cream/10 text-xl font-black uppercase tracking-widest italic">Sin servicios registrados</p>
                <p className="text-[10px] text-agro-teal/40 mt-2 uppercase font-black tracking-widest">Postúlate como contratista oficial en la red Élite Agro</p>
              </div>
            )}
          </section>

        </div>

        {/* --- OPERACIONES RÁPIDAS --- */}
        <section className="mt-24 bg-agro-charcoal/10 border border-white/5 rounded-[4rem] p-16 shadow-inner">
          <h3 className="text-white font-black uppercase italic tracking-tighter text-3xl mb-12 border-l-4 border-agro-teal pl-8">Operaciones <span className="text-agro-teal">Rápidas</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <QuickLink to="/publicar" icon="🐄" label="Publicar Lote" color="bg-agro-teal text-agro-midnight shadow-teal-glow" />
            <QuickLink to="/crear-producto" icon="📦" label="Cargar Producto" />
            <QuickLink to="/editar-tienda" icon="🏢" label="Perfil Negocio" />
            <QuickLink to="/mensajes" icon="✉️" label="Bandeja" />
          </div>
        </section>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTE TARJETA STAT ---
function StatCard({ title, value, icon, sub1, val1, sub2, val2, link, context }) {
  return (
    <div className="bg-agro-charcoal/30 p-12 rounded-[3.5rem] border border-white/5 group hover:border-agro-teal/30 transition-all duration-500 shadow-2xl">
      <div className="flex justify-between items-start mb-10">
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/10 shadow-inner group-hover:bg-agro-teal/10 group-hover:border-agro-teal/20 transition-all">{icon}</div>
        <Link to={link || "#"} className="text-[10px] font-black text-agro-teal border-b border-agro-teal/20 pb-1 uppercase tracking-widest hover:text-white transition-colors">Gestionar</Link>
      </div>
      <h3 className="text-white font-black uppercase italic tracking-tighter text-2xl mb-2">{title}</h3>
      <p className="text-5xl font-black text-white mb-8 tracking-tighter">{value} <span className="text-[10px] text-agro-cream/20 uppercase tracking-widest ml-1">{context}</span></p>
      <div className="flex gap-8 pt-8 border-t border-white/5">
        <div>
          <p className="text-[9px] font-black text-agro-cream/20 uppercase tracking-widest mb-1">{sub1}</p>
          <p className="text-white font-black italic">{val1}</p>
        </div>
        <div>
          <p className="text-[9px] font-black text-agro-cream/20 uppercase tracking-widest mb-1">{sub2}</p>
          <p className="text-agro-teal font-black italic">{val2}</p>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE FILA DE ITEM ---
function ItemRow({ item, tipo, onEliminar, editLink }) {
  const fotos = item.fotos || (item.fotoPrincipal ? [item.fotoPrincipal] : []);
  return (
    <div className="bg-agro-midnight/40 p-5 rounded-3xl border border-white/5 flex items-center gap-6 group hover:border-white/10 transition-all">
      <div className="w-16 h-16 rounded-2xl bg-agro-charcoal overflow-hidden border border-white/5 shrink-0">
        <img src={fotos[0] ? `${BASE_URL}${fotos[0]}` : "/placeholder.png"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-black uppercase text-sm italic tracking-tight truncate">{item.titulo || item.nombre}</h4>
        <p className="text-agro-teal font-black text-[9px] tracking-tighter uppercase">{item.categoria || item.tipoServicio || "Referencia 360"}</p>
      </div>
      <div className="flex gap-2">
        <Link to={editLink} className="p-3 bg-white/5 text-white/40 hover:text-agro-teal rounded-xl transition-all">✏️</Link>
        <button onClick={onEliminar} className="p-3 bg-red-900/10 text-red-500/30 hover:text-red-500 rounded-xl transition-all">🗑️</button>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE ACCIÓN RÁPIDA ---
function QuickLink({ to, icon, label, color = "bg-white/5 border border-white/10 text-white" }) {
  return (
    <Link to={to} className={`${color} p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center hover:scale-105 transition-all group`}>
      <span className="text-4xl mb-4 group-hover:rotate-12 transition-transform">{icon}</span>
      <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-tight">{label.split(" ").map((word, i) => <span key={i}>{word}<br /></span>)}</span>
    </Link>
  );
}