import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig"; // Usamos la config centralizada
import { BASE_URL } from "../api/axiosConfig"; 

export default function Tiendas() {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTiendas = async () => {
      try {
        // Filtramos directamente por el tipo "tienda" para no mezclar con servicios
        const { data } = await api.get("/proveedores?tipo=tienda");
        setTiendas(data);
      } catch (err) {
        console.error("Error al cargar el registro de tiendas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTiendas();
  }, []);

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      {/* 🌌 EFECTO DE LUZ AMBIENTAL */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-agro-teal/5 blur-[180px] pointer-events-none opacity-50"></div>

      <section className="container mx-auto mb-20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-10">
          <div>
            <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.6em] mb-4 block italic">Directorio de Negocios</span>
            <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-none mb-4 uppercase">
              TIENDAS <br /><span className="text-agro-teal not-italic font-black">Y VETERINARIAS</span>
            </h1>
            <p className="text-agro-cream/30 font-medium max-w-lg leading-relaxed text-lg italic border-l-2 border-agro-teal/20 pl-6">
              "Encuentre los puntos de venta autorizados, agroveterinarias e importadores de insumos líderes en la región."
            </p>
          </div>
          
          <div className="hidden md:block py-6 px-10 border border-white/5 rounded-3xl bg-agro-charcoal/50 backdrop-blur-xl shadow-2xl">
            <span className="text-white font-black text-4xl italic tracking-tighter leading-none">
              {tiendas.length} 
              <span className="text-agro-teal not-italic text-[10px] uppercase tracking-[0.3em] ml-6 font-black">Puntos de Venta</span>
            </span>
          </div>
        </div>
      </section>

      <div className="container mx-auto relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-agro-teal shadow-teal-glow"></div>
            <span className="text-agro-teal font-black text-[10px] uppercase tracking-widest animate-pulse italic">Escaneando red de comercios...</span>
          </div>
        ) : tiendas.length === 0 ? (
          <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
            <p className="text-agro-cream/20 text-4xl font-black italic uppercase tracking-tighter">No hay tiendas registradas en esta zona</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {tiendas.map((t) => (
              <div key={t._id} className="group bg-agro-charcoal/40 border border-white/5 flex flex-col h-full rounded-[3rem] hover:border-agro-teal/30 transition-all duration-700 overflow-hidden shadow-2xl hover:-translate-y-2">
                
                {/* LOGO / IMAGEN DEL COMERCIO */}
                <div className="relative h-72 overflow-hidden bg-agro-midnight">
                  <img
                    src={t.logo ? `${BASE_URL}${t.logo}` : "/placeholder-tienda.jpg"}
                    className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition duration-[1.5s] ease-in-out"
                    alt={t.nombre}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-agro-midnight via-transparent to-transparent opacity-90"></div>
                  
                  {/* ZONA TAG */}
                  <div className="absolute top-6 right-8">
                    <span className="bg-agro-midnight/80 backdrop-blur-md border border-white/10 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest italic">
                      📍 {t.zona}
                    </span>
                  </div>
                </div>

                {/* CONTENIDO DE LA TARJETA */}
                <div className="p-12 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-agro-teal font-black tracking-[0.4em] text-[8px] uppercase mb-2 block italic">{t.rubro || "Agro-Insumos"}</span>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{t.nombre}</h3>
                    </div>
                    {t.destacado && (
                      <div className="w-10 h-10 bg-agro-teal text-agro-midnight rounded-xl flex items-center justify-center text-sm shadow-teal-glow animate-pulse">
                        ★
                      </div>
                    )}
                  </div>

                  <p className="text-agro-cream/40 text-sm font-medium leading-relaxed mb-10 line-clamp-3 italic opacity-60 group-hover:opacity-100 transition-opacity">
                    {t.descripcion || `Consulte el stock disponible y las ofertas exclusivas de ${t.nombre} para productores de la zona.`}
                  </p>

                  <Link
                    to={`/tienda/${t.slug}`}
                    className="mt-auto w-full py-5 text-center bg-white/5 text-white font-black rounded-2xl border border-white/10 hover:bg-agro-teal hover:text-agro-midnight hover:border-agro-teal transition-all duration-500 uppercase tracking-[0.4em] text-[9px] flex items-center justify-center gap-4 group"
                  >
                    Ingresar a la Tienda <span className="text-lg transition-transform group-hover:translate-x-3">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}