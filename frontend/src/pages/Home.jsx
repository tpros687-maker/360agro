import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import API from "../api/lotApi";
import { AuthContext } from "../context/AuthContext";
import { BASE_URL, imgUrl } from "../api/axiosConfig";
import RadarNacional from "../components/RadarNacional";
import agro_backdrop from "../assets/agro_elite_blue_bg.png";
import {
  Globe,
  Briefcase,
  ShoppingBag,
  BarChart3,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from "lucide-react";

export default function Home() {
  const { usuario } = useContext(AuthContext);
  const [destacados, setDestacados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDestacados = async () => {
      try {
        const { data } = await API.obtenerLotes();
        const topRanking = [...data]
          .sort((a, b) => (b.estadisticas?.visitas || 0) - (a.estadisticas?.visitas || 0))
          .slice(0, 3);
        setDestacados(topRanking);
      } catch (error) {
        console.error("❌ Error en sincronización de destacados:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data);
      } catch (error) {
        console.error("Error al cargar ajustes del sitio:", error);
      }
    };

    const fetchStats = async () => {
      try {
        const { data: statsData } = await api.get("/admin/stats/publicas");
        setStats(statsData);
      } catch (error) {
        console.error("Error al cargar stats:", error);
      }
    };

    fetchDestacados();
    fetchSettings();
    fetchStats();
  }, []);

  // Navigation handler removed

  return (
    <div className="bg-background text-on-surface min-h-screen font-sans">
      
      {/* Hero Section */}
      <section
        className="relative pt-32 pb-10 px-6 overflow-hidden"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=60')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-white/85"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-on-surface leading-[0.85] mb-8 uppercase italic">
            El ecosistema <br />
            <span className="text-primary">rural digital</span>
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-12 font-bold italic uppercase tracking-widest opacity-70">
            La plataforma líder para conectar productores, lotes y servicios en todo el país con trazabilidad corporativa.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/explorar" className="px-12 py-5 machined-gradient text-on-tertiary-fixed font-black rounded-full hover:scale-105 transition-transform uppercase text-[10px] tracking-[0.3em] shadow-xl italic">
              Explorar Mercado
            </Link>
            <Link to="/publicar" className="px-12 py-5 border-2 border-primary/20 text-primary font-black rounded-full hover:bg-primary/5 transition-all uppercase text-[10px] tracking-[0.3em] italic">
              Publicar Activo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-6 mb-10 relative z-10">
        <div className="max-w-5xl mx-auto bg-surface-container-high rounded-[2.5rem] shadow-2xl p-10 flex flex-wrap justify-around gap-12 border border-outline-variant/60">
          <div className="text-center group">
            <p className="text-4xl font-black text-primary italic tracking-tighter group-hover:scale-110 transition-transform">{stats.totalLotes || 0}</p>
            <p className="text-[9px] uppercase font-black tracking-[0.4em] text-on-surface-variant/40 italic">Lotes Publicados</p>
          </div>
          <div className="text-center group">
            <p className="text-4xl font-black text-primary italic tracking-tighter group-hover:scale-110 transition-transform">{stats.totalProveedores || 0}</p>
            <p className="text-[9px] uppercase font-black tracking-[0.4em] text-on-surface-variant/40 italic">Tiendas</p>
          </div>
          <div className="text-center group">
            <p className="text-4xl font-black text-primary italic tracking-tighter group-hover:scale-110 transition-transform">{stats.totalServicios || 0}</p>
            <p className="text-[9px] uppercase font-black tracking-[0.4em] text-on-surface-variant/40 italic">Servicios</p>
          </div>
        </div>
      </section>

      {/* Radar Nacional (Map Restore) */}
      <section className="py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-primary uppercase
            tracking-tight mb-8 text-center">Radar Nacional</h2>
          <RadarNacional />
        </div>
      </section>

      {/* Activos de Prestigio (Featured Lots) */}
      <section className="py-10 px-6 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-4xl font-black text-primary leading-none uppercase">Activos de <br/><span className="text-secondary">Prestigio</span></h2>
            </div>
            <Link to="/lotes" className="text-xs font-bold text-primary uppercase tracking-[0.2em] border-b-2 border-secondary/30 pb-2 hover:border-secondary transition-all italic">
              Ver Catálogo Completo
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[...destacados, ...Array(Math.max(0, 3 - destacados.length)).fill(null)].map((lote, idx) =>
                lote ? (
                  <Link key={lote._id} to={`/lote/${lote._id}`} className="group bg-surface-container-high rounded-[3rem] overflow-hidden shadow-xl hover:shadow-primary/5 hover:scale-[1.02] transition-all duration-500 border border-outline-variant/60 flex flex-col">
                    <div className="h-60 overflow-hidden relative bg-surface-container-lowest">
                      <img
                        src={imgUrl(lote.fotos?.[0], "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80")}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                        alt={lote.titulo}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high/90 via-transparent to-transparent"></div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em] mb-2 italic">{lote.categoria}</p>
                      <h3 className="text-2xl font-black text-on-surface mb-6 leading-[0.9] uppercase italic tracking-tighter group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">{lote.titulo}</h3>
                      <div className="mt-auto flex justify-between items-center pt-6 border-t border-outline-variant/10">
                        <p className="text-2xl font-black text-on-surface italic tracking-tighter">USD {lote.precio?.toLocaleString()}</p>
                        <div className="w-12 h-12 machined-gradient text-on-tertiary-fixed rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div key={`placeholder-${idx}`} className="bg-surface-container-low rounded-[3rem] overflow-hidden border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center h-80 text-center p-8">
                    <span className="material-symbols-outlined text-4xl text-primary/20 mb-4">agriculture</span>
                    <p className="text-on-surface-variant/40 font-black uppercase tracking-widest text-xs italic">Próximamente</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto text-center mb-8">
          <h2 className="text-3xl font-black text-primary uppercase tracking-tight mb-4">Cómo funciona</h2>
          <div className="w-20 h-1 bg-secondary mx-auto rounded-full"></div>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { step: "01", title: "Registrarse", desc: "Crea tu perfil profesional como productor o proveedor en segundos.", icon: "person_add" },
            { step: "02", title: "Publicar o Buscar", desc: "Sube tus lotes o navega por el mercado de activos y servicios.", icon: "search" },
            { step: "03", title: "Cerrar Negocio", desc: "Conecta directamente y opera con total seguridad y trazabilidad.", icon: "handshake" }
          ].map((item, idx) => (
            <div key={idx} className="text-center group">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-soft flex items-center justify-center mx-auto mb-6 border border-outline-variant/30 group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">{item.icon}</span>
              </div>
              <p className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-2">{item.step}</p>
              <h4 className="text-xl font-black text-primary uppercase mb-4">{item.title}</h4>
              <p className="text-sm text-outline leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-10 px-6">
        <div className="max-w-5xl mx-auto machined-gradient rounded-[4rem] p-16 text-center text-on-tertiary-fixed relative overflow-hidden shadow-2xl border border-primary/20">
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black uppercase mb-8 leading-[0.85] italic tracking-tighter">Únete a la <br/>revolución rural</h2>
            <Link to="/register" className="inline-block px-16 py-6 bg-white text-primary font-black rounded-full hover:scale-105 transition-transform uppercase text-[11px] tracking-[0.4em] shadow-2xl italic">
              Empezar ahora
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        </div>
      </section>

    </div>
  );
}