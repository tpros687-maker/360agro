import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-background px-6 pt-20 pb-10 border-t border-outline-variant/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
        <div className="col-span-1 md:col-span-1">
          <span className="text-2xl font-black italic text-[#E8E0C8] drop-shadow-[0_0_15px_rgba(63,111,118,0.4)] block mb-6 font-headline tracking-tighter">360AGRO</span>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-light">
            Liderando la revolución tecnológica del sector agropecuario soberano a través de transparencia, tecnología y excelencia operativa.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-outline hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">share</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-outline-variant/30 flex items-center justify-center text-outline hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-lg">public</span>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#3F6F76] mb-6">Plataforma</h5>
          <ul className="space-y-4">
            <li><Link className="text-on-surface-variant hover:text-primary text-sm transition-colors" to="/lotes">Mapa Activo</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary text-sm transition-colors" to="/agro-ledger">Agro Ledger</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary text-sm transition-colors" to="/tiendas">Insumos Críticos</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary text-sm transition-colors" to="/servicios">Servicios Pro</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#3F6F76] mb-6">Soporte</h5>
          <ul className="space-y-4">
            <li><Link className="text-on-surface-variant hover:text-primary text-sm transition-colors" to="/perfil">Centro de Ayuda</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary text-sm transition-colors" to="/register">Seguridad de Datos</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary text-sm transition-colors" to="/planes">Términos de Servicio</Link></li>
            <li><Link className="text-on-surface-variant hover:text-primary text-sm transition-colors" to="/mensajes">Contacto Directo</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#3F6F76] mb-6">Inscripción Newsletter</h5>
          <p className="text-xs text-on-surface-variant mb-4 tracking-wide font-light">Reciba reportes semanales de mercado y actualizaciones de plataforma.</p>
          <div className="relative">
            <input
              className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary px-4 py-3 text-sm focus:ring-0 placeholder:text-outline/40 outline-none transition-colors"
              placeholder="Email corporativo"
              type="email"
            />
            <button className="absolute right-0 top-1/2 -translate-y-1/2 text-primary p-2">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[0.65rem] text-outline tracking-widest uppercase italic">© 2026 AGRO-NOIR. TODOS LOS DERECHOS RESERVADOS.</p>
        <div className="flex gap-8 text-[0.65rem] text-outline tracking-widest uppercase italic">
          <Link className="hover:text-on-surface" to="/terminos">Términos y Condiciones</Link>
          <Link className="hover:text-on-surface" to="/privacidad">Política de Privacidad</Link>
        </div>
      </div>
    </footer>
  );
}