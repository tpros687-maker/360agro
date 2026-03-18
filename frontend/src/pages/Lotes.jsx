import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import lotApi from "../api/lotApi";
import { BASE_URL } from "../api/axiosConfig";
import { toast } from "react-hot-toast";

const CATEGORIAS_LOTES = ["Todas", "Terneros", "Terneras", "Novillos", "Vaquillonas", "Vacas", "Toros", "Pieza de Cría"];

export default function Lotes() {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroCat, setFiltroCat] = useState("Todas");

  const cargarLotes = async () => {
    try {
      setLoading(true);
      // El controlador ya soporta ?categoria= y ?search=
      const { data } = await lotApi.obtenerLotes(filtroCat !== "Todas" ? filtroCat : null);
      setLotes(data);
    } catch (error) {
      toast.error("Error al sincronizar el mercado de lotes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLotes();
  }, [filtroCat]);

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-20 px-6">
      <div className="container mx-auto">
        
        {/* HEADER DE SECCIÓN */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none">
              Lotes <span className="text-agro-teal block md:inline">Disponibles</span>
            </h1>
            <p className="text-agro-cream/20 font-black uppercase tracking-[0.4em] mt-4">Mercado de Hacienda Directo</p>
          </div>

          {/* FILTROS RÁPIDOS */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS_LOTES.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroCat(cat)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                  filtroCat === cat 
                  ? "bg-agro-teal text-agro-midnight border-agro-teal shadow-teal-glow" 
                  : "bg-white/5 text-white/40 border-white/10 hover:border-agro-teal/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-[500px] bg-agro-charcoal animate-pulse rounded-[3rem]"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {lotes.length > 0 ? lotes.map((lote) => (
              <Link 
                to={`/lotes/${lote._id}`} 
                key={lote._id}
                className="group relative bg-agro-charcoal border border-white/5 rounded-[3.5rem] overflow-hidden hover:scale-[1.02] transition-all duration-700 shadow-2xl"
              >
                {/* Badge de Cantidad */}
                <div className="absolute top-8 left-8 z-20 bg-agro-teal text-agro-midnight px-6 py-2 rounded-full font-black text-xl shadow-2xl">
                  {lote.cantidad} <span className="text-[10px] uppercase">Cabezas</span>
                </div>

                {/* Imagen con Overlay */}
                <div className="relative h-[350px] overflow-hidden">
                  <img 
                    src={lote.fotos?.[0] ? `${BASE_URL}${lote.fotos[0]}` : "/placeholder-lote.jpg"} 
                    className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-[1.5s]"
                    alt={lote.titulo}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-agro-midnight via-transparent to-transparent opacity-90"></div>
                </div>

                {/* Info del Lote */}
                <div className="p-10 -mt-20 relative z-10">
                  <span className="text-agro-teal text-[10px] font-black uppercase tracking-[0.3em] mb-2 block italic">
                    {lote.raza} • {lote.categoria}
                  </span>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-6 group-hover:text-agro-teal transition-colors">
                    {lote.titulo}
                  </h3>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div>
                        <p className="text-agro-cream/20 text-[8px] font-black uppercase tracking-widest">Peso Promedio</p>
                        <p className="text-xl font-black text-white italic">{lote.pesoPromedio} KG</p>
                    </div>
                    <div className="text-right">
                        <p className="text-agro-cream/20 text-[8px] font-black uppercase tracking-widest">Ubicación</p>
                        <p className="text-sm font-black text-white uppercase">{lote.zona}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="col-span-full py-40 text-center">
                <p className="text-agro-cream/20 text-xl font-black uppercase tracking-[0.5em]">No se encontraron lotes en esta categoría</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}