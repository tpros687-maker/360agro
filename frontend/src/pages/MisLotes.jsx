import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CardSkeleton } from "../components/Skeleton";
import API from "../api/axiosConfig";
import { BASE_URL } from "../api/axiosConfig";
import { toast } from "react-hot-toast";
import ModalConfirmar from "../components/ModalConfirmar"; // 1. Importación clave

export default function MisLotes() {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 2. Estados para el control del Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idABorrar, setIdABorrar] = useState(null);

  const fetchMisLotes = async () => {
    try {
      const res = await API.get("/lots/mis-lotes");
      setLotes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Error al sincronizar inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisLotes();
  }, []);

  // 3. Función que dispara el Modal
  const prepararEliminacion = (id) => {
    setIdABorrar(id);
    setModalAbierto(true);
  };

  // 4. Función de ejecución definitiva
  const confirmarEliminarLote = async () => {
    try {
      await API.delete(`/lots/${idABorrar}`);
      setLotes((prev) => prev.filter((l) => l._id !== idABorrar));
      toast.success("LOTE RETIRADO DEL MERCADO");
    } catch (error) {
      toast.error("No se pudo procesar la eliminación");
    } finally {
      setModalAbierto(false);
      setIdABorrar(null);
    }
  };

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      
      {/* 5. Inserción del Componente Modal */}
      <ModalConfirmar 
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alConfirmar={confirmarEliminarLote}
        titulo="Retirar Activo"
        mensaje="¿Está seguro de que desea retirar este lote del mercado élite? Esta operación es irreversible y el activo dejará de ser visible para los compradores."
      />

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-agro-teal/5 rounded-full blur-[200px] pointer-events-none -mr-32 -mt-32"></div>

      <header className="container mx-auto mb-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Gestión de Inventario</span>
            <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none">
              MIS <span className="text-agro-teal not-italic font-black">LOTES</span>
            </h1>
          </div>
          <Link to="/publicar" className="btn-emerald py-5 shadow-teal-glow hover:scale-105 transition-all">
            ➕ PUBLICAR NUEVO LOTE ➔
          </Link>
        </div>
      </header>

      <div className="container mx-auto relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : lotes.length === 0 ? (
          <div className="text-center py-40 bg-agro-charcoal/20 border-2 border-dashed border-white/5 rounded-[3rem]">
            <p className="text-agro-cream/10 text-2xl font-black uppercase tracking-[0.5em] italic mb-10 text-glow-teal">Portafolio Vacío</p>
            <Link to="/publicar" className="text-agro-teal font-black uppercase tracking-[0.3em] border-b border-agro-teal/20 pb-2 hover:text-white transition-colors">
              INICIAR PRIMERA PUBLICACIÓN ➔
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {lotes.map((lote) => (
              <div
                key={lote._id}
                className={`card-midnight group bg-agro-charcoal/40 border-white/5 flex flex-col h-full hover:border-agro-teal/30 transition-all duration-700 shadow-2xl relative ${
                    lote.destacado ? "border-agro-teal/30 shadow-teal-glow" : ""
                }`}
              >
                {/* Badge de Destacado o Video */}
                <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                    {lote.destacado && (
                        <span className="bg-agro-teal text-agro-midnight text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-teal-glow">
                          ⭐ DESTACADO
                        </span>
                    )}
                </div>

                {/* Imagen */}
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={lote.fotos?.[0] ? `${BASE_URL}${lote.fotos[0]}` : "/placeholder.png"}
                    alt={lote.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-[2s] grayscale-[30%] group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-agro-midnight via-transparent to-transparent opacity-80"></div>
                </div>

                {/* Info */}
                <div className="p-10 flex flex-col flex-1">
                  <h2 className="text-2xl font-black text-white italic tracking-tighter mb-4 group-hover:text-agro-teal transition-colors duration-500 uppercase leading-none truncate">
                    {lote.titulo}
                  </h2>

                  <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                      <span className="text-agro-cream/20 font-black uppercase tracking-widest text-[9px]">Valoración</span>
                      <span className="text-white font-black italic text-lg tracking-tighter">
                        USD {lote.precio?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* BOTONES */}
                  <div className="mt-auto flex gap-4 pt-8 border-t border-white/5">
                    <Link
                      to={`/editar-lote/${lote._id}`}
                      className="flex-1 py-4 bg-white/5 text-white font-black rounded-xl border border-white/5 hover:bg-agro-teal hover:text-agro-midnight transition-all text-[10px] uppercase tracking-widest text-center"
                    >
                      ✏️ Editar
                    </Link>

                    <button
                      onClick={() => prepararEliminacion(lote._id)} // 6. Llamada a la preparación
                      className="px-6 py-4 bg-red-900/10 text-red-500/40 hover:bg-red-500 hover:text-white transition-all rounded-xl border border-red-900/20 text-[10px] uppercase tracking-widest font-black"
                    >
                      🗑️
                    </button>
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