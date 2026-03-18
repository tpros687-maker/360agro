import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import lotApi from "../api/lotApi";
import api from "../api/axiosConfig"; // Centralizado para tiendas y servicios
import { toast } from "react-hot-toast";

export default function PanelVendedor() {
  const { usuario } = useContext(AuthContext);
  const [stats, setStats] = useState({
    lotes: { total: 0, visitas: 0, interacciones: 0 },
    tienda: { productos: 0, visitas: 0, whatsapp: 0 },
    servicios: { activos: 0, consultas: 0 }
  });
  const [loading, setLoading] = useState(true);

  const cargarMetricas = async () => {
    try {
      setLoading(true);
      // Sincronización multirrubro en paralelo
      const [resLotes, resTienda, resServicios] = await Promise.all([
        lotApi.obtenerMisLotes(),
        api.get("/proveedores/me"),
        api.get("/servicios/mis-servicios") // Ajustado a tu ruta de contratistas
      ]);

      // Métricas de Lotes Ganaderos
      const totalVisitasLotes = resLotes.data.reduce((acc, l) => acc + (l.estadisticas?.visitas || 0), 0);
      const totalWapLotes = resLotes.data.reduce((acc, l) => acc + (l.estadisticas?.whatsapp || 0), 0);

      // Métricas de Tienda e Insumos
      const tienda = resTienda.data;
      const prodsTienda = tienda?.misProductos?.length || 0;

      // Métricas de Servicios (Contratistas)
      const servicios = Array.isArray(resServicios.data) ? resServicios.data : [];

      setStats({
        lotes: { total: resLotes.data.length, visitas: totalVisitasLotes, interacciones: totalWapLotes },
        tienda: { productos: prodsTienda, visitas: tienda?.estadisticas?.visitas || 0, whatsapp: tienda?.estadisticas?.whatsapp || 0 },
        servicios: { activos: servicios.length, consultas: servicios.reduce((acc, s) => acc + (s.estadisticas?.whatsapp || 0), 0) }
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

  if (loading) return (
    <div className="bg-agro-midnight min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-agro-teal shadow-teal-glow"></div>
    </div>
  );

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Resplandor ambiental */}
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

        {/* --- TARJETAS DE MANDO (Lotes, Tiendas, Servicios) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-24">
          
          {/* SECCIÓN LOTES */}
          <div className="bg-agro-charcoal/30 p-12 rounded-[3.5rem] border border-white/5 group hover:border-agro-teal/30 transition-all duration-500 shadow-2xl">
            <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 bg-agro-teal/10 rounded-2xl flex items-center justify-center text-3xl border border-agro-teal/20 shadow-inner">🐂</div>
                <Link to="/mis-lotes" className="text-[10px] font-black text-agro-teal border-b border-agro-teal/20 pb-1 uppercase tracking-widest hover:text-white transition-colors">Gestionar</Link>
            </div>
            <h3 className="text-white font-black uppercase italic tracking-tighter text-2xl mb-2">Lotes</h3>
            <p className="text-5xl font-black text-white mb-8 tracking-tighter">{stats.lotes.total}</p>
            <div className="flex gap-8 pt-8 border-t border-white/5">
                <div>
                    <p className="text-[9px] font-black text-agro-cream/20 uppercase tracking-widest mb-1">Vistas</p>
                    <p className="text-white font-black italic">{stats.lotes.visitas}</p>
                </div>
                <div>
                    <p className="text-[9px] font-black text-agro-cream/20 uppercase tracking-widest mb-1">Consultas</p>
                    <p className="text-agro-teal font-black italic">{stats.lotes.interacciones}</p>
                </div>
            </div>
          </div>

          {/* SECCIÓN TIENDAS */}
          <div className="bg-agro-charcoal/30 p-12 rounded-[3.5rem] border border-white/5 group hover:border-agro-teal/30 transition-all duration-500 shadow-2xl">
            <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/10 shadow-inner">🏪</div>
                <Link to="/mi-tienda" className="text-[10px] font-black text-agro-teal border-b border-agro-teal/20 pb-1 uppercase tracking-widest hover:text-white transition-colors">Mi Negocio</Link>
            </div>
            <h3 className="text-white font-black uppercase italic tracking-tighter text-2xl mb-2">Tiendas</h3>
            <p className="text-5xl font-black text-white mb-8 tracking-tighter">{stats.tienda.productos} <span className="text-xs text-agro-cream/20 uppercase font-black tracking-widest ml-2 italic">Productos</span></p>
            <div className="flex gap-8 pt-8 border-t border-white/5">
                <div>
                    <p className="text-[9px] font-black text-agro-cream/20 uppercase tracking-widest mb-1">Alcance</p>
                    <p className="text-white font-black italic">{stats.tienda.visitas}</p>
                </div>
                <div>
                    <p className="text-[9px] font-black text-agro-cream/20 uppercase tracking-widest mb-1">Pedidos</p>
                    <p className="text-agro-teal font-black italic">{stats.tienda.whatsapp}</p>
                </div>
            </div>
          </div>

          {/* SECCIÓN SERVICIOS */}
          <div className="bg-agro-charcoal/30 p-12 rounded-[3.5rem] border border-white/5 group hover:border-agro-teal/30 transition-all duration-500 shadow-2xl">
            <div className="flex justify-between items-start mb-10">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/10 shadow-inner">🚜</div>
                <Link to="/mis-servicios" className="text-[10px] font-black text-agro-teal border-b border-agro-teal/20 pb-1 uppercase tracking-widest hover:text-white transition-colors">Contratos</Link>
            </div>
            <h3 className="text-white font-black uppercase italic tracking-tighter text-2xl mb-2">Servicios</h3>
            <p className="text-5xl font-black text-white mb-8 tracking-tighter">{stats.servicios.activos}</p>
            <div className="flex gap-8 pt-8 border-t border-white/5">
                <div>
                    <p className="text-[9px] font-black text-agro-cream/20 uppercase tracking-widest mb-1">Interés</p>
                    <p className="text-white font-black italic">{stats.servicios.consultas}</p>
                </div>
                <div>
                    <p className="text-[9px] font-black text-agro-cream/20 uppercase tracking-widest mb-1">Estatus</p>
                    <p className="text-agro-teal font-black text-[9px] uppercase tracking-widest animate-pulse">En Línea</p>
                </div>
            </div>
          </div>

        </div>

        {/* --- ACCIONES OPERATIVAS --- */}
        <section className="bg-agro-charcoal/20 border border-white/5 rounded-[4rem] p-16 shadow-inner">
            <h3 className="text-white font-black uppercase italic tracking-tighter text-3xl mb-12 border-l-4 border-agro-teal pl-8">Operaciones <span className="text-agro-teal">Rápidas</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <Link to="/publicar" className="bg-agro-teal text-agro-midnight p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center hover:scale-105 transition-all shadow-teal-glow group">
                    <span className="text-4xl mb-4 group-hover:rotate-12 transition-transform">🐄</span>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-tight">Publicar<br />Lote</span>
                </Link>
                <Link to="/crear-producto" className="bg-white/5 border border-white/10 text-white p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center hover:bg-white/10 hover:border-agro-teal/30 transition-all group">
                    <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">📦</span>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-tight text-agro-cream/60">Cargar<br />Insumo</span>
                </Link>
                <Link to="/editar-tienda" className="bg-white/5 border border-white/10 text-white p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center hover:bg-white/10 hover:border-agro-teal/30 transition-all group">
                    <span className="text-4xl mb-4 group-hover:rotate-[-10deg] transition-transform">🏢</span>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-tight text-agro-cream/60">Perfil de<br />Negocio</span>
                </Link>
                <Link to="/mensajes" className="bg-white/5 border border-white/10 text-white p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center hover:bg-white/10 hover:border-agro-teal/30 transition-all group relative">
                    <span className="text-4xl mb-4 group-hover:translate-y-[-5px] transition-transform">✉️</span>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-tight text-agro-cream/60">Bandeja de<br />Negocios</span>
                </Link>
            </div>
        </section>

      </div>
    </div>
  );
}