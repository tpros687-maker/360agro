import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/userApi";
import { BASE_URL, imgUrl } from "../api/axiosConfig";
import { CheckCircle, Star } from "lucide-react";

const CATEGORIAS = ["Todos", "Terneros", "Novillos", "Vaquillonas", "Vacas", "Invernada", "Maquinaria", "Campos"];

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
      (item.ubicacion || "").toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideCategoria = categoriaActiva === "Todos" || item.categoria === categoriaActiva;

    return coincideTexto && coincideCategoria;
  });

  return (
    <div className="bg-background min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[200px] rounded-full -translate-y-1/2"></div>

      <div className="container mx-auto relative z-10">

        {/* HEADER Y BUSCADOR */}
        <header className="mb-16 border-b border-outline-variant/60 pb-12">
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Global Marketplace</span>
          <h1 className="text-5xl md:text-7xl font-black text-on-surface italic uppercase tracking-tighter leading-none">
            MERCADO <span className="text-primary not-italic">INTELIGENTE</span>
          </h1>

          <div className="mt-12 flex flex-col md:flex-row gap-6">
            <input
              type="text"
              placeholder="Buscar por raza, maquinaria o ubicación..."
              className="flex-1 bg-surface-container-lowest border border-outline-variant/50 p-6 rounded-2xl text-on-surface outline-none focus:border-primary transition-all shadow-xl font-bold placeholder:text-on-surface-variant/20 italic"
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
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${categoriaActiva === cat
                ? "machined-gradient text-on-tertiary-fixed border-primary shadow-xl translate-y-[-2px] italic"
                : "bg-surface-container-low text-on-surface-variant/40 border-outline-variant/30 hover:border-primary/30"
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
                  className="group bg-surface-container-high border border-outline-variant/60 rounded-[2.5rem] overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-xl"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={imgUrl(item.fotos?.[0], "https://images.unsplash.com/photo-1545153996-e13f63438330?q=80&w=2071")}
                      className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110"
                      alt={item.titulo}
                    />
                    <div className="absolute top-4 right-4 bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1 rounded-full border border-outline-variant/20">
                      <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                        {item.categoria}
                      </span>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-on-surface font-black uppercase italic tracking-tighter text-lg truncate flex-1 group-hover:text-primary transition-colors">
                        {item.titulo}
                      </h3>
                      {item.usuario?.esVerificado && (
                        <div className="bg-primary/10 text-primary p-1 rounded-full border border-primary/30">
                          <CheckCircle className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                      <span className="text-[9px] font-black text-on-surface-variant/40 uppercase">📍 {item.ubicacion}</span>
                      {item.cantidad > 0 && (
                        <span className="text-[9px] font-black text-primary uppercase">{item.cantidad} CAB.</span>
                      )}

                      {/* Rating Simple */}
                      <div className="flex items-center gap-1 border-l border-outline-variant/20 pl-4">
                        <Star className="w-2.5 h-2.5 text-primary fill-primary" />
                        <span className="text-[9px] font-black text-on-surface-variant/40">
                          {item.usuario?.rating?.promedio || 5.0}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-outline-variant/10 pt-6">
                      <div>
                        <p className="text-[8px] font-black text-on-surface-variant/40 uppercase mb-1 italic">Inversión</p>
                        <p className="text-xl font-black text-on-surface italic tracking-tighter group-hover:text-primary transition-colors">USD {item.precio?.toLocaleString()}</p>
                      </div>
                      <span className="w-10 h-10 bg-surface-container-low rounded-full flex items-center justify-center text-primary group-hover:machined-gradient group-hover:text-on-tertiary-fixed transition-all shadow-sm">
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-32 text-center bg-surface-container-low rounded-[3rem] border border-outline-variant/10">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-8 block">sentiment_dissatisfied</span>
                <p className="text-on-surface-variant/40 font-black uppercase tracking-widest italic leading-relaxed px-10">No se localizaron activos sincronizados <br />con su criterio de búsqueda</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}