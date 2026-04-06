import { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import api from "../api/axiosConfig";
import BuscadorUniversal from "./BuscadorUniversal";
import logo from "../assets/logo-360agro.png";
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

  const esVendedor = ["empresa", "basico", "pro", "élite pro", "business"].includes(usuario?.plan?.toLowerCase());
  const esPremium = ["empresa", "pro", "basico", "élite pro"].includes(usuario?.plan?.toLowerCase());

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
        if (data && !data.noExiste) setTieneTienda(true);
      } catch (err) {
        setTieneTienda(false);
      }
    };
    verificarTienda();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [usuario]); // Added usuario to dependency array for verificarTienda

  // 🔥 NUEVA LÓGICA DE VISIBILIDAD DE TIENDAS
  // Solo planes específicos pueden crear tiendas
  const planPermiteTienda = ["basico", "pro", "empresa", "élite pro"].includes(usuario?.plan?.toLowerCase());

  return (
    <>
      <ModalConfirmar
        abierto={modalLogoutAbierto}
        alCerrar={() => setModalLogoutAbierto(false)}
        alConfirmar={ejecutarLogout}
        titulo="Desconectar Terminal"
        mensaje="¿Está seguro de que desea finalizar su sesión operativa?"
      />

      <nav className="fixed top-0 left-0 w-full z-[100] bg-[#001719]/90 backdrop-blur-xl border-b border-outline-variant/10 h-20">
        <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between relative">

          {/* Logo / Branding */}
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 machined-gradient rounded-xl flex items-center justify-center shadow-teal-glow">
              <span className="material-symbols-outlined text-agro-midnight font-bold">hub</span>
            </div>
            <span className="text-2xl font-black italic tracking-tighter text-white uppercase glow-text">
              {settings.navbar_brand || "360AGRO"}
            </span>
          </Link>

          {/* Desktop Navigation (Center Capsule) */}
          <nav className="hidden lg:flex items-center bg-surface-container-high/60 backdrop-blur-md border border-outline-variant/20 rounded-full px-2 py-1.5 shadow-lg">
            <NavLink to="/lotes" icon="analytics" label="Lotes" />
            <NavLink to="/tiendas" icon="store" label="Tiendas" />
            <NavLink to="/servicios" icon="engineering" label="Servicios" />
          </nav>

          {/* Right Section: Actions & Profile */}
          <div className="flex items-center gap-4 lg:gap-6">

            {/* Functional Icons */}
            <div className="flex items-center bg-surface-container-low/40 rounded-full px-2 py-1 gap-1 border border-outline-variant/10">
              <Link to="/mensajes" className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:text-primary transition-colors hover:bg-surface-variant/30">
                <span className="material-symbols-outlined text-xl">notifications</span>
              </Link>
              <Link to="/carrito" className="w-10 h-10 flex items-center justify-center rounded-full text-outline hover:text-primary transition-colors hover:bg-surface-variant/30 relative">
                <span className="material-symbols-outlined text-xl">shopping_cart</span>
                {totalItems > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-primary text-on-primary text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 border border-background">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Profile Dropdown */}
            {!usuario ? (
              <Link to="/login" className="px-6 h-10 flex items-center machined-gradient text-on-tertiary-fixed font-bold rounded-full hover:scale-105 transition-transform text-xs tracking-widest shadow-lg">
                ACCESSO
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setMenuAbierto(!menuAbierto)}
                  className="flex items-center gap-3 bg-surface-container-high/80 hover:bg-surface-container-highest border border-outline-variant/20 rounded-full pl-2 pr-4 py-1.5 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full border border-primary/30 overflow-hidden ring-2 ring-primary/10 shadow-lg shadow-primary/10">
                    <img
                      src={usuario.foto || "https://lh3.googleusercontent.com/aida-public/AB6AXuAVPPZWMvHH6fsnrY9GiTEdau2-hY-AjcIwUH_mpkH4ueslnWrZwHayusY4Mo0iBilr7zMtfo0efja3TYtFxviw9ZYLflAOEx0_vBkSQ7xaCnuorMoLhQehWLW0_Yi98tsrRjJk6mu3fAayQiwszuhkSRZxVPDhoxZ_gJqHn6kt6GvwV2iQCBNRPK-KTdbl7mC1SQT2PKHBrQrBSxN0xEiQD8G4zjLqqXkCpDVImZh_DVrkceqva19J2bZ9OBRcSA0MJn23GoPNCa50"}
                      alt={usuario.nombre}
                      className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all"
                    />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[10px] font-bold text-[#E8E0C8] leading-none mb-0.5 uppercase tracking-tighter">{usuario.nombre?.split(" ")[0]}</p>
                    <p className="text-[8px] text-[#3F6F76] font-black tracking-widest leading-none uppercase italic">{usuario.plan || 'Socio'}</p>
                  </div>
                  <span className={`material-symbols-outlined text-[#E8E0C8] text-sm transition-transform duration-300 ${menuAbierto ? 'rotate-180' : ''}`}>expand_more</span>
                </button>

                {/* Dropdown Menu */}
                {menuAbierto && (
                  <div className="absolute top-14 right-0 w-64 bg-surface-container-high/95 backdrop-blur-2xl border border-outline-variant/20 rounded-[2rem] shadow-2xl py-3 z-[110] animate-in fade-in slide-in-from-top-2">
                    <div className="px-6 py-4 mb-2 border-b border-outline-variant/10">
                      <p className="text-[0.7rem] font-bold text-[#E8E0C8] mb-0.5 uppercase tracking-tighter">{usuario.nombre}</p>
                      <p className="text-[0.6rem] text-outline truncate uppercase tracking-widest">{usuario.email}</p>
                    </div>

                    <div className="px-3 space-y-1">
                      <DropdownLink to="/agro-ledger" icon="account_balance_wallet" label="Agro-Ledger" />
                      <DropdownLink to="/panel-vendedor" icon="dashboard" label="Panel de control" />
                      {usuario?.tipoUsuario === 'admin' && (
                        <DropdownLink to="/admin/dashboard" icon="terminal" label="Mission Control" />
                      )}
                      <DropdownLink to="/perfil" icon="person" label="Perfil" />
                      <DropdownLink to="/publicar" icon="add_circle" label="Nueva publicacion" />
                    </div>

                    <div className="px-6 mt-4 pt-4 border-t border-outline-variant/10">
                      <button
                        onClick={() => setModalLogoutAbierto(true)}
                        className="w-full h-10 flex items-center gap-4 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">power_settings_new</span>
                        <span className="text-[0.7rem] font-bold uppercase tracking-widest italic">Desconectar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

// Subcomponents
function NavLink({ to, icon, label }) {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-2.5 px-6 py-2 rounded-full transition-all group ${isActive
        ? 'bg-primary-container text-on-primary-container shadow-md'
        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
        }`}
    >
      <span className={`material-symbols-outlined text-lg ${isActive ? 'fill-1' : 'group-hover:scale-110 transition-transform'}`}>{icon}</span>
      <span className="text-[0.75rem] font-bold uppercase tracking-[0.15em] italic">{label}</span>
    </Link>
  );
}

function DropdownLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 px-5 py-3 rounded-xl text-on-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all group"
    >
      <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-[0.65rem] font-bold uppercase tracking-widest italic">{label}</span>
    </Link>
  );
}
