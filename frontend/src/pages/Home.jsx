import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../api/lotApi"; // ✅ Corregido: Importar desde lotApi para obtener lotes
import { AuthContext } from "../context/AuthContext";
import { BASE_URL } from "../api/axiosConfig";

export default function Home() {
  const { usuario } = useContext(AuthContext);
  const [destacados, setDestacados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDestacados = async () => {
      try {
        const { data } = await API.obtenerLotes(); // ✅ Usar la función correcta de tu API
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
    fetchDestacados();
  }, []);

  return (
    <div className="bg-agro-midnight text-agro-cream min-h-screen selection:bg-agro-teal selection:text-agro-midnight">

      {/* 🌑 HERO: TERMINAL DE ENTRADA */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-agro-teal/10 rounded-full blur-[180px] animate-pulse duration-[4s]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-agro-tealDark/5 rounded-full blur-[120px]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
        </div>

        <div className="container mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full mb-10 shadow-2xl backdrop-blur-xl">
            <span className="w-2 h-2 bg-agro-teal rounded-full animate-ping"></span>
            <span className="text-agro-teal text-[9px] font-black uppercase tracking-[0.4em]">Red Operativa 360 Agro</span>
          </div>
          
          <h1 className="text-7xl md:text-[10rem] font-black mb-10 tracking-tighter leading-[0.8] text-white italic">
            ELITE<br />
            <span className="text-agro-teal not-italic font-black text-glow-teal">AGRO</span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-2xl text-agro-cream/40 mb-14 font-medium leading-relaxed italic">
            "Donde la genética de vanguardia se encuentra con la <span className="text-white">inteligencia comercial</span> de última generación."
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {!usuario ? (
              <>
                <Link to="/register" className="btn-emerald px-12 py-6 text-sm group">
                  INICIAR CARGA DE ACTIVOS <span className="inline-block group-hover:translate-x-2 transition-transform">➔</span>
                </Link>
                <Link to="/lotes" className="px-12 py-6 bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-white/10 transition-all uppercase tracking-[0.3em] text-[10px] backdrop-blur-md">
                  EXPLORAR MERCADO
                </Link>
              </>
            ) : (
              <div className="flex gap-4">
                <Link to="/publicar" className="btn-emerald px-12 py-6 text-sm">NUEVA PUBLICACIÓN</Link>
                {/* ✅ CORREGIDO: Ruta alineada con App.js */}
                <Link to="/panel-vendedor" className="px-12 py-6 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-agro-teal hover:text-agro-midnight transition-all">
                  PANEL DE CONTROL
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 🍱 ECOSISTEMA BENTO GRID */}
      <section className="py-40 px-6 bg-agro-midnight border-y border-white/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* DESTACADO HACIENDA */}
            <div className="md:col-span-12 lg:col-span-8 card-midnight p-16 flex flex-col justify-end min-h-[600px] relative group overflow-hidden border-white/5">
              <div className="absolute inset-0 bg-gradient-to-t from-agro-midnight via-agro-midnight/40 to-transparent z-10"></div>
              <img src="https://images.unsplash.com/photo-1545153996-e13f63438330?q=80&w=2071&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[2s]" alt="Campo" />
              <div className="relative z-20">
                <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-6 block italic">Remate Digital</span>
                <h2 className="text-6xl font-black text-white mb-6 italic tracking-tighter leading-none uppercase">Hacienda de <br />Alta <span className="text-agro-teal">Performance</span></h2>
                <p className="text-agro-cream/40 max-w-lg font-bold leading-relaxed text-lg mb-10 italic">Acceda a lotes certificados con trazabilidad total.</p>
                <Link to="/lotes" className="bg-agro-teal text-agro-midnight px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white transition-all inline-block shadow-teal-glow">ENTRAR AL MERCADO ➔</Link>
              </div>
            </div>

            {/* ASESORÍA TÉCNICA */}
            <div className="md:col-span-6 lg:col-span-4 card-midnight p-12 bg-gradient-to-br from-agro-charcoal/80 to-agro-midnight border-white/5 flex flex-col justify-between group">
              <div className="w-20 h-20 bg-agro-teal/10 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-inner border border-agro-teal/20 group-hover:rotate-12 transition-transform duration-500">🛠️</div>
              <div>
                <h3 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">Servicio <span className="text-agro-teal">Pro</span></h3>
                <p className="text-sm text-agro-cream/30 leading-relaxed font-black uppercase tracking-widest">Consultoría técnica personalizada.</p>
                <Link to="/servicios" className="mt-8 block text-agro-teal font-black text-[9px] uppercase tracking-[0.4em] hover:translate-x-2 transition-transform">Ver Expertos ➔</Link>
              </div>
            </div>

            {/* MALL VIRTUAL */}
            <div className="md:col-span-6 lg:col-span-4 card-midnight p-12 bg-white/5 border-agro-teal/10 flex flex-col justify-between group hover:border-agro-teal/30 transition-all">
              <div className="text-6xl mb-8 group-hover:scale-110 transition-transform">📦</div>
              <div>
                <h3 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">Insumos <span className="text-agro-teal">Elite</span></h3>
                <p className="text-sm text-agro-cream/30 leading-relaxed font-black uppercase tracking-widest">Suministros directos de las mejores agroveterinarias.</p>
                <Link to="/tiendas" className="mt-8 block text-agro-teal font-black text-[9px] uppercase tracking-[0.4em] hover:translate-x-2 transition-transform">Explorar Tiendas ➔</Link>
              </div>
            </div>

            {/* STATS REAL-TIME */}
            <div className="md:col-span-12 lg:col-span-8 card-midnight p-12 flex flex-wrap items-center justify-around gap-12 border-white/5 bg-agro-midnight/50 backdrop-blur-3xl shadow-2xl">
              <div className="text-center">
                <span className="text-7xl font-black text-white italic tracking-tighter block mb-2">98<span className="text-agro-teal">%</span></span>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-agro-cream/20">Eficiencia en Carga</p>
              </div>
              <div className="w-px h-20 bg-white/5 hidden md:block"></div>
              <div className="text-center">
                <span className="text-7xl font-black text-white italic tracking-tighter block mb-2">+12k</span>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-agro-cream/20">Visitas Mensuales</p>
              </div>
              <div className="w-px h-20 bg-white/5 hidden md:block"></div>
              <div className="text-center">
                <span className="text-7xl font-black text-white italic tracking-tighter block mb-2">24/7</span>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-agro-cream/20">Soporte Inteligente</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🐎 RANKING DE IMPACTO */}
      <section className="py-40 px-6">
        <div className="container mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-7xl font-black text-white italic tracking-tighter leading-none uppercase">Activos de <br /><span className="text-agro-teal">Selección</span></h2>
            </div>
            <Link to="/lotes" className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] border-b-2 border-agro-teal/20 pb-4 hover:border-agro-teal transition-all">VER TODO EL MERCADO ➔</Link>
          </header>

          {loading ? (
            <div className="flex justify-center py-40">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-agro-teal"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {destacados.map((lote) => (
                <Link key={lote._id} to={`/lotes/${lote._id}`} className="card-midnight group flex flex-col h-full hover:scale-[1.03] transition-all duration-700 bg-agro-charcoal/20 border-white/5">
                  <div className="h-80 overflow-hidden relative">
                    <img src={lote.fotos?.[0] ? `${BASE_URL}${lote.fotos[0]}` : "/placeholder.png"} className="w-full h-full object-cover group-hover:scale-110 transition duration-[2s]" alt={lote.titulo} />
                  </div>
                  <div className="p-12 flex flex-col flex-1">
                    <h3 className="text-3xl font-black text-white mb-8 group-hover:text-agro-teal transition-colors italic tracking-tighter uppercase leading-tight">{lote.titulo}</h3>
                    <div className="mt-auto grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                      <div>
                        <p className="text-[9px] text-agro-cream/20 font-black uppercase tracking-widest mb-1">Inversión Activo</p>
                        <span className="text-2xl font-black text-white italic tracking-tighter leading-none">USD {lote.precio?.toLocaleString()}</span>
                      </div>
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