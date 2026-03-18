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
      icon: "🐂",
      ruta: "/crear-lote",
      color: "border-agro-teal/30 bg-agro-teal/5"
    },
    {
      id: "servicios",
      titulo: "Servicio Profesional",
      desc: "Asesoría técnica, veterinaria, ingeniería y logística.",
      icon: "🛠️",
      ruta: "/crear-servicio",
      color: "border-white/10"
    }
  ];

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-20 px-6 relative overflow-hidden">
      {/* FX de fondo para consistencia Noir */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-agro-teal/5 blur-[150px] -mr-40 -mt-40"></div>

      <div className="container mx-auto max-w-5xl relative z-10 animate-reveal">
        <header className="mb-16 text-center">
          <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Terminal de Despacho</span>
          <h1 className="text-6xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
            CENTRAL DE <span className="text-agro-teal not-italic font-black">INDEXACIÓN</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {ejes.map((eje) => (
            <Link 
              to={eje.ruta} 
              key={eje.id}
              className={`group bg-agro-charcoal/40 border ${eje.color} p-12 rounded-[3.5rem] hover:border-agro-teal/50 transition-all duration-500 hover:translate-y-[-5px] shadow-2xl flex flex-col items-center text-center backdrop-blur-sm`}
            >
              <div className="text-7xl mb-6 group-hover:scale-110 transition-transform duration-500">{eje.icon}</div>
              <h3 className="text-2xl font-black text-white uppercase italic mb-4 tracking-tighter leading-none">{eje.titulo}</h3>
              <p className="text-[10px] text-agro-cream/40 font-black leading-relaxed uppercase tracking-[0.2em]">{eje.desc}</p>
              <div className="mt-8 bg-agro-teal/10 text-agro-teal px-6 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-[9px] font-black tracking-widest uppercase border border-agro-teal/20">Iniciar Registro ➔</div>
            </Link>
          ))}
        </div>

        {/* SECCIÓN TIENDAS: EL MALL VIRTUAL */}
        <div className="bg-agro-charcoal/60 border border-white/5 rounded-[3.5rem] p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl group backdrop-blur-md">
          <div className="absolute -right-10 -bottom-10 text-9xl opacity-5 group-hover:rotate-12 transition-transform duration-1000">🏪</div>
          
          <div className="max-w-xl text-center md:text-left relative z-10">
            <p className="text-agro-teal font-black text-[9px] uppercase tracking-[0.4em] mb-4 italic">Comercio de Insumos & Inversiones</p>
            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
              GESTIÓN DE <span className="text-agro-teal not-italic font-black">SHOWROOM</span>
            </h3>
            <p className="text-[10px] text-agro-cream/30 font-bold uppercase tracking-[0.2em] leading-relaxed italic">
              Para comercializar productos e insumos, debe operar desde una terminal corporativa verificada.
            </p>
          </div>
          
          <Link 
            to="/mi-tienda" // El componente MiTienda ya redirige a /crear-tienda si no existe.
            className="relative z-10 bg-agro-teal text-agro-midnight px-12 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-white transition-all shadow-teal-glow whitespace-nowrap active:scale-95"
          >
            Administrar Catálogo ➔
          </Link>
        </div>
      </div>
    </div>
  );
}