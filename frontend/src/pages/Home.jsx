import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import API from "../api/lotApi";
import { AuthContext } from "../context/AuthContext";
import { BASE_URL } from "../api/axiosConfig";
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

    fetchDestacados();
    fetchSettings();
  }, []);

  // Navigation handler removed

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden min-h-[716px] flex items-center">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10"></div>
          <img
            className="w-full h-full object-cover"
            alt="360AGRO Hero"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA93n17aJ2iWq5lbmWqPXYfCbMC7QLJkMHU4nI_MC7vVqb2oeTg3Maciqo0JyN_M8OhffNv36Gsfk75WDK6SQ2EohuXqXDVkgzv8c7HKmAMF_VJoithTNYO8PcibOYrMTfjnZemZAg6Bct5L978UYZRU71DEB281_9QWgsKmhRcjahDMmn8LUQdimmOFI15jJ59ZnbMXqA2f9YnvypX4BHY6nK2PMk2cycI5Xv2GI-lTFm4cZ-7k_7G1BU4AyaNyZXPC7jGhlJJz9bf"
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto text-center pt-20">
          <span className="uppercase tracking-[0.4em] text-primary-fixed mb-4 block text-xs font-bold"></span>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-on-surface mb-6 glow-text leading-[0.9]">
            {settings.home_hero_title || "AL ALCANCE DEL"} <br /> <span className="text-primary not-italic text-glow-teal">{settings.home_hero_title_highlight || "PRODUCTOR"}</span>
          </h1>
          <p className="text-lg md:text-2xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-light italic">
            {settings.home_hero_subtitle || "La terminal digital líder para el mercado soberano. Operaciones seguras y trazabilidad absoluta integradas en un solo comando."}
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/lotes" className="px-12 py-5 machined-gradient text-on-tertiary-fixed font-bold rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(63,111,118,0.4)] uppercase text-xs tracking-widest">
              {settings.home_hero_cta_l || "EXPLORAR ACTIVOS"}
            </Link>
            <Link to="/panel-vendedor" className="px-12 py-5 bg-surface-variant/40 backdrop-blur-md border border-outline-variant/30 text-on-surface font-semibold rounded-full hover:bg-surface-variant transition-colors uppercase text-xs tracking-widest">
              {settings.home_hero_cta_r || "PANEL DE CONTROL"}
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="px-6 py-8">
        <RadarNacional />
      </section>

      {/* Value Architecture Bento Grid */}
      <section className="px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.4em] text-[#3F6F76] mb-2">Nuestra Propuesta</h2>
          <h3 className="text-4xl md:text-5xl font-black italic tracking-tight text-on-surface glow-text">Arquitectura de Valor</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large Bento Card */}
          <div className="md:col-span-2 p-10 rounded-3xl bg-surface-container-high relative overflow-hidden group">
            <div className="relative z-10 max-w-md">
              <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary-container/20">
                <span className="material-symbols-outlined text-on-tertiary-fixed text-4xl">inventory_2</span>
              </div>
              <div className="flex flex-col h-full">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 italic">Sistema de Activos</span>
                <h3 className="text-4xl font-black text-on-surface italic tracking-tighter mb-4 leading-none uppercase">
                  {settings.home_bento_l_title || "Mercado de Lotes"}
                </h3>
                <p className="text-on-surface-variant/60 text-sm font-medium leading-relaxed italic mb-8 uppercase tracking-wider">
                  {settings.home_bento_l_text || "Gestión de activos territoriales con precisión satelital."}
                </p>
                <div className="mt-auto flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-widest group-hover:gap-5 transition-all">
                  ACCEDER AL MERCADO <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </div>
            <div className="absolute right-0 bottom-0 w-1/2 opacity-20 group-hover:scale-110 transition-transform duration-700">
              <img className="w-full h-full object-cover" alt="Logistics" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVKPJO5XkhLy1me3SixJPHKG_T_BqnFKCHsKR3GET30FZu7d69DVnfekxZhZIq1e4-Y4kECSqPc6QzFxvYVM_urhyMS9by5guJrFEbctsGDYmuBGJrZWJrmSp_Tn4q7BNWsVXSQB3b5HGwE-gpeOLLHY3wj-zscdeU9uMQLSR5YfqCguC29eT8ppkyenRqxwFaYf4UzY0DEbWJMuSl6JB_g8BnYbaQDSWyQQ1aw_lK-fJbu9wp2kwU0nz7MB5uFRGc3Mn-iyLMus-l" />
            </div>
          </div>

          {/* Secondary Bento Card */}
          <div className="p-10 rounded-3xl bg-surface-variant/20 border border-outline-variant/15 flex flex-col group">
            <div className="w-16 h-16 bg-surface-container-highest border border-primary-container/30 rounded-2xl flex items-center justify-center mb-8">
              <span className="material-symbols-outlined text-primary text-3xl">insights</span>
            </div>
            <h4 className="text-2xl font-bold italic text-on-surface mb-4">Mercado Transparente</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed mb-auto">
              Visualización de precios en tiempo real sin intermediarios opacos. Datos puros para decisiones inteligentes.
            </p>
            <div className="mt-8 pt-8 border-t border-outline-variant/10">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-outline">Volumen Diario</span>
                <span className="text-lg font-black text-primary">+12.4%</span>
              </div>
            </div>
          </div>

          {/* Tertiary Bento Card */}
          <div className="p-10 rounded-3xl bg-surface-container-high border border-outline-variant/15 group hover:border-primary-container/40 transition-colors">
            <span className="material-symbols-outlined text-primary text-5xl mb-6 block">precision_manufacturing</span>
            <h4 className="text-2xl font-bold italic text-on-surface mb-4">Logística de Precisión</h4>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Optimización de rutas y gestión de flotas integrada con inteligencia satelital para reducir costos operativos.
            </p>
          </div>

          <div className="md:col-span-2 p-10 rounded-3xl bg-gradient-to-br from-surface-container-high to-surface-container-low border border-outline-variant/15 flex items-center justify-between">
            <div>
              <h4 className="text-2xl font-bold italic text-on-surface mb-2">Central de Operaciones</h4>
              <p className="text-on-surface-variant max-w-sm">Acceda a todas sus herramientas críticas desde una interfaz unificada.</p>
            </div>
            <Link to="/panel-vendedor" className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-tertiary-fixed hover:scale-110 transition-transform shadow-xl">
              <span className="material-symbols-outlined text-3xl">play_arrow</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Footer Section */}
      <section className="bg-surface-container-lowest py-20 border-t border-outline-variant/10">
        <div className="px-6 max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <p className="text-5xl font-black italic tracking-tighter text-primary mb-2 glow-text">1.2M</p>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-on-surface-variant">Hectáreas Protegidas</p>
          </div>
          <div>
            <p className="text-5xl font-black italic tracking-tighter text-primary mb-2 glow-text">15k</p>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-on-surface-variant">Productores Verificados</p>
          </div>
          <div>
            <p className="text-5xl font-black italic tracking-tighter text-primary mb-2 glow-text">24/7</p>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-on-surface-variant">Monitoreo Ledger</p>
          </div>
          <div>
            <p className="text-5xl font-black italic tracking-tighter text-primary mb-2 glow-text">100%</p>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-on-surface-variant">Soberanía de Datos</p>
          </div>
        </div>
      </section>

      {/* Activos de Prestigio Section (Existing Dynamic Data) */}
      <section className="py-24 px-6 bg-surface-container-low/30 relative">
        <div className="container mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <h2 className="text-6xl font-black text-on-surface italic tracking-tighter leading-none uppercase">Activos de <br /><span className="text-primary">Prestigio</span></h2>
            <Link to="/lotes" className="text-primary font-bold text-[10px] uppercase tracking-[0.5em] border-b-2 border-primary-container/30 pb-4 hover:border-primary transition-all italic">CATÁLOGO ESTRATÉGICO ➔</Link>
          </header>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {destacados.map((lote) => (
                <Link key={lote._id} to={`/lotes/${lote._id}`} className="rounded-3xl bg-surface-container-high border border-outline-variant/10 overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-xl">
                  <div className="h-64 overflow-hidden relative">
                    <img src={lote.fotos?.[0] ? `${BASE_URL}${lote.fotos[0]}` : "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?q=80&w=2070&auto=format&fit=crop"} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt={lote.titulo} />
                  </div>
                  <div className="p-8">
                    <span className="text-[0.6rem] font-bold uppercase tracking-widest text-primary mb-2 block">{lote.categoria}</span>
                    <h3 className="text-2xl font-black text-on-surface mb-6 uppercase italic leading-none">{lote.titulo}</h3>
                    <div className="flex justify-between items-center pt-6 border-t border-outline-variant/10">
                      <span className="text-2xl font-black text-on-surface">USD {lote.precio?.toLocaleString()}</span>
                      <span className="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}