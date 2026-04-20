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
import SEO from "../components/SEO";

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
    const matchesDepto = !deptoQueCarga || s.zona?.toLowerCase().includes(deptoQueCarga.toLowerCase());

    return matchesBusqueda && matchesFiltro && matchesDepto;
  });

  const tipos = ["todos", ...new Set(servicios.map(s => s.tipoServicio).filter(Boolean))];

  return (
    <div className="bg-background min-h-screen pt-32 pb-32 px-6 text-on-surface selection:bg-primary-container selection:text-on-primary-container relative overflow-hidden">
      <SEO
        title="Servicios del Campo — 360 Agro"
        description="Encontrá servicios agropecuarios: veterinaria, transporte, asesoría y más. Profesionales del campo uruguayo."
        url="https://360agro.vercel.app/servicios"
      />

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[250px] rounded-full pointer-events-none opacity-40"></div>

      <div className="container mx-auto mb-12 relative z-10">
        <header className="mb-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-0.5 machined-gradient"></div>
                <span className="text-primary font-bold text-[10px] uppercase tracking-[0.5em]">Contratistas y profesionales</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-on-surface italic tracking-tighter uppercase leading-none">
                Servicios
              </h1>
            </div>

            {/* BUSCADOR Y FILTRO */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary text-lg">search</span>
                <input
                  type="text"
                  placeholder="Especialidad o zona..."
                  className="bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 pl-11 pr-5 py-3 rounded-full outline-none transition-all font-bold text-on-surface text-[10px] placeholder:text-on-surface-variant/30 uppercase tracking-widest w-64 shadow-sm"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
              <div className="relative">
                <select
                  className="bg-surface-container-lowest border border-outline-variant/50 text-on-surface-variant font-bold text-[10px] uppercase tracking-widest px-6 py-3 rounded-full outline-none cursor-pointer appearance-none hover:border-primary/40 transition-all pr-10 shadow-sm"
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                >
                  {tipos.map(t => (
                    <option key={t} value={t} className="bg-surface-container-highest text-on-surface">{t.toUpperCase()}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary text-sm">expand_more</span>
              </div>
            </div>
          </div>

          {deptoQueCarga && (
            <div className="mt-6 inline-flex items-center gap-3 px-5 py-2 bg-surface-container-high border border-outline-variant/30 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-sm">location_on</span>
              {deptoQueCarga}
            </div>
          )}
        </header>
      </div>

      {/* 🛠 GRID DE RESULTADOS */}
      <div className="container mx-auto relative z-10 max-w-7xl">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[550px] bg-surface-container-high/40 rounded-[3rem] animate-pulse border border-outline-variant/5 shadow-2xl"></div>
            ))}
          </div>
        ) : serviciosFiltrados.length === 0 ? (
          <div className="text-center py-48 bg-surface-container-low rounded-[4rem] border border-outline-variant/70 flex flex-col items-center">
            <span className="material-symbols-outlined text-6xl text-outline/20 mb-8 block">construction</span>
            <p className="text-on-surface-variant text-xl font-bold uppercase tracking-widest italic opacity-40">Red Operativa Desconectada en esta sección</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {serviciosFiltrados.map((s) => (
              <Link
                key={s._id}
                to={`/servicio/${s._id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={s.fotos && s.fotos.length > 0 ? (/^https?:\/\//.test(s.fotos[0]?.trim()) ? s.fotos[0].trim() : `${BASE_URL}${s.fotos[0]}`) : "https://images.unsplash.com/photo-1594776208131-abf317d3d196?q=80&w=2070"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    alt={s.nombre}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{s.tipoServicio}</span>
                  </div>
                  {s.proveedorEsVerificado && (
                    <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-white text-xs">verified</span>
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest">Verificado</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-sm font-black text-on-surface uppercase tracking-tight mb-4 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                    {s.nombre}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-surface-container-low rounded-xl p-2.5">
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Zona</p>
                      <p className="text-[11px] font-black text-on-surface truncate">{s.zona || "Uruguay"}</p>
                    </div>
                    <div className="bg-surface-container-low rounded-xl p-2.5">
                      <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">Proveedor</p>
                      <p className="text-[11px] font-black text-on-surface truncate">{s.usuario?.nombre || "—"}</p>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-outline-variant/30">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Ver detalle</span>
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
