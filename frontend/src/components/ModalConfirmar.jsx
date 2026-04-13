export default function ModalConfirmar({ abierto, alCerrar, alConfirmar, titulo, mensaje }) {
    if (!abierto) return null;
  
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center px-6">
        {/* Fondo desenfocado Noir */}
        <div 
          className="absolute inset-0 bg-agro-midnight/80 backdrop-blur-md animate-fade-in"
          onClick={alCerrar}
        ></div>
  
        {/* Caja del Modal */}
        <div className="bg-agro-charcoal border border-white/10 w-full max-w-md p-10 rounded-[3.5rem] shadow-teal-glow-lg relative z-10 animate-reveal">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-8 shadow-inner">
              <span className="material-symbols-outlined text-sm">warning</span>
            </div>
            
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4 leading-tight">
              {titulo || "Confirmar Acción"}
            </h3>
            
            <p className="text-agro-cream/40 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed mb-10 italic">
              {mensaje || "¿Desea proceder con esta operación técnica en la red?"}
            </p>
  
            <div className="flex flex-col gap-4">
              <button
                onClick={alConfirmar}
                className="w-full bg-red-500 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-red-600 transition-all shadow-lg active:scale-95"
              >
                Confirmar <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              
              <button
                onClick={alCerrar}
                className="w-full bg-white/5 text-agro-cream/30 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] hover:bg-white/10 transition-all border border-white/5"
              >
                Abortar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }