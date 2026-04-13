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

  const marcarVendido = async (id) => {
    try {
      await lotApi.actualizarLote(id, { estado: "Vendido" });
      toast.success("Lote marcado como vendido");
      cargarMetricas();
    } catch (error) {
      toast.error("Error al marcar como vendido");
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
        <header className="mb-8 flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/5 pb-8">
          <div>
            <span className="text-primary font-black text-[10px] uppercase tracking-[0.6em] mb-4 block italic">Ecosistema de Negocios 360</span>
            <h1 className="text-4xl md:text-5xl font-black text-on-surface italic tracking-tighter uppercase leading-none">
              PANEL DE <span className="text-primary not-italic">CONTROL</span>
            </h1>
          </div>
          <div className="text-right border-l border-white/5 pl-8 hidden md:block">
            <p className="text-on-surface font-black text-lg uppercase italic leading-none mb-2">{usuario?.nombre}</p>
            <p className="text-primary text-[10px] font-black uppercase tracking-widest italic">Plan {usuario?.plan} Sincronizado</p>
          </div>
        </header>

        {/* --- TARJETAS DE MANDO --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard title="Lotes" value={stats.lotes.total} icon={<span className="material-symbols-outlined text-2xl text-primary">pets</span>} sub1="Vistas" val1={stats.lotes.visitas} sub2="Interés" val2={stats.lotes.interacciones} link="/mis-lotes" context="Ganado" />
          <StatCard title="Tiendas" value={stats.tienda.productos} icon={<span className="material-symbols-outlined text-2xl text-primary">storefront</span>} sub1="Alcance" val1={stats.tienda.visitas} sub2="Pedidos" val2={stats.tienda.whatsapp} link="/mi-tienda" context="Insumos" />
          <StatCard title="Servicios" value={stats.servicios.activos} icon={<span className="material-symbols-outlined text-2xl text-primary">agriculture</span>} sub1="Interés" val1={stats.servicios.consultas} sub2="Status" val2="ONLINE" link="#" context="Soluciones" />
        </div>

        {/* --- SECCIÓN DE GESTIÓN CENTRALIZADA --- */}
        <div className="space-y-8">

          {/* ESTADO INICIAL: SIN PERFIL CONFIGURADO */}
          {!tienda && (
            <section className="bg-primary/10 rounded-[3rem] p-8 border border-primary/30 text-center backdrop-blur-md animate-reveal shadow-blue-accent-lg">
              <div className="max-w-2xl mx-auto">
                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8 border border-white/10 shadow-inner"><span className="material-symbols-outlined text-2xl text-primary">business</span></div>
                <h2 className="text-3xl font-black text-on-surface italic uppercase tracking-tighter mb-4">Perfil Corporativo <span className="text-primary">No Detectado</span></h2>
                <p className="text-[11px] text-agro-cream/40 font-black uppercase tracking-[0.3em] leading-relaxed mb-10 italic">
                  Para operar en el ecosistema 360 como vendedor o contratista, debe primero configurar su terminal de negocio. Esto habilitará su showroom público y mapa de servicios.
                </p>
                <Link to="/crear-tienda" className="inline-block px-12 py-6 bg-primary text-on-tertiary-fixed rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:bg-white transition-all shadow-teal-glow active:scale-95">
                  CONFIGURAR TERMINAL <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </section>
          )}

          {/* GESTIÓN DE TIENDA */}
          {tienda && (
            <section className="bg-white shadow-md rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-4">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-agro-midnight rounded-2xl overflow-hidden border border-white/10">
                    <img src={tienda.logo ? `${BASE_URL}${tienda.logo}` : "/placeholder.png"} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-on-surface italic uppercase tracking-tighter">
                      {tienda.nombre ? `Mi Negocio: ${tienda.nombre}` : "Mi Negocio"}
                    </h2>
                    <p className="text-primary text-[9px] font-black uppercase tracking-widest">{tienda.rubro}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link to={`/editar-tienda/${tienda._id}`} className="px-6 py-3 bg-white/5 text-primary border border-primary/30 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-on-tertiary-fixed transition-all">Configurar Perfil</Link>
                  <button onClick={() => prepararEliminar("tienda", tienda._id, tienda.nombre)} className="p-3 bg-red-900/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><span className="material-symbols-outlined text-sm">delete</span></button>
                </div>
              </div>

              {/* Lista de Productos de la Tienda */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {productos.slice(0, 4).map(p => (
                  <ItemRow key={p._id} item={p} tipo="producto" onEliminar={() => prepararEliminar("producto", p._id, p.titulo)} editLink={`/editar-producto/${p._id}`} />
                ))}
                {productos.length > 4 && (
                  <Link to="/mi-tienda" className="col-span-full text-center p-4 text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.5em] hover:text-primary transition-all italic">Ver todos los productos ({productos.length}) <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
                )}
              </div>
            </section>
          )}

          {/* GESTIÓN DE LOTES */}
          {lotes.length > 0 && (
            <section className="bg-white shadow-md rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-4">
                <h3 className="text-on-surface font-black uppercase italic tracking-tighter text-2xl border-l-4 border-primary pl-8 text-glow-teal">Inventario de Lotes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lotes.slice(0, 4).map(l => (
                  <ItemRow key={l._id} item={l} tipo="lote" onEliminar={() => prepararEliminar("lote", l._id, l.titulo)} editLink={`/editar-lote/${l._id}`} onVendido={marcarVendido} />
                ))}
                {lotes.length > 4 && (
                  <Link to="/mis-lotes" className="col-span-full text-center p-4 text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.5em] hover:text-primary transition-all italic">Ver inventario completo ({lotes.length}) <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
                )}
              </div>
            </section>
          )}

          {/* GESTIÓN DE SERVICIOS */}
          <section className="bg-white shadow-md rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-4">
              <h3 className="text-on-surface font-black uppercase italic tracking-tighter text-2xl border-l-4 border-primary pl-4">Servicios</h3>
            </div>

            {servicios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {servicios.slice(0, 4).map(s => (
                  <ItemRow key={s._id} item={s} tipo="servicio" onEliminar={() => prepararEliminar("servicio", s._id, s.nombre)} editLink={`/editar-servicio/${s._id}`} />
                ))}
                {servicios.length > 4 && (
                  <p className="col-span-full text-center p-4 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.5em] italic">Todos los servicios sincronizados en este panel</p>
                )}
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-outline-variant/30 rounded-3xl bg-surface-container-lowest">
                <span className="material-symbols-outlined text-4xl text-primary/30 mb-3 block">agriculture</span>
                <p className="text-on-surface-variant text-xl font-black uppercase tracking-widest italic">Sin servicios registrados</p>
                <p className="text-[10px] text-primary/40 mt-2 uppercase font-black tracking-widest">Publicá tu primer servicio desde la sección Publicar</p>
              </div>
            )}
          </section>

        </div>

        {/* --- OPERACIONES RÁPIDAS --- */}
        <section className="mt-8 bg-surface-container border border-outline-variant/60 rounded-[4rem] p-8 shadow-inner">
          <h3 className="text-on-surface font-black uppercase italic tracking-tighter text-xl mb-6 border-l-4 border-primary pl-8">Operaciones <span className="text-primary">Rápidas</span></h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <QuickLink to="/publicar" icon={<span className="material-symbols-outlined text-2xl text-primary">pets</span>} label="Publicar Lote" color="bg-primary text-on-tertiary-fixed shadow-teal-glow" />
            <QuickLink to="/crear-producto" icon={<span className="material-symbols-outlined text-2xl text-primary">inventory_2</span>} label="Cargar Producto" />
            <QuickLink to="/editar-tienda" icon={<span className="material-symbols-outlined text-2xl text-primary">business</span>} label="Perfil Negocio" />
            <QuickLink to="/mensajes" icon={<span className="material-symbols-outlined text-2xl text-primary">mail</span>} label="Bandeja" />
            {usuario?.plan === "empresa" && (
              <QuickLink
                to="http://localhost:5173/dashboard"
                icon={<span className="material-symbols-outlined text-2xl text-primary">monitoring</span>}
                label="360 Finance"
                color="bg-primary/20 border border-primary/30 text-primary"
                external={true}
              />
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTE TARJETA STAT ---
function StatCard({ title, value, icon, sub1, val1, sub2, val2, link, context }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 group hover:border-primary/30 transition-all duration-300 shadow-md hover:shadow-lg">
      <div className="h-1 bg-primary rounded-full mb-6"></div>
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">{icon}</div>
        <Link to={link || "#"} className="text-[10px] font-black text-primary border-b border-primary/20 pb-1 uppercase tracking-widest hover:text-on-surface transition-colors">Gestionar</Link>
      </div>
      <h3 className="text-on-surface-variant font-black uppercase tracking-tighter text-xs mb-1">{title}</h3>
      <p className="text-4xl font-black text-primary mb-6 tracking-tighter">{value} <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest ml-1">{context}</span></p>
      <div className="flex gap-4 pt-4 border-t border-outline-variant/30">
        <div className="flex-1 bg-primary/5 border border-primary/20 rounded-xl p-3 text-center shadow-sm">
          <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{sub1}</p>
          <p className="text-on-surface font-black italic">{val1}</p>
        </div>
        <div className="flex-1 bg-primary/5 border border-primary/20 rounded-xl p-3 text-center shadow-sm">
          <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{sub2}</p>
          <p className="text-primary font-black italic">{val2}</p>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE FILA DE ITEM ---
function ItemRow({ item, tipo, onEliminar, editLink, onVendido }) {
  const fotos = item.fotos || (item.fotoPrincipal ? [item.fotoPrincipal] : []);
  return (
    <div className="bg-white shadow-sm rounded-xl p-4 border border-outline-variant/20 flex items-center gap-4 group hover:border-primary/30 hover:shadow-md transition-all">
      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container-low">
        <img src={fotos[0] ? `${BASE_URL}${fotos[0]}` : "/placeholder.png"} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-on-surface font-black uppercase text-sm tracking-tight truncate">{item.titulo || item.nombre}</h4>
        <p className="text-primary font-black text-[9px] tracking-tighter uppercase mt-0.5">{item.categoria || item.tipoServicio || "Referencia 360"}</p>
      </div>
      <div className="flex gap-2">
        {tipo === "lote" && item.estado !== "Vendido" && (
          <button onClick={() => onVendido(item._id)}
            className="px-4 py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all border border-primary/30 text-[9px] font-black uppercase">
            Vendido
          </button>
        )}
        <Link to={editLink} className="px-4 py-2 bg-surface-container text-primary border border-primary/30 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white shadow-sm italic">
          Editar
        </Link>
        <button onClick={onEliminar} className="p-3 bg-red-900/10 text-red-500/30 hover:text-red-500 rounded-xl transition-all border border-red-500/10"><span className="material-symbols-outlined text-sm">delete</span></button>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE ACCIÓN RÁPIDA ---
function QuickLink({ to, icon, label, color, external = false }) {
  const isPrimary = color === "bg-primary text-on-tertiary-fixed shadow-teal-glow";
  const classes = isPrimary
    ? "bg-primary text-white shadow-md hover:shadow-lg p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:scale-105 transition-all group h-28"
    : "bg-white border border-outline-variant/40 shadow-sm hover:border-primary hover:shadow-md text-on-surface p-5 rounded-2xl flex flex-col items-center justify-center text-center hover:scale-105 transition-all group h-28";
  const content = (
    <>
      <span className="mb-2 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-sm font-bold uppercase tracking-widest leading-tight text-center">{label}</span>
    </>
  );
  if (external) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    );
  }
  return (
    <Link to={to} className={classes}>
      {content}
    </Link>
  );
}
