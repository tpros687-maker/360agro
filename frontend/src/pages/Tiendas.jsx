import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { BASE_URL } from "../api/axiosConfig";
import {
  Store,
  MapPin,
  Star,
  ArrowRight,
  Search,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function Tiendas() {
  const [tiendas, setTiendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const deptoQueCarga = searchParams.get("depto");

  useEffect(() => {
    const fetchTiendas = async () => {
      try {
        const { data } = await api.get("/proveedores?tipo=tienda");

        let filtrados = data;
        if (deptoQueCarga) {
          filtrados = data.filter(t => t.departamento?.toLowerCase() === deptoQueCarga.toLowerCase());
        }

        setTiendas(filtrados);
      } catch (err) {
        console.error("Error al cargar el registro de tiendas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTiendas();
  }, [deptoQueCarga]);

  return (
    <div className="bg-background min-h-screen pt-32 pb-32 px-6 relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-primary/5 blur-[250px] rounded-full pointer-events-none opacity-40"></div>

      <section className="container mx-auto mb-24 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-end gap-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-1 machined-gradient shadow-[0_0_15px_rgba(63,111,118,0.4)]"></div>
              <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em] italic"></span>
            </div>
            <h1 className="text-6xl md:text-[9.5rem] font-black text-on-surface italic tracking-tighter leading-[0.85] mb-8 uppercase glow-text">
              TIENDAS <br /><span className="text-primary not-italic"></span>
            </h1>
            <p className="text-on-surface-variant font-medium max-w-2xl leading-relaxed text-lg italic border-l-4 border-primary/20 pl-10 uppercase tracking-[0.1em] opacity-60">

            </p>
          </div>

          <div className="hidden lg:flex flex-col items-end py-10 px-16 border border-outline-variant/15 rounded-[3rem] bg-surface-container-high shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-2 italic relative z-10">Negocios activos</span>
            <span className="text-on-surface font-black text-7xl italic tracking-tighter leading-none glow-text relative z-10">
              {tiendas.length}
            </span>
          </div>
        </div>

        {deptoQueCarga && (
          <div className="mt-12 inline-flex items-center gap-4 px-6 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest italic shadow-xl animate-in fade-in slide-in-from-left-4">
            <span className="material-symbols-outlined text-sm">location_on</span>
            Jurisdicción: {deptoQueCarga}
            <button onClick={() => window.history.replaceState({}, '', '/tiendas')} className="ml-4 text-on-surface hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          </div>
        )}
      </section>

      <div className="container mx-auto relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => <div key={i} className="h-[550px] bg-surface-container-high/40 rounded-[2.5rem] animate-pulse border border-outline-variant/5 shadow-2xl"></div>)}
          </div>
        ) : tiendas.length === 0 ? (
          <div className="text-center py-48 bg-surface-container-low rounded-[3rem] border border-outline-variant/10">
            <span className="material-symbols-outlined text-6xl text-outline/20 mb-8 block">hub</span>
            <p className="text-on-surface-variant text-xl font-bold italic uppercase tracking-widest opacity-40">Terminales Inactivos en Zona</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {tiendas.map((t) => (
              <div key={t._id} className="group relative flex flex-col h-full bg-surface-container-high rounded-[2.5rem] border border-outline-variant/10 overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-xl hover:shadow-primary/5">

                {/* LOGO / IMAGEN DEL COMERCIO */}
                <div className="relative h-[400px] overflow-hidden bg-surface-container-lowest">
                  <img
                    src={t.logo ? `${BASE_URL}${t.logo}` : "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop"}
                    className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2s] group-hover:opacity-100"
                    alt={t.nombre}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high/90 via-transparent to-transparent"></div>

                  {/* ZONA TAG */}
                  <div className="absolute top-8 right-8">
                    <div className="bg-surface-container-lowest/80 backdrop-blur-md border border-outline-variant/10 text-on-surface px-6 py-2.5 rounded-2xl text-[9px] font-bold uppercase tracking-widest italic shadow-2xl flex items-center gap-4 group-hover:border-primary/40 transition-all">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">location_on</span> {t.departamento || t.zona}
                      </div>
                      <div className="w-[1px] h-3 bg-white/10"></div>
                      <span className="text-[#E8E0C8] font-black">{t.rubro || "Hub Logístico"}</span>
                    </div>
                  </div>
                </div>

                {/* CONTENIDO DE LA TARJETA */}
                <div className="p-10 flex flex-col flex-1 -mt-24 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-3xl font-black text-on-surface italic tracking-tighter uppercase leading-[0.9] line-clamp-2 min-h-[4rem] group-hover:text-primary transition-colors">{t.nombre}</h3>
                    </div>
                    {t.destacado && (
                      <div className="w-12 h-12 machined-gradient text-on-tertiary-fixed rounded-2xl flex items-center justify-center shadow-lg animate-pulse shrink-0 border border-primary/20">
                        <span className="material-symbols-outlined text-lg fill-1">verified</span>
                      </div>
                    )}
                  </div>

                  <p className="text-on-surface-variant text-[10px] font-medium leading-relaxed mb-10 line-clamp-3 italic border-l-2 border-primary/30 pl-5 group-hover:text-on-surface transition-colors uppercase tracking-wider opacity-60">
                    {t.descripcion || `ABASTECIMIENTO TÉCNICO Y LOGÍSTICO INTEGRAL GARANTIZADO POR ${t.nombre.toUpperCase()} BAJO ESTÁNDARES 360AGRO.`}
                  </p>

                  <Link
                    to={`/tienda/${t.slug}`}
                    className="mt-auto w-full py-5 text-center machined-gradient text-on-tertiary-fixed font-black rounded-full border border-primary/20 hover:scale-[1.03] transition-all duration-300 uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 group/btn shadow-xl hover:shadow-primary/30"
                  >
                    EXPLORAR TIENDA <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
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
