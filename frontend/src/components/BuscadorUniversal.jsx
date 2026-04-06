import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig"; // Usamos la config centralizada de axios
import { BASE_URL } from "../api/axiosConfig";

export default function BuscadorUniversal() {
  const [query, setQuery] = useState("");
  // Renombramos productos por tiendas para reflejar la búsqueda de negocios
  const [resultados, setResultados] = useState({ lotes: [], tiendas: [], servicios: [] });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef();

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const close = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShow(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResultados({ lotes: [], tiendas: [], servicios: [] });
      setShow(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setShow(true);
      try {
        // Peticiones simultáneas con el nuevo léxico y rutas
        const [resLotes, resTiendas, resServs] = await Promise.all([
          api.get(`/lots?search=${query}`),
          api.get(`/proveedores?tipo=tienda&search=${query}`), // Busca negocios tipo tienda
          api.get(`/servicios?search=${query}`)
        ]);

        setResultados({
          lotes: resLotes.data.slice(0, 3),
          tiendas: resTiendas.data.slice(0, 3),
          servicios: resServs.data.slice(0, 3)
        });
      } catch (error) {
        console.error("Error en búsqueda universal");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (ruta) => {
    setQuery("");
    setShow(false);
    navigate(ruta);
  };

  return (
    <div className="relative flex-1 max-w-md mx-8 hidden lg:block" ref={searchRef}>
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="BUSCAR LOTES, TIENDAS O SERVICIOS..."
          className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest outline-none focus:border-agro-ocean/50 focus:bg-white/10 transition-all shadow-blue-accent"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:text-agro-sky group-focus-within:opacity-100 transition-all text-xs">🔍</span>
      </div>

      {show && (
        <div className="absolute top-full left-0 w-full mt-6 bg-agro-midnight/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,116,217,0.2)] z-[100] animate-in slide-in-from-top-4 duration-500">

          {loading ? (
            <div className="p-10 text-center text-[10px] font-black text-agro-sky animate-pulse uppercase tracking-[0.4em] italic shadow-blue-accent">Sincronizando Terminal 360...</div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-6">

              {/* SECCIÓN LOTES */}
              {resultados.lotes.length > 0 && (
                <div className="mb-8">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] mb-5 ml-4 italic border-l-2 border-agro-ocean/30 pl-4">Activos en Remate</p>
                  {resultados.lotes.map(l => (
                    <div key={l._id} onClick={() => handleSelect(`/lotes/${l._id}`)} className="flex items-center gap-5 p-4 hover:bg-agro-ocean/10 rounded-2xl cursor-pointer transition-all group">
                      <div className="w-12 h-12 bg-agro-ocean/10 rounded-xl flex items-center justify-center group-hover:bg-agro-ocean group-hover:text-white transition-all shadow-blue-accent italic text-xl">🐂</div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white uppercase tracking-tighter truncate group-hover:text-agro-sky transition-colors">{l.titulo}</span>
                        <span className="text-[9px] text-white/30 uppercase font-black tracking-widest">{l.raza} • {l.zona}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SECCIÓN TIENDAS (NEGOCIOS) */}
              {resultados.tiendas.length > 0 && (
                <div className="mb-8">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] mb-5 ml-4 italic border-l-2 border-agro-ocean/30 pl-4">Nodos Comerciales</p>
                  {resultados.tiendas.map(t => (
                    <div key={t._id} onClick={() => handleSelect(`/tienda/${t.slug}`)} className="flex items-center gap-5 p-4 hover:bg-agro-ocean/10 rounded-2xl cursor-pointer transition-all group">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-agro-ocean group-hover:text-white transition-all shadow-blue-accent italic text-xl">🏪</div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white uppercase tracking-tighter truncate group-hover:text-agro-sky transition-colors">{t.nombre}</span>
                        <span className="text-[9px] text-agro-sky uppercase font-black tracking-widest italic">{t.zona}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SECCIÓN SERVICIOS (CONTRATISTAS) */}
              {resultados.servicios.length > 0 && (
                <div className="mb-2">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em] mb-5 ml-4 italic border-l-2 border-agro-ocean/30 pl-4">Red de Contratistas</p>
                  {resultados.servicios.map(s => (
                    <div key={s._id} onClick={() => handleSelect(`/servicio/${s._id}`)} className="flex items-center gap-5 p-4 hover:bg-agro-ocean/10 rounded-2xl cursor-pointer transition-all group">
                      <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-agro-ocean group-hover:text-white transition-all shadow-blue-accent italic text-xl">🚜</div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white uppercase tracking-tighter truncate group-hover:text-agro-sky transition-colors">{s.nombre}</span>
                        <span className="text-[9px] text-white/30 uppercase font-black italic tracking-widest">{s.tipoServicio}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {Object.values(resultados).every(arr => arr.length === 0) && (
                <div className="p-12 text-center text-[10px] font-black text-white/10 uppercase tracking-[0.5em] italic">No se hallaron nodos activos en la red</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}