import React from 'react';

export default function EstadisticasRapidas({ lotes = [], productos = [], tienda = null }) {
  // 1. Cálculo de Alcance Global (Visitas de Lotes + Visitas de Tienda)
  const visitasLotes = lotes.reduce((acc, lote) => acc + (lote.estadisticas?.visitas || 0), 0);
  const visitasTienda = tienda?.estadisticas?.visitas || 0;
  const alcanceGlobal = visitasLotes + visitasTienda;

  // 2. Cálculo de Interés Real (WhatsApp Lotes + WhatsApp Tienda)
  const whatsappLotes = lotes.reduce((acc, lote) => acc + (lote.estadisticas?.whatsapp || 0), 0);
  const whatsappTienda = tienda?.estadisticas?.whatsapp || 0;
  const interesReal = whatsappLotes + whatsappTienda;

  // 3. Identificar el "Activo Estrella" (El lote con más visitas)
  const activoEstrella = lotes.length > 0 
    ? [...lotes].sort((a, b) => (b.estadisticas?.visitas || 0) - (a.estadisticas?.visitas || 0))[0]
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      
      {/* CARD: ALCANCE GLOBAL */}
      <div className="bg-agro-charcoal/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
        <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:rotate-12 transition-transform duration-700">👁️</div>
        <header className="relative z-10">
          <p className="text-[10px] font-black text-agro-teal uppercase tracking-[0.3em] mb-2">Alcance Global</p>
          <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none">
            {alcanceGlobal.toLocaleString()}
          </h3>
          <p className="text-[9px] text-agro-cream/20 font-bold uppercase mt-4 tracking-widest">
            Visualizaciones totales en la red
          </p>
        </header>
        <div className="absolute bottom-0 left-0 h-1 bg-agro-teal/20 w-full"></div>
      </div>

      {/* CARD: INTERÉS REAL */}
      <div className="bg-agro-charcoal/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
        <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:scale-110 transition-transform duration-700">📱</div>
        <header className="relative z-10">
          <p className="text-[10px] font-black text-agro-teal uppercase tracking-[0.3em] mb-2">Interés Real</p>
          <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none">
            {interesReal.toLocaleString()}
          </h3>
          <p className="text-[9px] text-agro-cream/20 font-bold uppercase mt-4 tracking-widest">
            Contactos directos a WhatsApp
          </p>
        </header>
        <div className="absolute bottom-0 left-0 h-1 bg-agro-teal/40 w-[60%]"></div>
      </div>

      {/* CARD: ACTIVO ESTRELLA */}
      <div className="bg-agro-teal/5 border border-agro-teal/20 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
        <div className="absolute -right-2 -top-2 text-6xl opacity-10 group-hover:animate-pulse"><span className="material-symbols-outlined text-xs">star</span></div>
        <header className="relative z-10">
          <p className="text-[10px] font-black text-agro-midnight bg-agro-teal px-3 py-1 rounded-full inline-block uppercase tracking-widest mb-4">
            Activo Estrella
          </p>
          <h3 className="text-xl font-black text-white italic uppercase tracking-tighter leading-tight truncate">
            {activoEstrella ? activoEstrella.titulo : "Sin activos"}
          </h3>
          <p className="text-[9px] text-agro-teal/60 font-bold uppercase mt-3 tracking-widest">
            {activoEstrella 
              ? `Generando el ${( (activoEstrella.estadisticas?.visitas / (alcanceGlobal || 1)) * 100 ).toFixed(1)}% de tu tráfico`
              : "Sube un lote para medir impacto"}
          </p>
        </header>
      </div>

    </div>
  );
}