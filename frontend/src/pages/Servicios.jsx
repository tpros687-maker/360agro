// frontend/src/pages/Servicios.jsx
import { useEffect, useState } from "react";
import servicioApi from "../api/servicioApi";
import { Link } from "react-router-dom";

const BASE_URL = "http://localhost:5000";

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const { data } = await servicioApi.obtenerServicios();
        setServicios(data);
      } catch (err) {
        console.error("Error fetching services:", err);
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
      (s.tipo?.toLowerCase().includes(busquedaLower) || false) ||
      (s.zona?.toLowerCase().includes(busquedaLower) || false);

    const matchesFiltro = filtro === "todos" || s.tipo === filtro;
    return matchesBusqueda && matchesFiltro;
  });

  const tipos = ["todos", ...new Set(servicios.map(s => s.tipo).filter(Boolean))];

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6">

      {/* 🌌 HEADER SERVICIOS */}
      <section className="container mx-auto mb-20 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-agro-teal/5 blur-[120px] pointer-events-none"></div>
        <div className="reveal">
          <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">HUB Logístico y Técnico</span>
          <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-none mb-8">
            SERVICIOS <br /><span className="text-agro-teal not-italic font-black">ÉLITE</span>
          </h1>
        </div>

        {/* 🔍 BUSCADOR NOIR */}
        <div className="max-w-4xl bg-agro-charcoal border border-white/5 p-4 rounded-[2.5rem] flex flex-col sm:flex-row gap-4 shadow-2xl backdrop-blur-xl">
          <div className="relative flex-1">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-agro-teal text-xl">🔍</span>
            <input
              type="text"
              placeholder="Filtrar por nombre, zona o especialidad..."
              className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal focus:ring-4 focus:ring-agro-teal/5 px-16 py-5 rounded-[1.8rem] outline-none transition duration-500 font-bold text-white text-sm"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <select
            className="bg-agro-midnight border border-white/5 text-agro-cream/40 focus:text-white px-10 py-5 rounded-[1.8rem] outline-none transition duration-500 font-black text-[10px] uppercase tracking-widest cursor-pointer appearance-none text-center"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          >
            {tipos.map(t => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </section>

      {/* 🛠 GRID SERVICIOS NOIR */}
      <div className="container mx-auto">
        {loading ? (
          <div className="flex justify-center py-40">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-agro-teal shadow-teal-glow"></div>
          </div>
        ) : serviciosFiltrados.length === 0 ? (
          <div className="text-center py-40 card-midnight bg-white/5 border-dashed border-white/10 italic text-white/20 text-2xl font-black uppercase tracking-widest">
            Búsqueda sin resultados especializados
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {serviciosFiltrados.map((s) => (
              <div key={s._id} className="card-midnight group bg-agro-midnight border-white/5 flex flex-col h-full hover:scale-[1.02] transition-all duration-700 shadow-2xl relative">
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={`${BASE_URL}${s.imagen}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-[2s] opacity-60 group-hover:opacity-100"
                    alt={s.nombre}
                  />
                  <div className="absolute inset-0 bg-agro-midnight/40 group-hover:bg-transparent transition-all duration-700"></div>
                  <div className="absolute bottom-6 left-8">
                    <span className="bg-agro-teal text-white text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-teal-glow">
                      {s.tipo}
                    </span>
                  </div>
                </div>

                <div className="p-10 flex flex-col flex-1">
                  <h3 className="text-2xl font-black text-white italic tracking-tighter mb-4 group-hover:text-agro-teal transition-colors duration-500 uppercase leading-none">{s.nombre}</h3>

                  <p className="text-agro-cream/30 text-sm font-medium leading-relaxed mb-10 line-clamp-3">
                    Asistencia técnica especializada en {s.zona}. {s.descripcion || "Servicio certificado bajo los estándares de calidad de nuestra red agro-industrial."}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-8 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.3em] mb-1">Zona Operativa</span>
                      <span className="text-white font-black text-xs tracking-widest">📍 {s.zona}</span>
                    </div>
                    <Link
                      to={`/servicios/${s._id}`}
                      className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-agro-teal hover:bg-agro-teal hover:text-white transition-all duration-500 shadow-inner hover:shadow-teal-glow text-xl font-black"
                    >
                      →
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
