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
      const { data } = await api.get(`/proveedores/perfil/${slug}`);

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
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-8 mt-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-agro-teal text-lg">location_on</span>
                <span className="text-[#E8E0C8] text-[10px] font-black uppercase tracking-[0.2em] italic">
                  {tienda.zona || "Ubicación Reservada"}
                </span>
              </div>
              <div className="w-[1px] h-4 bg-white/10 hidden md:block"></div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-agro-teal shadow-[0_0_10px_rgba(0,229,255,0.5)] animate-pulse"></div>
                <span className="text-agro-teal text-[10px] font-black uppercase tracking-[0.3em] italic">
                  {tienda.rubro || "Socio Élite"}
                </span>
              </div>
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
              className="bg-[#3F6F76] text-white py-5 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-center hover:bg-[#00E5FF] hover:text-[#001719] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">chat</span> Consultar Stock
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

                  <div className="p-10 flex flex-col flex-1 bg-gradient-to-b from-agro-charcoal/20 to-agro-midnight/40 translate-y-0 group-hover:-translate-y-2 transition-transform duration-700">
                    <div className="mb-6">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-agro-teal font-black text-2xl italic tracking-tighter shadow-teal-glow-sm">
                          USD {p.precio?.toLocaleString()}
                        </span>
                        <span className="text-[7px] font-black text-agro-teal/40 uppercase tracking-[0.2em] bg-agro-teal/5 px-2 py-1 rounded border border-agro-teal/10">Disponibilidad Inmediata</span>
                      </div>
                      <h3 className="text-xl font-black text-white italic tracking-tighter uppercase group-hover:text-agro-teal transition-colors line-clamp-2 leading-none">
                        {p.titulo}
                      </h3>
                    </div>

                    <div className="mt-auto flex justify-between items-center pt-6 border-t border-white/5">
                      <span className="text-[8px] font-black uppercase text-agro-cream/20 tracking-[0.3em] italic bg-white/5 px-3 py-1 rounded-full">
                        📂 {p.categoria}
                      </span>
                      <span className="text-[8px] font-black text-agro-teal/40 uppercase tracking-widest">VER FICHA ➔</span>
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

        {/* --- SECCIÓN DE SERVICIOS (MULTIRRUBRO) --- */}
        {tienda.servicios && tienda.servicios.length > 0 && (
          <section className="mt-32">
            <div className="flex items-center gap-8 mb-16">
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase shrink-0">
                Soluciones <span className="text-agro-teal">Profesionales</span>
              </h2>
              <div className="h-[1px] bg-white/5 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {tienda.servicios.map((s) => (
                <div key={s._id} className="bg-agro-charcoal/20 border border-white/5 p-8 rounded-[3rem] group hover:border-agro-teal/30 transition-all flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-40 h-40 rounded-2xl overflow-hidden shrink-0">
                    <img
                      src={s.fotos && s.fotos[0] ? `${BASE_URL}${s.fotos[0]}` : "/placeholder.png"}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-agro-teal font-black text-[9px] uppercase tracking-widest mb-2 block">{s.tipoServicio}</span>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4">{s.nombre}</h3>
                    <p className="text-agro-cream/40 text-xs italic line-clamp-2 mb-6 uppercase tracking-tight">{s.descripcion}</p>
                    <Link to={`/servicio/${s._id}`} className="text-[10px] font-black text-white border-b border-agro-teal/30 pb-1 hover:text-agro-teal transition-all uppercase tracking-widest">Ver Solución ➔</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}