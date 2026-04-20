import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { BASE_URL, imgUrl } from "../api/axiosConfig";
import { toast } from "react-hot-toast";
import { CartContext } from "../context/CartContext";
import SEO from "../components/SEO";

export default function TiendaPublica() {
  const { slug } = useParams();
  const [tienda, setTienda] = useState(null);
  const [loading, setLoading] = useState(true);
  const { agregarAlCarrito } = useContext(CartContext);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/proveedores/perfil/${slug}`);
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
    <div className="bg-background min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary shadow-xl"></div>
    </div>
  );

  if (!tienda || !tienda.nombre) return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center text-on-surface px-6 text-center">
      <div className="w-24 h-24 bg-primary/10 border border-primary/30 rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 animate-pulse text-primary shrink-0">
        <span className="material-symbols-outlined text-5xl">storefront</span>
      </div>
      <p className="text-2xl font-black italic uppercase tracking-tighter mb-2">Comercio no detectado</p>
      <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.3em] mb-10">La terminal solicitada no responde o el identificador es inválido.</p>
      <Link to="/tiendas" className="machined-gradient px-8 py-5 rounded-full text-on-tertiary-fixed font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 italic">
        Regresar al directorio <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </Link>
    </div>
  );

  const listaProductos = tienda.misProductos || tienda.productos || [];

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <SEO
        title={tienda ? `${tienda.nombre} — 360 Agro` : "Tienda — 360 Agro"}
        description={tienda?.descripcion?.slice(0, 160) || "Tienda agropecuaria en 360 Agro."}
        image={tienda?.foto}
        url={`https://360agro.vercel.app/tienda/${tienda?.slug}`}
      />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -mr-40 -mt-40"></div>

      <div className="container mx-auto max-w-7xl relative z-10 animate-reveal">

        {/* --- CABECERA DE NEGOCIO EN RECUADRO --- */}
        <header className="bg-surface-container-lowest border border-outline-variant/70 rounded-2xl p-10 mb-20 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          
          <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl transition-all"></div>
              <img
                src={imgUrl(tienda.logo, "/placeholder.png")}
                className="relative w-48 h-48 object-cover rounded-full border-4 border-background shadow-2xl z-10 grayscale group-hover:grayscale-0 transition-all duration-700"
                alt={tienda.nombre}
                loading="eager"
              />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-8 mt-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                  <span className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] italic">
                    {tienda.zona || "Ubicación Reservada"}
                  </span>
                </div>
                <div className="w-[1px] h-4 bg-outline-variant/20 hidden md:block"></div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em] italic">
                    {tienda.rubro || "Socio Élite"}
                  </span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-on-surface italic tracking-tighter uppercase mb-6 leading-none">
                {tienda.nombre}
              </h1>
              <p className="text-on-surface-variant max-w-2xl text-lg italic leading-relaxed border-l-2 border-primary/20 pl-6 uppercase text-[11px] tracking-widest font-bold opacity-70">
                {tienda.descripcion || "Abastecimiento técnico y operativo bajo estándares 360AGRO."}
              </p>
            </div>

            <div className="flex flex-col gap-4 min-w-[240px]">
              <a
                href={`https://wa.me/${tienda.whatsapp?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="machined-gradient text-on-tertiary-fixed py-5 px-8 rounded-full font-black text-[10px] uppercase tracking-[0.3em] text-center hover:scale-[1.02] transition-all shadow-xl flex items-center justify-center gap-2 italic"
              >
                <span className="material-symbols-outlined text-sm">chat</span> Consultar Stock
              </a>
            </div>
          </div>
        </header>

        {/* --- GRILLA DE INVENTARIO --- */}
        <section>
          <div className="flex items-center gap-8 mb-16 px-4">
            <h2 className="text-3xl font-black text-on-surface italic tracking-tighter uppercase shrink-0">
              Inventario <span className="text-primary">Corporativo</span>
            </h2>
            <div className="h-[1px] bg-outline-variant/20 flex-1"></div>
            <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] italic">
              {listaProductos.length} Artículos Indexados
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {listaProductos.length > 0 ? listaProductos.map((p) => (
              <div
                key={p._id}
                className="group bg-white border border-outline-variant/60 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-[1.01] transition-all duration-300 flex flex-col"
              >
                {/* IMAGEN */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={imgUrl(p.fotoPrincipal || p.fotos?.[0], "/placeholder.png")}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    alt={p.titulo}
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => handleAgregarRapido(e, p)}
                    className="absolute bottom-3 right-3 w-9 h-9 machined-gradient text-on-tertiary-fixed rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  </button>
                </div>

                {/* INFO */}
                <Link to={`/producto/${p._id}`} className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-black text-on-surface uppercase tracking-tight mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                    {p.titulo}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-2.5">
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Stock</p>
                      <p className={`text-[10px] font-black uppercase ${p.stock > 0 ? 'text-primary' : 'text-error'}`}>
                        {p.stock > 0 ? 'Disponible' : 'Sin stock'}
                      </p>
                    </div>
                    <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-xl p-2.5">
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Unidad</p>
                      <p className="text-[10px] font-black text-on-surface uppercase">{p.unidadMedida || "unidad"}</p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-outline-variant/40">
                    <div>
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest">Precio</p>
                      <p className="text-lg font-black text-primary">USD {p.precio?.toLocaleString()}</p>
                    </div>
                    <div className="w-9 h-9 bg-surface-container border border-outline-variant/60 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                      <span className="material-symbols-outlined text-sm text-primary group-hover:text-white">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              </div>
            )) : (
              <div className="col-span-full py-32 text-center border-2 border-dashed border-outline-variant/20 rounded-[3.5rem] bg-surface-container-low">
                <p className="text-on-surface-variant/20 text-xl font-black uppercase tracking-[0.5em] italic">Sin artículos indexados</p>
              </div>
            )}
          </div>
        </section>

        {/* --- SECCIÓN DE SERVICIOS (MULTIRRUBRO) --- */}
        {tienda.servicios && tienda.servicios.length > 0 && (
          <section className="mt-32">
            <div className="flex items-center gap-8 mb-16 px-4">
              <h2 className="text-3xl font-black text-on-surface italic tracking-tighter uppercase shrink-0">
                Soluciones <span className="text-primary">Profesionales</span>
              </h2>
              <div className="h-[1px] bg-outline-variant/20 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {tienda.servicios.map((s) => (
                <div key={s._id} className="bg-surface-container-lowest border border-outline-variant/70 p-8 rounded-2xl group hover:shadow-xl transition-all flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-40 h-40 rounded-2xl overflow-hidden shrink-0 bg-background">
                    <img
                      src={imgUrl(s.fotos?.[0], "/placeholder.png")}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-primary font-black text-[9px] uppercase tracking-widest mb-2 block">{s.tipoServicio}</span>
                    <h3 className="text-2xl font-black text-on-surface italic tracking-tighter uppercase mb-4">{s.nombre}</h3>
                    <p className="text-on-surface-variant text-xs italic line-clamp-2 mb-6 uppercase tracking-tight opacity-70">{s.descripcion}</p>
                    <Link to={`/servicio/${s._id}`} className="text-[10px] font-black text-on-surface border-b border-primary/30 pb-1 hover:text-primary transition-all uppercase tracking-widest flex items-center gap-2 w-fit">
                      Ver Solución <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
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