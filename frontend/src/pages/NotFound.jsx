import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[200px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="relative z-10 text-center max-w-xl">
        <p className="text-[180px] font-black text-primary/20 italic leading-none select-none">404</p>
        <h1 className="text-4xl font-black text-on-surface italic tracking-tighter uppercase mb-4 -mt-6">
          Página no <span className="text-primary not-italic">encontrada</span>
        </h1>
        <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest mb-12">
          La ruta que buscás no existe en el ecosistema 360 Agro
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="machined-gradient px-10 py-5 rounded-full font-black text-on-tertiary-fixed uppercase tracking-[0.4em] text-[10px] hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-sm">home</span> Volver al inicio
          </Link>
          <Link
            to="/explorar"
            className="px-10 py-5 rounded-full font-black text-primary border border-primary/30 uppercase tracking-[0.4em] text-[10px] hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-sm">explore</span> Explorar
          </Link>
        </div>
      </div>
    </div>
  );
}
