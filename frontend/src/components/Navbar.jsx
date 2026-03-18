import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import BuscadorUniversal from "./BuscadorUniversal"; 
import logo from "../assets/logo-360agro.png";
import ModalConfirmar from "./ModalConfirmar";

export default function Navbar() {
  const { usuario, logout } = useContext(AuthContext);
  const { carrito } = useContext(CartContext);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalLogoutAbierto, setModalLogoutAbierto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  useEffect(() => {
    setMenuAbierto(false);
  }, [location]);

  const ejecutarLogout = () => {
    logout();
    setMenuAbierto(false);
    setModalLogoutAbierto(false);
    navigate("/login");
  };

  // ✅ Lista extendida de planes con acceso a herramientas de venta
  const esVendedor = ["empresa", "bronce", "plata", "oro", "pro", "élite pro", "business"].includes(usuario?.plan?.toLowerCase());

  return (
    <>
      <ModalConfirmar 
        abierto={modalLogoutAbierto}
        alCerrar={() => setModalLogoutAbierto(false)}
        alConfirmar={ejecutarLogout}
        titulo="Desconectar Terminal"
        mensaje="¿Está seguro de que desea finalizar su sesión operativa?"
      />

      <nav className="fixed top-0 left-0 w-full z-[100] bg-agro-midnight/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="container mx-auto flex justify-between items-center gap-6">
          
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-2xl p-2 group-hover:border-agro-teal/50 transition-all duration-700">
              <img src={logo} alt="360 Agro" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-black text-white italic tracking-tighter uppercase hidden lg:block">
              360 <span className="text-agro-teal not-italic">AGRO</span>
            </span>
          </Link>

          <div className="flex-1 max-w-xl hidden md:block">
            <BuscadorUniversal />
          </div>

          <div className="flex items-center gap-3 md:gap-8">
            <div className="flex items-center gap-3 md:gap-5">
              
              <Link to="/carrito" className="relative group p-2.5 bg-white/5 rounded-xl border border-white/5 hover:border-agro-teal/30 transition-all">
                <span className="text-xl group-hover:scale-110 transition-transform block">🛒</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-agro-teal text-agro-midnight text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-teal-glow">
                    {totalItems}
                  </span>
                )}
              </Link>

              {!usuario ? (
                <Link to="/login" className="bg-agro-teal text-agro-midnight px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-teal-glow hover:scale-105 transition-all">
                  Acceso ➔
                </Link>
              ) : (
                <div className="relative">
                  <button 
                    onClick={() => setMenuAbierto(!menuAbierto)}
                    className={`flex items-center gap-3 p-1.5 pr-5 rounded-2xl border transition-all duration-500 ${menuAbierto ? 'bg-agro-charcoal border-agro-teal/50 shadow-teal-glow/20' : 'bg-agro-charcoal/40 border-white/5 hover:border-agro-teal/20'}`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-agro-teal text-agro-midnight flex items-center justify-center font-black text-xs shadow-teal-glow-sm">
                      {usuario.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left hidden sm:block">
                      <p className="text-[9px] font-black text-white uppercase tracking-widest leading-none mb-1">
                          {usuario.nombre?.split(" ")[0]}
                      </p>
                      <p className="text-[7px] font-bold text-agro-teal uppercase tracking-widest leading-none italic">
                          Socio {usuario.plan}
                      </p>
                    </div>
                  </button>

                  {menuAbierto && (
                    <div className="absolute right-0 mt-6 w-64 bg-agro-charcoal/95 border border-white/10 rounded-[2.5rem] shadow-2xl p-3 backdrop-blur-3xl animate-in fade-in slide-in-from-top-4 duration-500 z-[110]">
                      <div className="px-5 py-5 border-b border-white/5 mb-3">
                        <p className="text-[8px] font-black text-agro-cream/20 uppercase tracking-[0.3em] mb-2 italic">Terminal de Operaciones</p>
                        <p className="text-white font-black text-[11px] uppercase italic tracking-tighter truncate">{usuario.nombre}</p>
                      </div>
                      
                      <div className="space-y-1">
                          {/* ✅ PANEL DE CONTROL MOVIDO AQUÍ */}
                          {esVendedor && (
                            <Link to="/panel-vendedor" className="flex items-center gap-4 px-5 py-4 text-agro-teal bg-agro-teal/5 border border-agro-teal/10 rounded-2xl mb-2 text-[10px] font-black uppercase tracking-widest">
                                📊 PANEL DE CONTROL
                            </Link>
                          )}

                          <Link to="/perfil" className="flex items-center gap-4 px-5 py-4 text-agro-cream/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest group">
                              <span className="group-hover:scale-125 transition-transform">👤</span> Perfil de Socio
                          </Link>

                          <Link to="/mensajes" className="flex items-center gap-4 px-5 py-4 text-agro-cream/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest group">
                              <span className="group-hover:scale-125 transition-transform">✉️</span> Bandeja de Negocios
                          </Link>

                          <Link to="/publicar" className="flex items-center gap-4 px-5 py-4 text-white bg-white/5 border border-white/5 hover:bg-agro-teal hover:text-agro-midnight rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em]">
                              <span>+</span> Publicar Activo
                          </Link>
                      </div>
                      
                      <button 
                        onClick={() => setModalLogoutAbierto(true)}
                        className="w-full flex items-center gap-4 px-5 py-5 text-red-500/50 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all text-[9px] font-black uppercase tracking-widest mt-4 border-t border-white/5"
                      >
                        🚪 Finalizar Sesión
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}