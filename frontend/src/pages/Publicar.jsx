import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Publicar() {
  const { usuario } = useContext(AuthContext);

  const ejes = [
    {
      id: "ganado",
      titulo: "Hacienda / Ganado",
      desc: "Venta de lotes certificados, invernada, cría y reproductores.",
      icon: <span className="material-symbols-outlined text-5xl text-primary">pets</span>,
      ruta: "/crear-lote",
      color: "border-primary/40 bg-primary/5"
    },
    {
      id: "servicios",
      titulo: "Servicio Profesional",
      desc: "Asesoría técnica, veterinaria, ingeniería y logística.",
      icon: <span className="material-symbols-outlined text-5xl text-primary">construction</span>,
      ruta: "/crear-servicio",
      color: "border-outline-variant/60"
    }
  ];

  return (
    <div className="bg-background min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
      {/* FX de fondo para consistencia */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] -mr-40 -mt-40 opacity-40"></div>

      <div className="container mx-auto max-w-5xl relative z-10 animate-reveal">
        <header className="mb-8 text-center text-on-surface">
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Terminal de Despacho</span>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
            CENTRAL DE <span className="text-primary not-italic font-black">INDEXACIÓN</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {ejes.map((eje) => (
            <Link 
              to={eje.ruta} 
              key={eje.id}
              className={`group bg-surface-container-high border ${eje.color} p-12 rounded-[2rem] hover:border-primary/50 transition-all duration-500 hover:translate-y-[-5px] shadow-xl flex flex-col items-center text-center backdrop-blur-sm ${!eje.color.includes('border-') ? 'border-outline-variant/60' : ''}`}
            >
              <div className="mb-6 group-hover:scale-110 transition-transform duration-500">{eje.icon}</div>
              <h3 className="text-2xl font-black text-on-surface uppercase italic mb-4 tracking-tighter leading-none">{eje.titulo}</h3>
              <p className="text-[10px] text-on-surface-variant/40 font-black leading-relaxed uppercase tracking-[0.2em]">{eje.desc}</p>
              <div className="mt-8 bg-primary/10 text-primary px-6 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-[9px] font-black tracking-widest uppercase border border-primary/30">Iniciar Registro <span className="material-symbols-outlined text-sm">arrow_forward</span></div>
            </Link>
          ))}
        </div>

        {/* SECCIÓN TIENDAS: solo visible para Pro y Empresa */}
        {["pro", "empresa"].includes(usuario?.plan?.toLowerCase()) && <div className="bg-surface-container-high border border-outline-variant/60 rounded-[2rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl group backdrop-blur-md">
          <div className="max-w-xl text-center md:text-left relative z-10">
            <p className="text-primary font-black text-[9px] uppercase tracking-[0.4em] mb-4 italic">Comercio de Insumos & Inversiones</p>
            <h3 className="text-3xl font-black text-on-surface italic uppercase tracking-tighter mb-4 leading-none">
              GESTIÓN DE <span className="text-primary not-italic font-black">SHOWROOM</span>
            </h3>
            <p className="text-[10px] text-on-surface-variant/30 font-bold uppercase tracking-[0.2em] leading-relaxed italic">
              Para comercializar productos e insumos, debe operar desde una terminal corporativa verificada.
            </p>
          </div>
          
          <Link 
            to="/mi-tienda" // El componente MiTienda ya redirige a /crear-tienda si no existe.
            className="relative z-10 bg-primary text-on-tertiary-fixed px-12 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-on-surface hover:text-white transition-all shadow-xl whitespace-nowrap active:scale-95 italic"
          >
            Administrar Catálogo <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>}
      </div>
    </div>
  );
}