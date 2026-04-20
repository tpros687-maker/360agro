import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { BASE_URL, imgUrl } from "../api/axiosConfig";
import {
  Store,
  MapPin,
  Star,
  ArrowRight,
  Search,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import SEO from "../components/SEO";

export default function Tiendas() {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRubro, setFiltroRubro] = useState("todos");
  const [searchParams] = useSearchParams();
  const deptoQueCarga = searchParams.get("depto");

  useEffect(() => {
    const fetchTiendas = async () => {
      try {
        const { data } = await api.get("/proveedores?tipo=tienda");

        let filtrados = data;
        if (deptoQueCarga) {
          filtrados = data.filter(t => t.departamento?.toLowerCase() === deptoQueCarga.toLowerCase());
        }

        setTiendas(filtrados);
      } catch (err) {
        console.error("Error al cargar el registro de tiendas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTiendas();
  }, [deptoQueCarga]);

  const rubros = ["todos", ...new Set(tiendas.map(t => t.rubro).filter(Boolean))];

  const tiendasFiltradas = tiendas.filter(t => {
    const q = busqueda.toLowerCase();
    const matchBusqueda = !busqueda ||
      t.nombre?.toLowerCase().includes(q) ||
      t.descripcion?.toLowerCase().includes(q) ||
      t.zona?.toLowerCase().includes(q) ||
      t.departamento?.toLowerCase().includes(q);
    const matchRubro = filtroRubro === "todos" || t.rubro === filtroRubro;
    return matchBusqueda && matchRubro;
  });

  return (
    <div className="bg-background min-h-screen pt-32 pb-32 px-6 relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      <SEO
        title="Tiendas Agropecuarias — 360 Agro"
        description="Descubrí tiendas agropecuarias de Uruguay. Productos del campo, insumos y más en un solo lugar."
        url="https://360agro.vercel.app/tiendas"
      />

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-primary/5 blur-[250px] rounded-full pointer-events-none opacity-40"></div>

      <section className="container mx-auto mb-12 relative z-10">
        <header className="mb-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-0.5 machined-gradient"></div>
                <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em]">Negocios del campo</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-on-surface italic tracking-tighter uppercase leading-none">
                Tiendas
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg">search</span>
                <input
                  type="text"
                  placeholder="Buscar por nombre, rubro o ubicación..."
                  className="bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 pl-11 pr-5 py-3 rounded-full outline-none transition-all font-bold text-on-surface text-[10px] placeholder:text-on-surface-variant/30 uppercase tracking-widest w-72 shadow-sm"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className="relative">
                <select
                  className="bg-surface-container-lowest border border-outline-variant/50 text-on-surface-variant font-bold text-[10px] uppercase tracking-widest px-6 py-3 rounded-full outline-none cursor-pointer appearance-none hover:border-primary/40 transition-all pr-10 shadow-sm"
                  value={filtroRubro}
                  onChange={(e) => setFiltroRubro(e.target.value)}
                >
                  {rubros.map(r => (
                    <option key={r} value={r} className="bg-surface-container-highest text-on-surface">{r === "todos" ? "Todos los rubros" : r}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary text-sm">expand_more</span>
              </div>
            </div>
          </div>

          {deptoQueCarga && (
            <div className="mt-6 inline-flex items-center gap-3 px-5 py-2 bg-surface-container-high border border-outline-variant/30 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {deptoQueCarga}
            </div>
          )}
        </header>
      </section>

      <div className="container mx-auto relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => <div key={i} className="h-[550px] bg-surface-container-high/40 rounded-[2.5rem] animate-pulse border border-outline-variant/5 shadow-2xl"></div>)}
          </div>
        ) : tiendasFiltradas.length === 0 ? (
          <div className="text-center py-48 bg-surface-container-low rounded-[3rem] border border-outline-variant/70">
            <span className="material-symbols-outlined text-6xl text-outline/20 mb-8 block">hub</span>
            <p className="text-on-surface-variant text-xl font-bold italic uppercase tracking-widest opacity-40">Terminales Inactivos en Zona</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {tiendasFiltradas.map((t) => (
              <Link
                key={t._id}
                to={`/tienda/${t.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={imgUrl(t.logo, "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974")}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    alt={t.nombre}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{t.rubro || "Tienda"}</span>
                  </div>
                  {t.esVerificado && (
                    <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-white text-xs">verified</span>
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest">Verificado</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-sm font-black text-on-surface uppercase tracking-tight mb-4 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                    {t.nombre}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-surface-container-low rounded-xl p-2.5">
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Rubro</p>
                      <p className="text-[11px] font-black text-on-surface truncate">{t.rubro || "—"}</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-2.5">
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Ubicación</p>
                      <p className="text-[11px] font-black text-on-surface truncate">{t.departamento || t.zona || "Uruguay"}</p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-outline-variant/30">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Explorar tienda</span>
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
