import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api, { BASE_URL } from "../api/axiosConfig";
import { CartContext } from "../context/CartContext";
import { toast } from "react-hot-toast";
import { CheckCircle, Star } from "lucide-react";

export default function ProductoDetalle() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const { agregarAlCarrito } = useContext(CartContext);

  const handleAgregar = () => {
    if (!producto) return;
    agregarAlCarrito({
      ...producto,
      tienda: producto.proveedor || { nombre: "Vendedor Independiente", whatsapp: "" }
    });
    toast.success("AGREGADO AL CARRITO DE COTIZACIÓN");
  };

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const { data } = await api.get(`/productos/${id}`);
        setProducto(data);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Error al cargar producto", error);
        toast.error("Fallo al sincronizar el activo");
      } finally {
        setLoading(false);
      }
    };
    cargarProducto();
  }, [id]);

  if (loading) return (
    <div className="bg-agro-midnight min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-agro-teal shadow-teal-glow"></div>
    </div>
  );

  if (!producto) return (
    <div className="bg-agro-midnight min-h-screen pt-40 text-center text-white font-black italic uppercase">
      PRODUCTO NO ENCONTRADO EN EL MERCADO
    </div>
  );

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Luces de fondo */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-agro-teal/5 blur-[200px] pointer-events-none opacity-40"></div>

      <div className="container mx-auto relative z-10">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.4em] text-agro-cream/20 mb-12">
          <Link to="/" className="hover:text-agro-teal transition">Portal</Link>
          <span>/</span>
          <Link to="/explorar" className="hover:text-agro-teal transition">Tienda</Link>
          <span>/</span>
          <span className="text-agro-teal">{producto.titulo}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* COLUMNA MULTIMEDIA */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-agro-charcoal border border-white/5 p-6 rounded-[3.5rem] shadow-2xl relative group">
              <div className="relative h-[35rem] overflow-hidden rounded-[2.5rem] shadow-inner bg-agro-midnight">
                <img
                  src={`${BASE_URL}${producto.fotoPrincipal || producto.fotos?.[0] || "/placeholder.png"}`}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-[2s]"
                  alt={producto.titulo}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-agro-midnight/60 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Galería si hay más fotos */}
            {producto.fotos?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {producto.fotos.map((f, i) => (
                  <div key={i} className="w-24 h-24 bg-agro-midnight border border-white/5 rounded-2xl overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all cursor-pointer shadow-xl">
                    <img src={`${BASE_URL}${f}`} className="w-full h-full object-cover" alt={`Vista ${i}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* COLUMNA INFORMACIÓN */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <section className="bg-agro-charcoal border border-white/5 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 text-4xl opacity-5 pointer-events-none italic font-black">STOCK</div>

              <div className="flex items-center gap-4 mb-6">
                <span className="bg-agro-teal/10 text-agro-teal text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] border border-agro-teal/10 shadow-inner">
                  {producto.categoria}
                </span>
                <span className="text-white/20 text-[9px] font-black uppercase tracking-widest">REG: {producto._id.slice(-6).toUpperCase()}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter leading-[0.9] mb-8 uppercase">
                {producto.titulo}
              </h1>

              {/* VALUACIÓN */}
              <div className="bg-agro-midnight p-8 rounded-[2rem] border border-white/5 mb-8 shadow-inner">
                <p className="text-[9px] text-agro-cream/20 font-black uppercase mb-2 tracking-widest">Inversión Requerida</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white italic tracking-tighter shadow-teal-glow-sm">
                    USD {producto.precio?.toLocaleString()}
                  </span>
                  <span className="text-agro-teal font-black text-xs uppercase tracking-widest">Final</span>
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div className="mb-10 space-y-4">
                <h3 className="text-[10px] font-black text-agro-teal uppercase tracking-[0.4em] mb-4">Especificaciones Técnicas</h3>
                <p className="text-agro-cream/40 text-sm italic leading-relaxed border-l-2 border-agro-teal/20 pl-6 h-32 overflow-y-auto no-scrollbar">
                  "{producto.descripcion || "Descripción técnica pendiente de indexación oficial para este activo corporativo."}"
                </p>
              </div>

              {/* FICHA TÉCNICA RÁPIDA */}
              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="bg-agro-midnight/40 p-5 rounded-2xl border border-white/5">
                  <p className="text-[7px] font-black text-agro-cream/20 uppercase tracking-widest mb-1">Categorización</p>
                  <p className="text-white font-black text-[10px] uppercase truncate">{producto.categoria}</p>
                </div>
                <div className="bg-agro-midnight/40 p-5 rounded-2xl border border-white/5">
                  <p className="text-[7px] font-black text-agro-cream/20 uppercase tracking-widest mb-1">Disponibilidad</p>
                  <p className="text-agro-teal font-black text-[10px] uppercase italic">EN STOCK</p>
                </div>
              </div>

              {/* BOTÓN DE ACCIÓN ÉLITE */}
              <button
                onClick={handleAgregar}
                className="btn-emerald w-full py-6 text-[11px] uppercase tracking-[0.3em] font-black flex items-center justify-center gap-4 group shadow-teal-glow-lg"
              >
                Añadir al Carrito de Cotización <span className="transition-transform group-hover:translate-x-2 text-xl">➔</span>
              </button>
            </section>

            {/* CARD VENDEDOR */}
            <div className="bg-agro-charcoal/40 p-8 rounded-[2.5rem] flex items-center justify-between border border-white/5 group hover:border-agro-teal/20 transition-all duration-500">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[8px] text-agro-cream/20 font-black uppercase tracking-widest">Socio Proveedor</p>
                  {(producto.proveedor?.esVerificado || producto.tienda?.esVerificado) && (
                    <span className="bg-agro-teal/20 text-agro-teal px-2 py-0.5 rounded-full text-[7px] font-black uppercase flex items-center gap-1 border border-agro-teal/30">
                      <CheckCircle className="w-2.5 h-2.5" /> Verificado
                    </span>
                  )}
                </div>

                <p className="text-xl font-black text-white italic uppercase tracking-tighter group-hover:text-agro-teal transition-colors">
                  {producto.tienda?.nombre || producto.proveedor?.nombre || "Vendedor Certificado"}
                </p>

                <div className="flex items-center gap-4 mt-2">
                  {/* Estrellas */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= (producto.proveedor?.rating?.promedio || 5) ? 'text-agro-teal fill-agro-teal' : 'text-white/10'}`}
                      />
                    ))}
                    <span className="text-[9px] font-black text-white/40 ml-1">
                      ({producto.proveedor?.rating?.totalOpiniones || 0})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-agro-teal rounded-full animate-pulse shadow-teal-glow"></span>
                    <span className="text-[8px] font-black text-agro-cream/30 uppercase tracking-widest italic">Terminal Activa</span>
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 bg-agro-midnight rounded-2xl flex items-center justify-center text-3xl border border-agro-teal/10 shadow-inner group-hover:scale-110 transition-transform duration-500 shrink-0 ml-4">🏪</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}