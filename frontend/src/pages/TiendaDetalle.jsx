import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import tiendaApi from "../api/tiendaApi";
import productoApi from "../api/productoApi";
import { Search } from "lucide-react";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";

import { BASE_URL } from "../api/axiosConfig";

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
      <div className="bg-background min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-primary shadow-[0_0_20px_rgba(63,111,118,0.4)]"></div>
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
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] pointer-events-none"></div>

      <div className="container mx-auto relative z-10 max-w-7xl">

        {/* SHOP HEADER NOIR */}
        <section className="bg-surface-container-high border border-outline-variant/10 p-10 rounded-[3rem] shadow-2xl mb-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-10 group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="w-44 h-44 bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/10 flex items-center justify-center p-6 shadow-inner relative z-10 overflow-hidden">
            <img src={`${BASE_URL}${tienda.logo}`} className="w-full h-full object-contain brightness-110 group-hover:scale-110 transition duration-700" alt={tienda.nombre} />
          </div>

          <div className="flex-1 text-center md:text-left relative z-10">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
              <span className="text-primary text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/20 italic bg-primary/5">Socio Proveedor Élite</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-on-surface italic tracking-tighter leading-none mb-6 glow-text uppercase">
              {tienda.nombre}
            </h1>
            <p className="text-on-surface-variant text-lg font-medium leading-relaxed max-w-2xl italic opacity-60">
              "{tienda.descripcion || "Experto certificado en la distribución de insumos técnicos para el sector agropecuario uruguayo."}"
            </p>
          </div>
        </section>

        {/* FILTROS Y BÚSQUEDA */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-surface-container-low p-4 rounded-3xl border border-outline-variant/10 shadow-xl">
            <div className="relative w-full md:w-1/3">
              <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40">search</span>
              <input
                type="text"
                placeholder="Buscar insumos o maquinaria..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/20 py-4 pl-14 pr-6 rounded-2xl text-on-surface outline-none focus:border-primary/50 transition-all shadow-inner font-medium placeholder:text-on-surface-variant/20"
              />
            </div>

            <div className="w-full md:w-2/3 flex gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {CATEGORIAS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`px-6 py-3 rounded-full border font-bold uppercase tracking-widest text-[9px] transition-all whitespace-nowrap italic ${categoria === cat
                    ? "machined-gradient text-on-tertiary-fixed border-none shadow-[0_0_15px_rgba(63,111,118,0.3)] scale-105"
                    : "bg-transparent text-on-surface-variant border-outline-variant/10 hover:border-primary/30 hover:text-on-surface"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="reveal">
          <div className="flex items-center gap-6 mb-10">
            <h2 className="text-2xl font-black text-on-surface italic tracking-tighter uppercase whitespace-nowrap glow-text">Catálogo de Activos</h2>
            <div className="h-[1px] machined-gradient opacity-20 flex-1"></div>
          </div>

          {productos.length === 0 ? (
            <div className="text-center py-40 bg-surface-container-low rounded-[3rem] border-2 border-dashed border-outline-variant/10 flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl text-outline/20 mb-6">inventory_2</span>
              <p className="text-on-surface-variant text-xl font-bold uppercase tracking-widest italic opacity-40">No se encontraron artículos en esta sección</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {productos.map((prod) => (
                <div
                  key={prod._id}
                  className="group relative flex flex-col h-full bg-surface-container-high rounded-[2rem] border border-outline-variant/10 overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-xl hover:shadow-primary/5"
                >
                  <div className="absolute top-4 left-4 z-20 bg-primary/20 backdrop-blur-md border border-primary/30 text-[9px] font-bold uppercase tracking-widest text-primary px-3 py-1.5 rounded-full shadow-lg italic">
                    {prod.categoria}
                  </div>

                  <div className="h-56 overflow-hidden relative bg-surface-container-lowest">
                    <img
                      src={`${BASE_URL}${prod.fotoPrincipal}`}
                      className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[2s] group-hover:scale-105"
                      alt={prod.nombre}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high/90 via-transparent to-transparent"></div>
                  </div>

                  <div className="p-8 flex flex-col flex-1 relative z-10">
                    <h3 className="text-lg font-bold text-on-surface mb-4 group-hover:text-primary transition-colors leading-tight uppercase line-clamp-2 italic">
                      {prod.titulo || prod.nombre}
                    </h3>

                    <div className="mt-auto pt-6 border-t border-outline-variant/10 flex items-center justify-between">
                      <p className="text-2xl font-black text-on-surface italic tracking-tighter glow-text">
                        <span className="text-sm not-italic text-primary mr-1 font-bold">USD</span>{prod.precio?.toLocaleString()}
                      </p>
                      <button
                        onClick={() => agregarAlCarrito(prod, 1)}
                        className="w-12 h-12 machined-gradient rounded-2xl flex items-center justify-center text-on-tertiary-fixed hover:scale-110 transition shadow-xl"
                      >
                        <span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
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
