import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axiosConfig"; 
import { BASE_URL } from "../api/axiosConfig";
import { toast } from "react-hot-toast";
import { CartContext } from "../context/CartContext";

export default function TiendaPublica() {
  const { slug } = useParams();
  const [tienda, setTienda] = useState(null);
  const [loading, setLoading] = useState(true);
  const { agregarAlCarrito } = useContext(CartContext); 

  const cargarDatos = async () => {
    try {
      setLoading(true);
      // ✅ Cambiamos la ruta para asegurar que el backend reciba el parámetro correcto
      const { data } = await api.get(`/proveedores/slug/${slug}`);
      
      // ✅ Si el backend devuelve el objeto dentro de una propiedad (ej: data.tienda)
      // Ajustamos aquí para que 'tienda' nunca sea null si hay datos
      setTienda(data.tienda || data); 
      
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("❌ Error cargando tienda:", error);
      toast.error("Comercio fuera de línea o no indexado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [slug]);

  const handleAgregarRapido = (e, producto) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!tienda) return;

    agregarAlCarrito({
        ...producto,
        tienda: {
            nombre: tienda.nombre,
            whatsapp: tienda.whatsapp
        }
    });
  };

  if (loading) return (
    <div className="bg-agro-midnight min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-agro-teal shadow-teal-glow"></div>
    </div>
  );

  // ✅ UI Mejorada para el error de indexación
  if (!tienda || !tienda.nombre) return (
    <div className="bg-agro-midnight min-h-screen flex flex-col items-center justify-center text-white px-6 text-center">
        <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center text-4xl mb-8 animate-pulse">🏪</div>
        <p className="text-2xl font-black italic uppercase tracking-tighter text-white mb-2">Comercio no detectado</p>
        <p className="text-agro-cream/30 text-[10px] font-black uppercase tracking-[0.3em] mb-10">La terminal solicitada no responde o el identificador es inválido.</p>
        <Link to="/tiendas" className="bg-white/5 px-8 py-4 rounded-xl text-agro-teal font-black uppercase tracking-widest border border-white/5 hover:bg-agro-teal hover:text-agro-midnight transition-all">Regresar al directorio ➔</Link>
    </div>
  );

  // Determinamos dónde están los productos (flexibilidad de backend)
  const listaProductos = tienda.misProductos || tienda.productos || [];

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-agro-teal/5 blur-[150px] -mr-40 -mt-40"></div>

      <div className="container mx-auto max-w-7xl relative z-10 animate-reveal">
        
        {/* --- CABECERA DE NEGOCIO --- */}
        <header className="flex flex-col md:flex-row gap-12 items-center mb-24 bg-agro-charcoal/30 p-10 md:p-16 rounded-[4rem] border border-white/5 shadow-2xl backdrop-blur-md">
          <div className="relative group shrink-0">
            <div className="absolute inset-0 bg-agro-teal/20 rounded-full blur-2xl transition-all"></div>
            <img
              src={tienda.logo ? `${BASE_URL}${tienda.logo}` : "/placeholder.png"}
              className="relative w-48 h-48 object-cover rounded-full border-4 border-agro-midnight shadow-2xl z-10 grayscale hover:grayscale-0 transition-all duration-700"
              alt={tienda.nombre}
            />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
              <span className="bg-agro-teal text-agro-midnight px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-teal-glow italic">
                {tienda.rubro || "Socio Elite"}
              </span>
              <span className="text-agro-cream/40 text-[9px] font-black uppercase tracking-[0.3em] italic">
                📍 {tienda.zona || "Ubicación Reservada"}
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">
              {tienda.nombre}
            </h1>
            <p className="text-agro-cream/40 max-w-2xl text-lg italic leading-relaxed border-l-2 border-agro-teal/20 pl-6 uppercase text-[11px] tracking-widest font-bold">
              {tienda.descripcion || "Sin descripción operativa disponible."}
            </p>
          </div>

          <div className="flex flex-col gap-4 min-w-[240px]">
            <a 
              href={`https://wa.me/${tienda.whatsapp?.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noreferrer"
              className="bg-agro-teal text-agro-midnight py-5 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-center hover:shadow-teal-glow transition-all active:scale-95"
            >
              📱 Consultar Stock ➔
            </a>
          </div>
        </header>

        {/* --- GRILLA DE INVENTARIO --- */}
        <section>
          <div className="flex items-center gap-8 mb-16">
            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase shrink-0">
                Inventario <span className="text-agro-teal">Corporativo</span>
            </h2>
            <div className="h-[1px] bg-white/5 flex-1"></div>
            <p className="text-[9px] font-black text-agro-cream/20 uppercase tracking-[0.4em] italic">
                {listaProductos.length} Artículos Indexados
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {listaProductos.length > 0 ? listaProductos.map((p) => (
              <div
                key={p._id}
                className="group bg-agro-charcoal/40 border border-white/5 rounded-[3rem] overflow-hidden hover:border-agro-teal/30 transition-all duration-700 flex flex-col relative shadow-xl hover:-translate-y-2"
              >
                <Link to={`/producto/${p._id}`} className="block h-full flex flex-col">
                  <div className="relative h-60 overflow-hidden bg-agro-midnight">
                    <img
                      src={p.fotoPrincipal ? `${BASE_URL}${p.fotoPrincipal}` : (p.fotos?.[0] ? `${BASE_URL}${p.fotos[0]}` : "/placeholder.png")}
                      className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-110 transition duration-[2s]"
                      alt={p.titulo}
                    />
                    
                    <button 
                      onClick={(e) => handleAgregarRapido(e, p)}
                      className="absolute bottom-6 right-6 bg-agro-teal text-agro-midnight w-14 h-14 rounded-2xl flex items-center justify-center shadow-teal-glow opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:scale-110 active:scale-90 z-20"
                    >
                      <span className="text-xl">🛒</span>
                    </button>
                  </div>

                  <div className="p-10 flex flex-col flex-1">
                    <div className="mb-4">
                        <span className="text-agro-teal font-black text-lg mb-1 block italic tracking-tighter">
                          USD {p.precio?.toLocaleString()}
                        </span>
                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase group-hover:text-agro-teal transition-colors line-clamp-2 leading-none">
                          {p.titulo}
                        </h3>
                    </div>
                    
                    <div className="mt-auto flex justify-between items-center pt-6 border-t border-white/5">
                      <span className="text-[8px] font-black uppercase text-agro-cream/20 tracking-[0.2em] italic">
                        {p.categoria}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            )) : (
                <div className="col-span-full py-32 text-center border-2 border-dashed border-white/5 rounded-[3.5rem] bg-agro-charcoal/10">
                    <p className="text-agro-cream/20 text-xl font-black uppercase tracking-[0.5em] italic">Sin artículos indexados</p>
                </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}