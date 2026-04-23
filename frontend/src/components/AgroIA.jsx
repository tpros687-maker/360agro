import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import aiApi from "../api/aiApi";
import api from "../api/axiosConfig";
import { toast } from "react-hot-toast";
import { Bot, Send, X, Zap, Sparkles } from "lucide-react";

export default function AgroIA() {
  return null; // temporalmente deshabilitado
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const scrollRef = useRef(null);
  const location = useLocation();

  const [chat, setChat] = useState([]);

  useEffect(() => {
    const fetchWelcome = async () => {
      try {
        const { data } = await api.get("/settings");
        setChat([
          {
            role: "ia",
            text: data.ai_welcome_msg || "Bienvenido a la Central de Inteligencia de 360 Agro Elite. Soy su consultor analítico. Estoy capacitado para optimizar su estrategia comercial, gestionar activos complejos y navegar nuestro ecosistema de alta performance. ¿Qué terminal operativa desea iniciar?"
          }
        ]);
      } catch (error) {
        setChat([{ role: "ia", text: "Conexión con terminal de IA establecida. ¿Cómo puedo ayudarle?" }]);
      }
    };
    fetchWelcome();
  }, []);

  // Autoscroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, escribiendo]);

  const enviarConsulta = async () => {
    if (!mensaje.trim()) return;

    const textoUsuario = mensaje;
    const nuevoMensajeUsuario = { role: "user", text: textoUsuario };

    setChat(prev => [...prev, nuevoMensajeUsuario]);
    setMensaje("");
    setEscribiendo(true);

    try {
      const { data } = await aiApi.consultar(textoUsuario, `Usuario en: ${location.pathname}`, chat);
      setChat(prev => [...prev, { role: "ia", text: data.respuesta }]);
    } catch (error) {
      console.error("Error en Agro-IA:", error);
      toast.error("Conexión con la Central de Inteligencia interrumpida.");
      setChat(prev => [...prev, { role: "ia", text: "Lo siento, mi conexión con la terminal central se ha perdido temporalmente. Por favor, intente de nuevo en unos instantes." }]);
    } finally {
      setEscribiendo(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end">
      {abierto && (
        <div className="bg-surface-container-high border border-outline-variant/15 w-[420px] h-[650px] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden mb-8 animate-in slide-in-from-bottom-12 duration-700 backdrop-blur-3xl relative">
          <header className="machined-gradient p-8 text-on-tertiary-fixed flex justify-between items-center shadow-2xl relative overflow-hidden border-b border-primary/20">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-black italic scale-150 rotate-12 pointer-events-none tracking-tighter uppercase whitespace-nowrap">360-CORE-AI</div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-xs animate-pulse text-on-tertiary-fixed">memory</span>
                <p className="font-bold text-[9px] uppercase tracking-[0.4em] italic opacity-80">Socio Analítico</p>
              </div>
              <h4 className="font-black text-xl italic uppercase tracking-tighter leading-none glow-text">Central de Inteligencia</h4>
            </div>
            <div className="w-5 h-5 bg-background rounded-full animate-pulse shadow-inner relative z-10 flex items-center justify-center border border-primary/30">
              <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(63,111,118,0.6)]"></div>
            </div>
          </header>

          <div ref={scrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 no-scrollbar bg-gradient-to-b from-surface-container-high via-surface-container-low to-surface-container-lowest">
            {chat.map((m, i) => (
              <div key={i} className={`flex ${m.role === "ia" ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                <div className={`max-w-[85%] p-5 rounded-[2rem] text-[11px] font-bold leading-relaxed shadow-lg transition-all ${m.role === "ia"
                  ? "bg-surface-container-lowest text-primary border border-outline-variant/10 rounded-tl-none italic"
                  : "machined-gradient text-on-tertiary-fixed rounded-tr-none shadow-primary/10 border border-primary/20"
                  }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {escribiendo && (
              <div className="flex items-center gap-4 px-2">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
                <span className="text-[8px] font-bold text-primary/40 uppercase tracking-[0.4em] ml-2 italic">Procesando terminal...</span>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-outline-variant/10 bg-surface-container-lowest/80 flex gap-4 shadow-2xl backdrop-blur-md">
            <input
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && enviarConsulta()}
              placeholder="Inicie consulta estratégica..."
              className="flex-1 bg-surface-container-low border border-outline-variant/10 rounded-2xl px-6 py-4 text-on-surface text-[11px] outline-none focus:border-primary/40 transition-all font-bold placeholder:text-on-surface-variant/20 uppercase tracking-widest italic"
            />
            <button
              onClick={enviarConsulta}
              disabled={escribiendo}
              className="machined-gradient text-on-tertiary-fixed w-14 h-14 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-xl disabled:opacity-30 group border border-primary/20"
            >
              <span className="material-symbols-outlined text-xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">send</span>
            </button>
          </div>
        </div>
      )}

      {/* IA BOT FLOATING BUTTON */}
      <div className="relative group">
        <div className="absolute inset-x-[-20px] inset-y-[-20px] bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/30 transition-all duration-700 animate-pulse"></div>
        <button
          onClick={() => setAbierto(!abierto)}
          className={`w-20 h-20 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all duration-700 relative z-10 border ${abierto
            ? "bg-on-surface text-background rotate-180"
            : "machined-gradient text-on-tertiary-fixed border-primary/30 hover:scale-110 hover:shadow-primary/20"
            }`}
        >
          <span className="relative z-10">
            {abierto ? (
              <span className="material-symbols-outlined text-3xl">close</span>
            ) : (
              <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">smart_toy</span>
            )}
          </span>
          {!abierto && (
            <div className="absolute inset-0 bg-primary rounded-[2rem] animate-ping opacity-10 group-hover:opacity-20 transition-opacity"></div>
          )}
        </button>
      </div>
    </div>
  );
}
