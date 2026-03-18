import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import tiendaApi from "../api/tiendaApi";
import productoApi from "../api/productoApi";
import { Search } from "lucide-react";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

const BASE_URL = "http://localhost:5000";

const CATEGORIAS = [
  "Todas",
  "Semillas",
  "Fertilizantes",
  "Agroquímicos",
  "Herramientas",
  "Maquinaria",
  "Repuestos",
  "Otros",
];

export default function TiendaDetalle() {
  const { slug } = useParams();
  const { agregarAlCarrito } = useContext(CartContext);

  const [tienda, setTienda] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [q, setQ] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  const cargarTienda = async () => {
    try {
      const resp = await tiendaApi.obtenerTiendaPorSlug(slug);
      setTienda(resp.data);
    } catch (error) {
      console.error("❌ Error cargando tienda:", error);
    }
  };

  const cargarProductos = useCallback(async () => {
    try {
      // Construir query string
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (categoria !== "Todas") params.append("categoria", categoria);

      // Fetch con axios a /productos/tienda/slug?q=...&categoria=...
      // Necesitamos asegurar que axios pase params si modificamos productoApi, 
      // o construimos la url completa. En productoApi: api.get(`/productos/tienda/${slug}`, { params })
      // Como productoApi.obtenerProductosPorTienda(slug, params) quizá no soporta params aún,
      // actualizaremos productoApi.js para recibir params, pero temporalmente añadimos manualmente a la url.
      const queryStr = params.toString() ? `?${params.toString()}` : "";

      const resp = await productoApi.obtenerProductosPorTienda(`${slug}${queryStr}`);
      setProductos(resp.data);
    } catch (error) {
      console.error("❌ Error cargando productos:", error);
    }
  }, [slug, searchQuery, categoria]);

  useEffect(() => {
    const init = async () => {
      await cargarTienda();
      await cargarProductos();
      setLoading(false);
    };
    init();
  }, [slug]); // Carga inicial de datos de tienda

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(q);
    }, 500);
    return () => clearTimeout(timer);
  }, [q]);

  if (loading) {
    return (
      <div className="bg-agro-midnight min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-agro-teal shadow-teal-glow"></div>
      </div>
    );
  }

  if (!tienda) {
    return (
      <div className="bg-agro-midnight min-h-screen pt-40 text-center">
        <h2 className="text-4xl font-black text-white italic mb-10">Showroom no disponible</h2>
        <Link to="/tiendas" className="text-agro-teal font-black uppercase tracking-widest border-b border-agro-teal/20 pb-2">Regresar al mercado</Link>
      </div>
    );
  }

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-agro-teal/5 rounded-full blur-[200px] pointer-events-none"></div>

      <div className="container mx-auto relative z-10">

        {/* SHOP HEADER NOIR */}
        <section className="bg-agro-charcoal border border-white/5 p-12 rounded-[3.5rem] shadow-2xl mb-16 relative overflow-hidden flex flex-col md:flex-row items-center gap-12 group">
          <div className="w-48 h-48 bg-agro-midnight rounded-[2.5rem] border border-white/10 flex items-center justify-center p-6 shadow-inner relative z-10 overflow-hidden">
            <img src={`${BASE_URL}${tienda.logo}`} className="w-full h-full object-contain brightness-110 group-hover:scale-110 transition duration-700" alt={tienda.nombre} />
          </div>
          <div className="flex-1 text-center md:text-left relative z-10">
            <span className="bg-agro-teal/10 text-agro-teal text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest mb-6 inline-block border border-agro-teal/10">Socio Proveedor Élite</span>
            <h1 className="text-6xl font-black text-white italic tracking-tighter leading-none mb-6">
              {tienda.nombre.toUpperCase()}
            </h1>
            <p className="text-agro-cream/40 text-xl font-medium leading-relaxed max-w-2xl italic">
              "{tienda.descripcion || "Experto certificado en la distribución de insumos técnicos para el sector agropecuario uruguayo."}"
            </p>
          </div>
        </section>

        {/* FILTROS Y BÚSQUEDA */}
        <div className="mb-12 space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5 shadow-inner">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-agro-cream/40" size={20} />
              <input
                type="text"
                placeholder="Buscar insumos o maquinaria..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-agro-midnight border border-white/5 py-4 pl-14 pr-6 rounded-2xl text-white outline-none focus:border-agro-teal/50 transition-colors shadow-inner font-medium"
              />
            </div>

            <div className="w-full md:w-2/3 flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {CATEGORIAS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`px-6 py-3 rounded-xl border font-black uppercase tracking-widest text-[9px] transition-all whitespace-nowrap ${categoria === cat
                    ? "bg-agro-teal text-white border-agro-teal shadow-teal-glow"
                    : "bg-transparent text-agro-cream/40 border-white/10 hover:border-agro-teal/30 hover:text-agro-cream"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div>
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">Resultados de Catálogo</h2>
            <div className="h-[1px] bg-white/5 flex-1"></div>
          </div>

          {productos.length === 0 ? (
            <div className="text-center py-40 card-midnight bg-white/5 border-dashed border-white/10 italic text-white/20 text-3xl font-black uppercase tracking-tighter">
              No se encontraron artículos
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {productos.map((prod) => (
                <div
                  key={prod._id}
                  className="card-midnight group bg-agro-midnight border-white/5 flex flex-col h-full hover:-translate-y-2 transition-all duration-500 shadow-2xl overflow-hidden relative"
                >
                  <div className="absolute top-4 left-4 z-10 bg-agro-midnight/80 backdrop-blur-sm border border-white/10 text-[9px] font-black uppercase tracking-widest text-agro-teal px-3 py-1 rounded-full shadow-inner">
                    {prod.categoria}
                  </div>

                  <div className="h-56 overflow-hidden relative bg-white/5">
                    <img
                      src={`${BASE_URL}${prod.fotoPrincipal}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-[2s]"
                      alt={prod.nombre}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-agro-midnight/60 to-transparent"></div>
                  </div>

                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-xl font-black text-white mb-2 group-hover:text-agro-teal transition-colors duration-500 leading-tight uppercase line-clamp-2">
                      {prod.titulo || prod.nombre}
                    </h3>

                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <p className="text-2xl font-black text-white text-glow-teal italic tracking-tighter">
                        ${prod.precio?.toLocaleString()}
                      </p>
                      <button
                        onClick={() => agregarAlCarrito(prod, 1)}
                        className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-agro-teal hover:bg-agro-teal hover:text-white transition shadow-inner"
                      >
                        🛒
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
