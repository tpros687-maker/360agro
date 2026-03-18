import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-agro-midnight border-t border-white/5 pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          
          {/* MARCA */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-agro-cream font-black italic uppercase text-2xl mb-6 leading-none">
              360 AGRO <br /> <span className="text-agro-teal not-italic">ELITE</span>
            </h3>
            <p className="text-agro-cream/20 text-[10px] font-bold leading-relaxed uppercase italic">
              "Digitalizando la trazabilidad y los negocios del sector agropecuario con tecnología de precisión."
            </p>
          </div>

          {/* COLUMNAS DE LINKS TÉCNICOS */}
          <div>
            <h4 className="text-agro-teal font-black uppercase text-[10px] tracking-[0.4em] mb-8">Ecosistema</h4>
            <ul className="space-y-4">
              <li><Link to="/lotes" className="text-agro-cream/40 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest">Remates Particulares</Link></li>
              <li><Link to="/tiendas" className="text-agro-cream/40 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest">Insumos Críticos</Link></li>
              <li><Link to="/servicios" className="text-agro-cream/40 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest">Equipos de Campaña</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-agro-teal font-black uppercase text-[10px] tracking-[0.4em] mb-8">Terminal</h4>
            <ul className="space-y-4">
              <li><Link to="/perfil" className="text-agro-cream/40 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest">Mi Membresía</Link></li>
              <li><Link to="/mensajes" className="text-agro-cream/40 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest">Canal de Negocios</Link></li>
              <li><Link to="/planes" className="text-agro-cream/40 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest">Upgrade Pro</Link></li>
            </ul>
          </div>

          {/* CONTACTO RÁPIDO */}
          <div className="bg-agro-charcoal/30 p-8 rounded-[2rem] border border-white/5">
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.4em] mb-6">Soporte Técnico</h4>
            <p className="text-agro-teal font-black text-[12px] italic mb-2">0800-360-AGRO</p>
            <p className="text-agro-cream/20 text-[8px] font-black uppercase tracking-widest leading-relaxed">
              Atención Operativa 24/7 para Socios Élites.
            </p>
          </div>
        </div>

        {/* BOTTOM FOOTER */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em]">
            © 2026 360 AGRO ELITE - TODOS LOS DERECHOS RESERVADOS.
          </p>
          <div className="flex gap-8">
             <span className="text-[8px] font-black text-white/5 uppercase tracking-widest">Sincronizado v3.2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}