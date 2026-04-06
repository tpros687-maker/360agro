import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import lotApi from "../api/lotApi";
import { BASE_URL } from "../api/axiosConfig";
import { toast } from "react-hot-toast";
import { MapPin, TrendingUp, Beef, ArrowRight, Sparkles } from "lucide-react";

const CATEGORIAS_LOTES = ["Todas", "Terneros", "Terneras", "Novillos", "Vaquillonas", "Vacas", "Toros", "Pieza de Cría"];

export default function Lotes() {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCat, setFiltroCat] = useState("Todas");
  const [searchParams] = useSearchParams();
  const deptoQueCarga = searchParams.get("depto");

  const cargarLotes = async () => {
    try {
      setLoading(true);
      const { data } = await lotApi.obtenerLotes(filtroCat !== "Todas" ? filtroCat : null);

      let filtrados = data;
      if (deptoQueCarga) {
        filtrados = data.filter(l => l.departamento?.toLowerCase() === deptoQueCarga.toLowerCase());
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

  return (
    <div className="bg-background min-h-screen pt-32 pb-32 px-6 relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 blur-[150px] rounded-full translate-y-1/2"></div>

      <div className="container mx-auto relative z-10">

        {/* HEADER DE SECCIÓN */}
        <header className="mb-24 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-1 machined-gradient shadow-[0_0_15px_rgba(63,111,118,0.4)]"></div>
              <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em] italic">Mercado de Activos Vivos</span>
            </div>
            <h1 className="text-6xl md:text-[9rem] font-black text-on-surface italic tracking-tighter uppercase leading-[0.85] mb-6 glow-text">
              GESTIÓN <br /><span className="text-primary not-italic">DE LOTES</span>
            </h1>
            {deptoQueCarga && (
              <p className="inline-flex items-center gap-3 px-5 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest italic shadow-xl">
                <span className="material-symbols-outlined text-sm">location_on</span> Jurisdicción: {deptoQueCarga}
              </p>
            )}
          </div>

          {/* FILTROS RÁPIDOS */}
          <div className="flex flex-wrap gap-3 lg:justify-end max-w-2xl">
            {CATEGORIAS_LOTES.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroCat(cat)}
                className={`px-8 py-3.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${filtroCat === cat
                  ? "machined-gradient text-on-tertiary-fixed border-none shadow-[0_0_20px_rgba(63,111,118,0.3)] scale-105"
                  : "bg-surface-container-low text-on-surface-variant border-outline-variant/10 hover:border-primary/40 hover:text-on-surface"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => <div key={i} className="h-[550px] bg-surface-container-high/40 animate-pulse rounded-3xl border border-outline-variant/5"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {lotes.length > 0 ? lotes.map((lote) => (
              <Link
                to={`/lotes/${lote._id}`}
                key={lote._id}
                className="group relative flex flex-col h-full bg-surface-container-high rounded-[2.5rem] border border-outline-variant/10 overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-xl hover:shadow-primary/5"
              >
                {/* Badge de Cantidad */}
                <div className="absolute top-8 left-8 z-20 machined-gradient text-on-tertiary-fixed px-8 py-4 rounded-2xl font-black text-3xl shadow-2xl italic tracking-tighter">
                  {lote.cantidad} <span className="text-[10px] uppercase block -mt-1 opacity-60 tracking-widest font-bold">Cabezas</span>
                </div>

                {/* Imagen con Overlay */}
                <div className="relative h-[400px] overflow-hidden">
                  <img
                    src={lote.fotos?.[0] ? `${BASE_URL}${lote.fotos[0]}` : "https://images.unsplash.com/photo-1545153996-e13f63438330?q=80&w=2071&auto=format&fit=crop"}
                    className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[2s] group-hover:scale-105"
                    alt={lote.titulo}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-transparent to-transparent"></div>

                  {/* Badge de Verificación */}
                  {lote.documentoPropiedad && lote.numeroDicose && (
                    <div className="absolute bottom-6 right-8 z-20 flex items-center gap-2 bg-agro-midnight/60 backdrop-blur-md px-4 py-2 rounded-full border border-[#00E5FF]/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                      <span className="material-symbols-outlined text-[#00E5FF] text-sm font-bold">verified_user</span>
                      <span className="text-[#00E5FF] text-[9px] font-black uppercase tracking-[0.2em] italic">Verificado</span>
                    </div>
                  )}
                </div>

                {/* Info del Lote */}
                <div className="p-10 -mt-24 relative z-10 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-primary/10 text-primary text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest italic border border-primary/20">
                      {lote.raza}
                    </span>
                    <span className="text-on-surface-variant text-[9px] font-bold uppercase tracking-widest leading-none">
                      {lote.categoria}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black text-on-surface italic uppercase tracking-tighter mb-8 group-hover:text-primary transition-colors leading-[0.9] line-clamp-2">
                    {lote.titulo}
                  </h3>

                  <div className="mt-auto flex items-end justify-between pt-8 border-t border-outline-variant/10">
                    <div className="space-y-1">
                      <p className="text-on-surface-variant text-[8px] font-bold uppercase tracking-[0.4em] italic mb-1 opacity-50">Tasación Base</p>
                      <p className="text-4xl font-black text-on-surface italic tracking-tighter group-hover:text-primary transition-colors flex items-baseline gap-1">
                        <span className="text-sm not-italic opacity-40 font-bold">USD</span>{lote.precio?.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 text-primary font-bold uppercase text-[10px] tracking-widest mb-2">
                        <span className="material-symbols-outlined text-sm">location_on</span> {lote.departamento || lote.zona}
                      </div>
                      <p className="text-on-surface-variant text-[9px] font-bold uppercase tracking-widest opacity-60 italic">{lote.pesoPromedio} KG PROM.</p>
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
