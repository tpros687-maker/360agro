import { useState, useEffect, useRef, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import MessageAPI from "../api/messageApi";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import { BASE_URL } from "../api/axiosConfig";
import { toast } from "react-hot-toast";

export default function Chat() {
  // ✅ referenciaId puede ser un ID de Lote, de Producto o 'general'
  const { referenciaId, otroUsuarioId } = useParams(); 
  const { usuario } = useContext(AuthContext);

  const [conversacion, setConversacion] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [infoChat, setInfoChat] = useState(null);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // 🔌 Conexión Socket.IO Híbrida
  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("token") },
    });

    socketRef.current.emit("joinChat", {
      referenciaId, // Usamos la referencia flexible
      userId: usuario?._id,
      otroUsuarioId,
    });

    socketRef.current.on("nuevoMensaje", (msg) => {
      // Verificamos que el mensaje pertenezca a esta conversación activa
      const refMsg = msg.lote?._id || msg.lote || msg.producto?._id || msg.producto || 'general';
      if (String(refMsg) === String(referenciaId)) {
        setConversacion((prev) => [...prev, msg]);
      }
    });

    return () => socketRef.current.disconnect();
  }, [referenciaId, usuario?._id, otroUsuarioId]);

  // 🔥 Cargar historial inteligente
  const cargarChat = async () => {
    try {
      setLoading(true);
      const { data } = await MessageAPI.obtenerConversacion(referenciaId, otroUsuarioId);
      setConversacion(data);
      
      // Extraemos info del encabezado del primer mensaje que tenga datos
      const mensajeConInfo = data.find(m => m.lote || m.producto);
      if (mensajeConInfo) {
          setInfoChat(mensajeConInfo.lote || mensajeConInfo.producto);
      }
    } catch (err) {
      console.error("Error al cargar chat:", err);
      toast.error("Error de sincronización con la terminal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario) cargarChat();
  }, [referenciaId, otroUsuarioId, usuario]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversacion]);

  const enviar = async (e) => {
    e.preventDefault();
    if (!mensaje.trim() && !archivo) return;

    try {
      const formData = new FormData();
      
      // ✅ Lógica de envío inteligente: ¿Es lote o producto?
      // Buscamos en infoChat o inferimos por el contexto si es posible
      // Por defecto, intentamos mandar ambos y el backend filtrará
      if (referenciaId !== 'general') {
          // Si el backend espera 'loteId' o 'productoId' específicamente:
          // Aquí una solución simple: mandamos el ID y el backend decide según el modelo
          formData.append("loteId", referenciaId); 
          formData.append("productoId", referenciaId);
      }
      
      formData.append("mensaje", mensaje);
      formData.append("receptor", otroUsuarioId);
      if (archivo) formData.append("archivo", archivo);

      const { data } = await MessageAPI.enviarMensaje(formData);

      socketRef.current.emit("enviarMensaje", data);
      setConversacion((prev) => [...prev, data]);
      setMensaje("");
      setArchivo(null);
    } catch (error) {
      toast.error("Fallo en la transmisión de datos");
    }
  };

  if (!usuario) return <div className="pt-40 text-center text-agro-teal font-black uppercase tracking-[0.5em] italic animate-pulse">Autenticación Requerida</div>;

  return (
    <div className="bg-agro-midnight min-h-screen pt-24 pb-10 px-4 flex flex-col items-center relative overflow-hidden">
      {/* FX de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-agro-teal/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-agro-charcoal/40 border border-white/5 rounded-[3rem] overflow-hidden flex flex-col h-[82vh] shadow-2xl backdrop-blur-2xl relative z-10 animate-reveal">
        
        {/* HEADER DEL CHAT */}
        <header className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-agro-midnight rounded-2xl flex items-center justify-center text-3xl border border-white/10 shadow-inner group overflow-hidden">
                    <span className="group-hover:scale-125 transition-transform duration-500">
                        {infoChat?.categoria === 'Ganado' || infoChat?.raza ? "🐂" : "📦"}
                    </span>
                </div>
                <div>
                    <h2 className="text-white font-black uppercase italic tracking-tighter text-xl leading-none">
                        {infoChat?.titulo || "Negociación en Curso"}
                    </h2>
                    <p className="text-agro-teal text-[9px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-agro-teal rounded-full animate-ping"></span>
                        Terminal de Enlace Seguro
                    </p>
                </div>
            </div>
            <Link to="/mensajes" className="bg-white/5 p-3 rounded-xl text-agro-cream/20 hover:text-white hover:bg-white/10 transition-all text-[9px] font-black uppercase tracking-widest border border-white/5">
                SALIR ➔
            </Link>
        </header>

        {/* ÁREA DE MENSAJES */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-agro-teal"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando Historial...</p>
              </div>
          ) : conversacion.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                  <p className="text-agro-cream/10 text-[10px] font-black uppercase tracking-[0.8em] italic border border-white/5 px-8 py-4 rounded-full">Canal Vacío - Inicie la negociación</p>
              </div>
          ) : conversacion.map((msg, index) => {
            const propio = String(msg.emisor?._id || msg.emisor) === String(usuario._id);
            return (
              <div key={index} className={`flex ${propio ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div className={`max-w-[75%] ${propio ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`px-7 py-5 rounded-[2.5rem] text-[13px] font-medium leading-relaxed shadow-2xl border backdrop-blur-sm
                    ${propio 
                        ? "bg-agro-teal text-agro-midnight border-agro-teal rounded-tr-none shadow-teal-glow/20" 
                        : "bg-white/5 text-agro-cream border-white/10 rounded-tl-none italic"}`}
                  >
                    {msg.archivo && (
                      <img
                        src={`${BASE_URL}${msg.archivo}`}
                        className="rounded-3xl mb-4 max-h-72 w-full object-cover border border-white/10 shadow-inner cursor-pointer hover:scale-[1.02] transition-transform"
                        alt="Adjunto"
                        onClick={() => window.open(`${BASE_URL}${msg.archivo}`, '_blank')}
                      />
                    )}
                    <p className={propio ? "font-bold" : "font-medium"}>{msg.mensaje}</p>
                  </div>
                  <span className="text-[8px] font-black text-agro-cream/10 uppercase tracking-[0.3em] mt-3 px-4 italic">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {propio ? 'Enviado' : 'Recibido'}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef}></div>
        </div>

        {/* INPUT DE MENSAJE */}
        <footer className="p-8 bg-white/5 border-t border-white/5">
          <form onSubmit={enviar} className="flex gap-4 items-center bg-agro-midnight/80 rounded-[2rem] p-3 border border-white/10 focus-within:border-agro-teal/40 transition-all shadow-inner">
            <label className="cursor-pointer w-14 h-14 flex items-center justify-center rounded-2xl hover:bg-white/5 transition-all text-2xl group">
              <span className="group-hover:scale-125 transition-transform">📎</span>
              <input type="file" className="hidden" onChange={(e) => setArchivo(e.target.files[0])} />
            </label>

            <input
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="ESCRIBA SU PROPUESTA COMERCIAL..."
              className="flex-1 bg-transparent text-white text-[10px] font-black uppercase tracking-[0.2em] outline-none px-4 placeholder:text-white/10"
            />

            <button
              type="submit"
              disabled={!mensaje.trim() && !archivo}
              className="bg-agro-teal text-agro-midnight px-10 h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:shadow-teal-glow transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
            >
              ENVIAR ➔
            </button>
          </form>
          {archivo && (
              <div className="mt-4 ml-6 text-[8px] font-black text-agro-teal uppercase animate-pulse flex items-center gap-2 italic">
                  <span className="w-1.5 h-1.5 bg-agro-teal rounded-full"></span>
                  Documento preparado para transmisión: {archivo.name}
              </div>
          )}
        </footer>
      </div>
    </div>
  );
}