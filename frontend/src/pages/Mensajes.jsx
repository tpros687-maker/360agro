import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";
import { toast } from "react-hot-toast";

export default function Mensajes() {
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarConversaciones = async () => {
    try {
      const { data } = await api.get("/mensajes/bandeja");
      setConversaciones(data);
    } catch (error) {
      console.error("Error en bandeja:", error);
      toast.error("Error al sincronizar la mensajería");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConversaciones();
  }, []);

  if (loading) return (
    <div className="bg-agro-midnight min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-agro-teal shadow-teal-glow"></div>
    </div>
  );

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
      {/* FX Ambiental */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-agro-teal/5 blur-[150px] -mr-40 -mt-40"></div>

      <div className="container mx-auto max-w-4xl relative z-10 animate-reveal">

        <header className="mb-12 border-b border-white/5 pb-10">
          <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Terminal de Negocios</span>
          <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
            Bandeja de <span className="text-agro-teal not-italic font-black">Operaciones</span>
          </h1>
        </header>

        <div className="space-y-4">
          {conversaciones.length > 0 ? conversaciones.map((chat) => {
            // ✅ LÓGICA DE REFERENCIA DINÁMICA
            // Determinamos el ID de referencia (Lote o Producto)
            const referenciaId = chat.lote?._id || chat.producto?._id || 'general';

            return (
              <Link
                key={chat._id}
                to={`/mensajes/${referenciaId}/${chat.otroUsuario._id}`}
                className="group flex items-center gap-6 p-7 bg-agro-charcoal/40 border border-white/5 rounded-[2.5rem] hover:border-agro-teal/30 transition-all duration-500 shadow-2xl backdrop-blur-md"
              >
                {/* Icono de Tipo de Negocio */}
                <div className="w-16 h-16 bg-agro-midnight rounded-2xl flex items-center justify-center text-3xl border border-white/5 group-hover:border-agro-teal/30 transition-all shadow-inner">
                  {chat.lote ? "🐂" : chat.producto ? "📦" : "💬"}
                </div>

                {/* Info de la Conversación */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] truncate group-hover:text-agro-teal transition-colors">
                      {chat.otroUsuario?.nombre || "Usuario Eliminado"}
                    </h3>
                    <span className="text-[9px] font-black text-agro-cream/10 uppercase tracking-widest italic">
                      {new Date(chat.ultimoMensaje.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Etiqueta de Referencia */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-agro-teal/10 text-agro-teal text-[8px] font-black px-3 py-1 rounded-full border border-agro-teal/10 uppercase tracking-widest italic">
                      {chat.lote ? "Hacienda" : chat.producto ? "Insumos" : "General"}
                    </span>
                    <p className="text-white/40 text-[9px] font-bold uppercase tracking-tighter truncate italic">
                      {chat.lote?.titulo || chat.producto?.titulo || "Consulta Externa"}
                    </p>
                  </div>

                  <p className="text-agro-cream/30 text-[11px] italic truncate font-medium">
                    "{chat.ultimoMensaje.contenido}"
                  </p>
                </div>

                {/* Status de Lectura */}
                <div className="flex flex-col items-end gap-3">
                  {chat.noLeidos > 0 && (
                    <span className="bg-agro-teal text-agro-midnight text-[9px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-teal-glow animate-pulse">
                      {chat.noLeidos}
                    </span>
                  )}
                  <div className="text-white/5 group-hover:text-agro-teal transition-all text-xl translate-x-0 group-hover:translate-x-2">
                    ➔
                  </div>
                </div>
              </Link>
            );
          }) : (
            <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[4rem] bg-agro-charcoal/10 backdrop-blur-sm">
              <p className="text-agro-cream/10 text-2xl font-black uppercase tracking-[0.5em] italic">Terminal de Mensajes Vacía</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}