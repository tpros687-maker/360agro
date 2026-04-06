import { useEffect, useState } from "react";
import servicioApi from "../api/servicioApi";
import { Link, useSearchParams } from "react-router-dom";
import { BASE_URL } from "../api/axiosConfig";
import {
  Search,
  Wrench,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Star
} from "lucide-react";

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const deptoQueCarga = searchParams.get("depto");

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const { data } = await servicioApi.obtenerServicios();
        setServicios(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar servicios:", err);
        setServicios([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServicios();
  }, []);

  const serviciosFiltrados = servicios.filter(s => {
    const busquedaLower = busqueda.toLowerCase();
    const matchesBusqueda =
      (s.nombre?.toLowerCase().includes(busquedaLower) || false) ||
      (s.tipoServicio?.toLowerCase().includes(busquedaLower) || false) ||
      (s.zona?.toLowerCase().includes(busquedaLower) || false) ||
      (s.descripcion?.toLowerCase().includes(busquedaLower) || false);

    const matchesFiltro = filtro === "todos" || s.tipoServicio === filtro;
    const matchesDepto = !deptoQueCarga || s.departamento?.toLowerCase() === deptoQueCarga.toLowerCase();

    return matchesBusqueda && matchesFiltro && matchesDepto;
  });

  const tipos = ["todos", ...new Set(servicios.map(s => s.tipoServicio).filter(Boolean))];

  return (
    <div className="bg-background min-h-screen pt-32 pb-32 px-6 text-on-surface selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[250px] rounded-full pointer-events-none opacity-40"></div>

      {/* 🌌 SECCIÓN DE ENCABEZADO */}
      <section className="container mx-auto mb-24 relative z-10 max-w-7xl">
        <div className="reveal mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-1 machined-gradient shadow-[0_0_15px_rgba(63,111,118,0.4)]"></div>
            <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em] italic">

            </span>
          </div>
          <h1 className="text-6xl md:text-[9.5rem] font-black text-on-surface italic tracking-tighter leading-[0.85] mb-12 uppercase glow-text">
            <br /><span className="text-primary not-italic">SERVICIOS</span>
          </h1>
        </div>

        {/* 🔍 BUSCADOR DE ALTA PRECISIÓN */}
        <div className="max-w-6xl bg-surface-container-high border border-outline-variant/15 p-5 rounded-[3rem] flex flex-col lg:flex-row gap-5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="relative flex-1 z-10">
            <span className="material-symbols-outlined absolute left-8 top-1/2 -translate-y-1/2 text-primary text-2xl">search</span>
            <input
              type="text"
              placeholder="Especialidad, contratista o zona estratégica..."
              className="w-full bg-surface-container-lowest border border-outline-variant/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 px-20 py-6 rounded-[2rem] outline-none transition-all duration-500 font-bold text-on-surface text-lg placeholder:text-on-surface-variant/20 italic"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="relative lg:w-80 z-10">
            <select
              className="w-full bg-surface-container-lowest border border-outline-variant/10 text-primary font-bold text-[10px] uppercase tracking-[0.3em] px-12 py-6 rounded-[2rem] outline-none transition-all duration-500 cursor-pointer appearance-none text-center hover:bg-surface-container-low hover:border-primary/40 italic"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            >
              {tipos.map(t => (
                <option key={t} value={t} className="bg-surface-container-highest text-on-surface">{t.toUpperCase()}</option>
              ))}
            </select>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none">
              <span className="material-symbols-outlined text-primary text-xl">expand_more</span>
            </div>
          </div>
        </div>

        {deptoQueCarga && (
          <div className="mt-10 inline-flex items-center gap-4 px-6 py-2.5 bg-surface-container-high border border-outline-variant/30 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest italic shadow-xl animate-in fade-in slide-in-from-left-4">
            <span className="material-symbols-outlined text-sm">location_on</span>
            Jurisdicción: {deptoQueCarga}
            <button onClick={() => window.history.replaceState({}, '', '/servicios')} className="ml-4 text-on-surface hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xs">close</span>
            </button>
          </div>
        )}
      </section>

      {/* 🛠 GRID DE RESULTADOS */}
      <div className="container mx-auto relative z-10 max-w-7xl">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[550px] bg-surface-container-high/40 rounded-[3rem] animate-pulse border border-outline-variant/5 shadow-2xl"></div>
            ))}
          </div>
        ) : serviciosFiltrados.length === 0 ? (
          <div className="text-center py-48 bg-surface-container-low rounded-[4rem] border border-outline-variant/10 flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-outline/20 mb-8 block">construction</span>
            <p className="text-on-surface-variant text-xl font-bold uppercase tracking-widest italic opacity-40">Red Operativa Desconectada en esta sección</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {serviciosFiltrados.map((s) => (
              <div
                key={s._id}
                className="group relative flex flex-col h-full bg-surface-container-high rounded-[2.5rem] border border-outline-variant/10 overflow-hidden hover:scale-[1.02] transition-all duration-500 shadow-xl hover:shadow-primary/5"
              >
                {/* 🖼 CONTENEDOR DE IMAGEN */}
                <div className="h-[380px] overflow-hidden relative bg-surface-container-lowest">
                  <img
                    src={s.fotos && s.fotos.length > 0 ? `${BASE_URL}${s.fotos[0]}` : "https://images.unsplash.com/photo-1594776208131-abf317d3d196?q=80&w=2070&auto=format&fit=crop"}
                    className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[3s] group-hover:scale-105"
                    alt={s.nombre}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high/90 via-transparent to-transparent"></div>

                  <div className="absolute top-8 right-8 bg-surface-container-lowest/80 backdrop-blur-md p-3 rounded-2xl border border-outline-variant/10 shadow-lg">
                    <span className="material-symbols-outlined text-primary text-2xl fill-0 group-hover:fill-1 transition-all">verified</span>
                  </div>
                </div>

                {/* 📝 CONTENIDO CARD */}
                <div className="p-10 flex flex-col flex-1 -mt-24 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-primary/10 text-[#E8E0C8] text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest italic border border-primary/20">
                      {s.tipoServicio}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black text-on-surface italic tracking-tighter group-hover:text-primary transition-colors duration-500 uppercase leading-[0.9] mb-8 line-clamp-2 min-h-[4rem] glow-text">
                    {s.nombre}
                  </h3>

                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl px-5 py-2.5 flex items-center gap-2 shadow-inner">
                      <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest italic">{s.zona}</span>
                    </div>
                  </div>

                  <p className="text-on-surface-variant text-[10px] font-medium tracking-wider leading-relaxed mb-10 line-clamp-2 italic border-l-2 border-primary/20 pl-5 group-hover:text-on-surface transition-colors uppercase opacity-60">
                    {s.descripcion || "Servicio optimizado para tracción corporativa bajo estándares 360AGRO Platinum."}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-10 border-t border-outline-variant/10">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[9px] font-bold text-[#E8E0C8] uppercase tracking-widest italic">Certificación Elite</span>
                        {s.proveedorEsVerificado && (
                          <span className="material-symbols-outlined text-[10px] text-primary fill-1">verified</span>
                        )}
                      </div>
                      <span className="text-on-surface font-black text-lg tracking-tighter uppercase italic leading-none mb-3">
                        {s.proveedorNombre || "Hub Operativo S.A."}
                      </span>
                      {/* Rating */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((st) => (
                          <span key={st} className={`material-symbols-outlined text-[10px] ${st <= (s.proveedorRating?.promedio || 5) ? 'text-primary fill-1' : 'text-on-surface-variant/20'}`}>star</span>
                        ))}
                      </div>
                    </div>

                    <Link
                      to={`/servicio/${s._id}`}
                      className="w-16 h-16 machined-gradient text-on-tertiary-fixed rounded-[1.5rem] flex items-center justify-center hover:scale-110 transition-all duration-500 shadow-xl group/btn border border-primary/20"
                    >
                      <span className="material-symbols-outlined text-2xl transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
