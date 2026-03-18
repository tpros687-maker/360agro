import { useState, useEffect, useRef } from "react";

export default function AgroIA() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const scrollRef = useRef(null);

  const [chat, setChat] = useState([
    { 
      role: "ia", 
      text: "Bienvenido a la Central de Inteligencia de 360 Agro. Soy tu asistente experto en mercados de hacienda, maquinaria y gestión veterinaria. ¿En qué activo o servicio necesitas asesoramiento hoy?" 
    }
  ]);

  // Autoscroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const enviarConsulta = async () => {
    if (!mensaje.trim()) return;
    
    const nuevoMensajeUsuario = { role: "user", text: mensaje };
    setChat(prev => [...prev, nuevoMensajeUsuario]);
    setMensaje("");
    setEscribiendo(true);

    // --- LÓGICA DE RESPUESTA EXPERTA (Simulación avanzada hasta conectar API) ---
    setTimeout(() => {
      let respuestaIA = "Analizando bases de datos de 360 Agro... ";
      
      const msg = nuevoMensajeUsuario.text.toLowerCase();
      if (msg.includes("vaca") || msg.includes("ternero") || msg.includes("hacienda")) {
        respuestaIA = "Para el mercado de hacienda actual, te recomiendo fijarte en los lotes de invernada. Los precios en USD están estables. ¿Quieres que te muestre los lotes con mejores métricas de visitas hoy?";
      } else if (msg.includes("plan") || msg.includes("vender")) {
        respuestaIA = "Para ampliar tu mercado, el Plan Oro permite subir videos en 4K y destacar tus activos en el carrusel principal. Esto suele aumentar el interés real (clics a WhatsApp) en un 35%.";
      } else {
        respuestaIA = "He recibido tu consulta. Como experto en el rubro, te sugiero verificar la zona de procedencia y las especificaciones técnicas del activo. ¿Buscas algo específico en Hacienda o Tiendas?";
      }

      setChat(prev => [...prev, { role: "ia", text: respuestaIA }]);
      setEscribiendo(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {abierto && (
        <div className="bg-agro-charcoal border border-white/10 w-[350px] h-[500px] rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden mb-6 animate-in slide-in-from-bottom-10 duration-500 backdrop-blur-3xl">
          <header className="bg-agro-teal p-6 text-agro-midnight flex justify-between items-center shadow-lg">
            <div>
              <p className="font-black text-[10px] uppercase tracking-[0.2em]">Agro-Asistente v1.0</p>
              <h4 className="font-black text-xs italic uppercase tracking-tighter">Central de Inteligencia</h4>
            </div>
            <div className="w-2 h-2 bg-agro-midnight rounded-full animate-ping"></div>
          </header>
          
          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 no-scrollbar">
            {chat.map((m, i) => (
              <div key={i} className={`flex ${m.role === "ia" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-[11px] font-bold leading-relaxed shadow-xl ${
                  m.role === "ia" 
                  ? "bg-white/5 text-agro-teal border border-white/5 rounded-tl-none" 
                  : "bg-agro-teal text-agro-midnight rounded-tr-none"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {escribiendo && (
              <div className="text-[9px] font-black text-agro-teal animate-pulse uppercase tracking-widest">IA Procesando datos técnicos...</div>
            )}
          </div>

          <div className="p-6 border-t border-white/5 bg-agro-midnight/50 flex gap-3">
            <input 
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && enviarConsulta()}
              placeholder="Escriba su consulta técnica..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-[11px] outline-none focus:border-agro-teal/50 transition-all font-bold"
            />
            <button onClick={enviarConsulta} className="bg-agro-teal text-agro-midnight w-12 h-12 rounded-2xl font-black hover:scale-105 transition-transform flex items-center justify-center">➔</button>
          </div>
        </div>
      )}

      <button 
        onClick={() => setAbierto(!abierto)}
        className={`w-20 h-20 rounded-[2rem] shadow-teal-glow flex items-center justify-center text-3xl transition-all duration-500 ${
          abierto ? "bg-white text-agro-midnight rotate-90" : "bg-agro-teal text-agro-midnight hover:scale-110"
        }`}
      >
        {abierto ? "✕" : "🤖"}
      </button>
    </div>
  );
}