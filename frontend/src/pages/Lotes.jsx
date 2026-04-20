import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import lotApi from "../api/lotApi";
import { BASE_URL } from "../api/axiosConfig";
import { toast } from "react-hot-toast";
import { MapPin, TrendingUp, Beef, ArrowRight, Sparkles } from "lucide-react";
import SEO from "../components/SEO";

const CATEGORIAS_LOTES = ["Todas", "Terneros", "Terneras", "Novillos", "Vaquillonas", "Vacas", "Toros", "Pieza de Cría"];

export default function Lotes() {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCat, setFiltroCat] = useState("Todas");
  const [orden, setOrden] = useState("recientes");
  const [busqueda, setBusqueda] = useState("");
  const [searchParams] = useSearchParams();
  const deptoQueCarga = searchParams.get("depto");

  const cargarLotes = async () => {
    try {
      setLoading(true);
      const { data } = await lotApi.obtenerLotes(filtroCat !== "Todas" ? filtroCat : null);

      let filtrados = data;
      if (deptoQueCarga) {
        filtrados = data.filter(l => {
          const depto = (l.departamento || "").toLowerCase();
          const ubicacion = (l.ubicacion || "").toLowerCase();
          const localidad = (l.localidad || "").toLowerCase();
          return depto.includes(deptoQueCarga.toLowerCase()) ||
                 ubicacion.includes(deptoQueCarga.toLowerCase()) ||
                 localidad.includes(deptoQueCarga.toLowerCase());
        });
      }

      setLotes(filtrados);
    } catch (error) {
      toast.error("Error al sincronizar el mercado de lotes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLotes();
  }, [filtroCat, deptoQueCarga]);

  const lotesFiltrados = busqueda
    ? lotes.filter(l => {
        const q = busqueda.toLowerCase();
        return (
          l.titulo?.toLowerCase().includes(q) ||
          l.raza?.toLowerCase().includes(q) ||
          l.categoria?.toLowerCase().includes(q) ||
          l.ubicacion?.toLowerCase().includes(q) ||
          l.departamento?.toLowerCase().includes(q)
        );
      })
    : lotes;

  return (
    <div className="bg-background min-h-screen pt-32 pb-32 px-6 relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      <SEO
        title="Lotes Ganaderos — 360 Agro"
        description="Explorá lotes de hacienda en venta: terneros, novillos, vacas, toros y más. Conectate con productores uruguayos."
        url="https://360agro.vercel.app/lotes"
      />
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 blur-[150px] rounded-full translate-y-1/2"></div>

      <div className="container mx-auto relative z-10">

        {/* HEADER DE SECCIÓN */}
        <header className="mb-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-0.5 machined-gradient"></div>
                <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em]">Hacienda y activos del campo</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-on-surface italic tracking-tighter uppercase leading-none">
                Mercado de Lotes
              </h1>
            </div>

            {/* FILTROS RÁPIDOS */}
            <div className="flex flex-col gap-4 lg:items-end">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg">search</span>
                <input
                  type="text"
                  placeholder="Buscar por raza, categoría o ubicación..."
                  className="bg-surface-container-low border border-outline-variant/50 focus:border-primary/50 pl-11 pr-5 py-3 rounded-full outline-none transition-all font-bold text-on-surface text-[10px] placeholder:text-on-surface-variant/30 uppercase tracking-widest w-72"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className="relative">
                <select
                  value={filtroCat}
                  onChange={(e) => setFiltroCat(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant/50 text-on-surface-variant font-bold text-[10px] uppercase tracking-widest px-6 py-3 rounded-full outline-none cursor-pointer appearance-none hover:border-primary/40 transition-all pr-10"
                >
                  {CATEGORIAS_LOTES.map(cat => (
                    <option key={cat} value={cat} className="bg-surface-container-highest text-on-surface">{cat}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary text-sm">expand_more</span>
              </div>
              <select
                value={orden}
                onChange={e => setOrden(e.target.value)}
                className="bg-surface-container-low text-on-surface-variant border border-outline-variant/50 hover:border-primary/40 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest cursor-pointer outline-none transition-all appearance-none"
              >
                <option value="recientes">Más recientes</option>
                <option value="precio_asc">Menor precio</option>
                <option value="precio_desc">Mayor precio</option>
                <option value="cantidad_desc">Mayor cantidad</option>
              </select>
            </div>
          </div>

          {deptoQueCarga && (
            <div className="mt-6 inline-flex items-center gap-3 px-5 py-2 bg-surface-container-high border border-outline-variant/30 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {deptoQueCarga}
            </div>
          )}
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-[550px] bg-surface-container-high/40 animate-pulse rounded-3xl border border-outline-variant/5"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lotesFiltrados.length > 0 ? [...lotesFiltrados].sort((a, b) => {
              if (orden === "precio_asc") return a.precio - b.precio;
              if (orden === "precio_desc") return b.precio - a.precio;
              if (orden === "cantidad_desc") return b.cantidad - a.cantidad;
              return new Date(b.createdAt) - new Date(a.createdAt); // recientes
            }).map((lote) => (
              <Link
                to={`/lotes/${lote._id}`}
                key={lote._id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={lote.fotos?.[0] ? (lote.fotos[0].startsWith('http') ? lote.fotos[0] : `${BASE_URL}${lote.fotos[0]}`) : "https://images.unsplash.com/photo-1545153996-e13f63438330?q=80&w=2071"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    alt={lote.titulo}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{lote.cantidad} cabezas</span>
                  </div>
                  {lote.documentoPropiedad && lote.numeroDicose && (
                    <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-white text-xs">verified</span>
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest">Verificado</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">
                      {lote.categoria}
                    </span>
                    <span className="text-[9px] text-on-surface-variant uppercase tracking-widest">{lote.raza}</span>
                  </div>

                  <h3 className="text-sm font-black text-on-surface uppercase tracking-tight mb-4 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                    {lote.titulo}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-surface-container-low rounded-xl p-2.5">
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Peso prom.</p>
                      <p className="text-[11px] font-black text-on-surface">{lote.pesoPromedio || 0} kg</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-2.5">
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Ubicación</p>
                      <p className="text-[11px] font-black text-on-surface truncate">{lote.localidad || lote.departamento || lote.ubicacion}</p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-outline-variant/30">
                    <div>
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Precio</p>
                      <p className="text-xl font-black text-primary">USD {lote.precio?.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-full py-48 text-center bg-surface-container-low rounded-[3rem] border border-outline-variant/10">
                <span className="material-symbols-outlined text-6xl text-outline/20 mb-8 block">sentiment_dissatisfied</span>
                <p className="text-on-surface-variant text-xl font-bold uppercase tracking-widest italic mb-10">Sin activos en esta jurisdicción</p>
                <Link to="/lotes" className="inline-block px-12 py-5 machined-gradient text-on-tertiary-fixed font-bold rounded-full hover:scale-105 transition-transform uppercase text-xs tracking-widest">VER MERCADO GLOBAL</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
