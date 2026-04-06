import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/userApi";
import { BASE_URL } from "../api/axiosConfig";
import { CheckCircle, Star } from "lucide-react";

const CATEGORIAS = ["Todos", "Ganado", "Maquinaria", "Insumos", "Servicios"];

export default function Explorar() {
  const [activos, setActivos] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarMercado = async () => {
      try {
        setLoading(true);
        // Aquí traeremos lotes y, a futuro, productos de tiendas
        const { data } = await API.get("/lots");
        setActivos(data);
      } catch (error) {
        console.error("❌ Error al cargar mercado:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarMercado();
  }, []);

  // Lógica de Filtrado Combinado
  const activosFiltrados = activos.filter((item) => {
    const coincideTexto = item.titulo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      item.ubicacion.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideCategoria = categoriaActiva === "Todos" || item.categoria === categoriaActiva;

    return coincideTexto && coincideCategoria;
  });

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-20 px-6">
      <div className="container mx-auto">

        {/* HEADER Y BUSCADOR */}
        <header className="mb-16">
          <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Global Marketplace</span>
          <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">
            MERCADO <span className="text-agro-teal not-italic">INTELIGENTE</span>
          </h1>

          <div className="mt-12 flex flex-col md:flex-row gap-6">
            <input
              type="text"
              placeholder="Buscar por raza, maquinaria o ubicación..."
              className="flex-1 bg-agro-charcoal border border-white/5 p-6 rounded-2xl text-white outline-none focus:border-agro-teal transition-all shadow-2xl font-bold placeholder:text-white/10"
              onChange={(e) => setFiltroTexto(e.target.value)}
            />
          </div>
        </header>

        {/* SELECTOR DE CATEGORÍAS */}
        <div className="flex flex-wrap gap-3 mb-12">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${categoriaActiva === cat
                ? "bg-agro-teal text-agro-midnight shadow-teal-glow translate-y-[-2px]"
                : "bg-white/5 text-white/30 border border-white/5 hover:bg-white/10"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRILLA DE RESULTADOS */}
        {loading ? (
          <div className="text-center py-20 animate-pulse text-agro-teal font-black uppercase tracking-[0.5em]">
            Sincronizando Activos...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {activosFiltrados.length > 0 ? (
              activosFiltrados.map((item) => (
                <Link
                  to={`/lotes/${item._id}`}
                  key={item._id}
                  className="group bg-agro-charcoal/40 border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-agro-teal/30 transition-all duration-500 hover:translate-y-[-5px]"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={`${BASE_URL}${item.fotos[0]}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={item.titulo}
                    />
                    <div className="absolute top-4 right-4 bg-agro-midnight/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      <span className="text-[8px] font-black text-agro-teal uppercase tracking-widest">
                        {item.categoria}
                      </span>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-black uppercase italic tracking-tighter text-lg truncate flex-1">
                        {item.titulo}
                      </h3>
                      {item.usuario?.esVerificado && (
                        <div className="bg-agro-teal/20 text-agro-teal p-1 rounded-full border border-agro-teal/30 shadow-teal-glow-sm">
                          <CheckCircle className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                      <span className="text-[9px] font-black text-white/30 uppercase">📍 {item.ubicacion}</span>
                      {item.cantidad > 0 && (
                        <span className="text-[9px] font-black text-agro-teal uppercase">{item.cantidad} CAB.</span>
                      )}

                      {/* Rating Simple */}
                      <div className="flex items-center gap-1 border-l border-white/5 pl-4">
                        <Star className="w-2.5 h-2.5 text-agro-teal fill-agro-teal" />
                        <span className="text-[9px] font-black text-white/40">
                          {item.usuario?.rating?.promedio || 5.0}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-6">
                      <div>
                        <p className="text-[8px] font-black text-white/20 uppercase mb-1">Inversión</p>
                        <p className="text-xl font-black text-white italic">USD {item.precio.toLocaleString()}</p>
                      </div>
                      <span className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-agro-teal group-hover:bg-agro-teal group-hover:text-agro-midnight transition-all">
                        ➔
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-agro-cream/20 font-black uppercase tracking-widest">No se encontraron activos con esos criterios</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}