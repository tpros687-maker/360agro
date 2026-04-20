import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo-360agro.png";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import api from "../api/axiosConfig";
import { ssoTo360Finance } from "../api/userApi";
import { toast } from "react-hot-toast";
import BuscadorUniversal from "./BuscadorUniversal";
import ModalConfirmar from "./ModalConfirmar";
import {
  User,
  Mail,
  Diamond,
  LogOut,
  ShoppingCart,
  PlusCircle,
  LayoutDashboard,
  Calculator as CalcIcon,
  Zap
} from "lucide-react";

export default function Navbar() {
  const { usuario, logout } = useContext(AuthContext);
  const { carrito } = useContext(CartContext);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [mobileMenuAbierto, setMobileMenuAbierto] = useState(false);
  const [modalLogoutAbierto, setModalLogoutAbierto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  useEffect(() => {
    setMenuAbierto(false);
    setMobileMenuAbierto(false);
  }, [location]);

  const ejecutarLogout = () => {
    logout();
    setMenuAbierto(false);
    setMobileMenuAbierto(false);
    setModalLogoutAbierto(false);
    navigate("/login");
  };

  const esVendedor = ["productor", "pro", "empresa"].includes(usuario?.plan?.toLowerCase());

  // 🏪 ESTADO DE TIENDA: Verificar si ya tiene perfil fundado
  const [tieneTienda, setTieneTienda] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false); // This state was added but not used in the provided snippet, keeping it as is.
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data);
      } catch (error) {
        console.error("Error al cargar ajustes en Navbar:", error);
      }
    };
    fetchSettings();

    const verificarTienda = async () => {
      if (!usuario) return;
      try {
        const { data } = await api.get("/proveedores/me");
        if (data && !data.noExiste && data.tipoProveedor !== "servicio") setTieneTienda(true);
      } catch (err) {
        setTieneTienda(false);
      }
    };
    verificarTienda();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [usuario]); // Added usuario to dependency array for verificarTienda

  // 🔥 NUEVA LÓGICA DE VISIBILIDAD DE TIENDAS
  // Solo planes específicos pueden crear tiendas
  const planPermiteTienda = ["pro", "empresa"].includes(usuario?.plan?.toLowerCase());

  return (
    <>
      <ModalConfirmar
        abierto={modalLogoutAbierto}
        alCerrar={() => setModalLogoutAbierto(false)}
        alConfirmar={ejecutarLogout}
        titulo="Desconectar Terminal"
        mensaje="¿Está seguro de que desea finalizar su sesión operativa?"
      />

      <nav className="fixed top-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-xl border-b border-outline-variant/30 h-20 px-6">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center active:scale-95 transition-transform">
            <img 
              src={logo} 
              alt="360 Agro" 
              className="h-40 w-auto object-contain brightness-75 contrast-125"
            />
          </Link>

          {/* Navigation Links (Center) */}
          <div className="hidden lg:flex items-center gap-8">
            <NavLink to="/lotes" label="Lotes" />
            <NavLink to="/tiendas" label="Tiendas" />
            <NavLink to="/servicios" label="Servicios" />
          </div>

          {/* Actions & Profile (Right) */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block w-64 mr-4">
              <BuscadorUniversal />
            </div>

            <div className="flex items-center gap-2">
              <Link to="/mensajes" className="p-2 hover:bg-background rounded-full transition-colors text-primary relative">
                <span className="material-symbols-outlined">notifications</span>
              </Link>
              <Link to="/carrito" className="p-2 hover:bg-background rounded-full transition-colors text-primary relative">
                <span className="material-symbols-outlined">shopping_cart</span>
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Hamburger (mobile only) */}
            <button
              onClick={() => setMobileMenuAbierto(!mobileMenuAbierto)}
              className="lg:hidden p-2 hover:bg-background rounded-full transition-colors text-primary"
            >
              <span className="material-symbols-outlined">
                {mobileMenuAbierto ? "close" : "menu"}
              </span>
            </button>

            {/* Profile */}
            {!usuario ? (
              <Link to="/login" className="hidden lg:inline-flex bg-primary text-white px-6 py-2.5 rounded-full font-bold text-xs tracking-widest hover:scale-105 transition-transform uppercase">
                Ingresar
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setMenuAbierto(!menuAbierto)}
                  className="flex items-center gap-3 p-1 rounded-full border border-outline-variant/30 hover:bg-background transition-colors"
                >
                  <img
                    src={usuario.foto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                    alt={usuario.nombre}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="material-symbols-outlined text-sm text-primary">expand_more</span>
                </button>

                {menuAbierto && (
                  <div className="absolute top-12 right-0 w-56 bg-white border border-outline-variant/40 rounded-2xl shadow-xl py-2 z-[110] animate-in fade-in slide-in-from-top-2">
                    <div className="px-5 py-3 border-b border-outline-variant/10">
                      <p className="text-xs font-bold text-primary uppercase">{usuario.nombre}</p>
                      <p className="text-[10px] text-outline truncate">{usuario.email}</p>
                    </div>

                    <div className="py-2">
                      <DropdownLink to="/perfil" icon="person" label="Perfil" />
                      <DropdownLink to="/mensajes" icon="mail" label="Mensajes" />
                      <DropdownLink to="/planes" icon="diamond" label="Planes" />
                      {usuario?.plan === "empresa" && (
                        <button
                          onClick={async () => {
                            try {
                              const { data } = await ssoTo360Finance();
                              window.open(`${import.meta.env.VITE_FINANCE_URL}/sso?token=${data.ssoToken}`, "_blank");
                            } catch {
                              toast.error("Error al acceder a 360 Finance");
                            }
                          }}
                          className="flex items-center gap-3 px-5 py-2.5 text-[11px] font-bold text-outline hover:text-primary hover:bg-background transition-all uppercase tracking-wider w-full text-left"
                        >
                          <span className="material-symbols-outlined text-sm">monitoring</span>
                          360 Finance
                        </button>
                      )}
                      {usuario?.tipoUsuario === 'admin' && (
                        <DropdownLink to="/admin/dashboard" icon="terminal" label="Mission Control" />
                      )}
                      {esVendedor && <DropdownLink to="/panel-vendedor" icon="dashboard" label="Panel" />}
                      <DropdownLink to="/publicar" icon="add_circle" label="Publicar" />
                    </div>

                    <div className="px-2 pt-2 border-t border-outline-variant/10">
                      <button
                        onClick={() => setModalLogoutAbierto(true)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-error hover:bg-red-50 rounded-xl transition-colors font-bold text-[10px] uppercase italic"
                      >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {mobileMenuAbierto && (
        <div className="lg:hidden fixed top-20 left-0 w-full z-[99] bg-white border-b border-outline-variant/30 shadow-lg max-h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            <BuscadorUniversal />

            <div className="flex flex-col gap-2">
              <NavLink to="/lotes" label="Lotes" />
              <NavLink to="/tiendas" label="Tiendas" />
              <NavLink to="/servicios" label="Servicios" />
            </div>

            {usuario ? (
              <div className="flex flex-col gap-1 border-t border-outline-variant/20 pt-4">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest px-2 mb-2">{usuario.nombre}</p>
                <DropdownLink to="/perfil" icon="person" label="Perfil" />
                <DropdownLink to="/mensajes" icon="mail" label="Mensajes" />
                <DropdownLink to="/planes" icon="diamond" label="Planes" />
                {esVendedor && <DropdownLink to="/panel-vendedor" icon="dashboard" label="Panel" />}
                <DropdownLink to="/publicar" icon="add_circle" label="Publicar" />
                {usuario?.tipoUsuario === "admin" && (
                  <DropdownLink to="/admin/dashboard" icon="terminal" label="Mission Control" />
                )}
                <button
                  onClick={() => setModalLogoutAbierto(true)}
                  className="flex items-center gap-3 px-5 py-2.5 text-[11px] font-bold text-error hover:bg-red-50 rounded-xl transition-colors uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 border-t border-outline-variant/20 pt-4">
                <Link to="/login" className="bg-primary text-white px-6 py-3 rounded-full font-bold text-xs tracking-widest hover:scale-105 transition-transform uppercase text-center">
                  Ingresar
                </Link>
                <Link to="/register" className="border border-primary text-primary px-6 py-3 rounded-full font-bold text-xs tracking-widest uppercase text-center hover:bg-primary/5 transition-colors">
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Subcomponents
function NavLink({ to, label }) {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <Link
      to={to}
      className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
        isActive
          ? 'bg-primary text-white border-primary'
          : 'border-outline-variant/60 text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5'
      }`}
    >
      {label}
    </Link>
  );
}

function DropdownLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-5 py-2.5 text-[11px] font-bold text-on-surface hover:text-primary hover:bg-primary/5 transition-all uppercase tracking-wider"
    >
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </Link>
  );
}
