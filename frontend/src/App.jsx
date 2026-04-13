import { Routes, Route, Navigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import api from "./api/axiosConfig";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import AgroIA from "./components/AgroIA";
import BannerCookies from "./components/BannerCookies";

// Páginas generales
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerificarEmail from "./pages/VerificarEmail";
import Explorar from "./pages/Explorar";
import Publicar from "./pages/Publicar";

// LOTES
import Lotes from "./pages/Lotes";
import MisLotes from "./pages/MisLotes";
import CrearLote from "./pages/CrearLote";
import LoteDetalle from "./pages/LoteDetalle";
import EditarLote from "./pages/EditarLote";

// USUARIO
import Perfil from "./pages/Perfil";
import Planes from "./pages/Planes";
import TerminosCondiciones from "./pages/TerminosCondiciones";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
// MENSAJERÍA
import Mensajes from "./pages/Mensajes";
import Chat from "./pages/Chat";

// TIENDAS
import Tiendas from "./pages/Tiendas";
import TiendaPublica from "./pages/TiendaPublica";
import CrearTienda from "./pages/CrearTienda";
import MiTienda from "./pages/MiTienda";
import EditarTienda from "./pages/EditarTienda";
import Carrito from "./pages/Carrito";
import MisOrdenes from "./pages/MisOrdenes";

// SERVICIOS
import Servicios from "./pages/Servicios";
import ServicioDetalle from "./pages/ServicioDetalle";
import CrearServicio from "./pages/CrearServicio";
import EditarServicio from "./pages/EditarServicio";

// PRODUCTOS
import CrearProducto from "./pages/CrearProducto";
import EditarProducto from "./pages/EditarProducto";
import ProductoDetalle from "./pages/ProductoDetalle";

// PANEL DE VENDEDOR
import PanelProveedor from "./pages/PanelProveedor";

// PROTECCIÓN
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdmin from "./components/ProtectedAdmin";

// ADMIN
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const { usuario, loadingAuth } = useContext(AuthContext);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data);

        // Inyección dinámica de colores
        if (data.theme_primary) {
          document.documentElement.style.setProperty('--primary', data.theme_primary);
        }
        if (data.theme_secondary) {
          document.documentElement.style.setProperty('--primary-container', data.theme_secondary);
        }
      } catch (error) {
        console.error("Error al cargar temas dinámicos:", error);
      }
    };
    fetchSettings();
  }, []);

  if (loadingAuth) return (
    <div className="bg-background min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary shadow-[0_0_20px_rgba(63,111,118,0.4)]"></div>
    </div>
  );

  const ES_VENDEDOR = ["productor", "pro", "empresa"].includes(usuario?.plan?.toLowerCase());


  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface font-body">
      <Toaster position="top-right" />
      <Navbar />

      <main className="flex-1 pt-0">
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verificar-email" element={<VerificarEmail />} />
          <Route path="/explorar" element={<Explorar />} />
          <Route path="/tiendas" element={<Tiendas />} />
          <Route path="/tienda/:slug" element={<TiendaPublica />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/servicio/:id" element={<ServicioDetalle />} />
          <Route path="/lotes" element={<Lotes />} />
          <Route path="/lotes/:id" element={<LoteDetalle />} />
          <Route path="/planes" element={<Planes />} />
          <Route path="/terminos" element={<TerminosCondiciones />} />
          <Route path="/privacidad" element={<PoliticaPrivacidad />} />

          {/* --- RUTAS PROTEGIDAS (Cualquier usuario logueado) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/mensajes" element={<Mensajes />} />
            <Route path="/mensajes/:referenciaId/:otroUsuarioId" element={<Chat />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/mis-ordenes" element={<MisOrdenes />} />
            <Route path="/publicar" element={<Publicar />} />


            {/* RUTAS DE VENDEDOR (Anidadas por lógica de plan) */}
            {ES_VENDEDOR ? (
              <>
                <Route path="/panel-vendedor" element={<PanelProveedor />} />
                <Route path="/mis-lotes" element={<MisLotes />} />
                <Route path="/crear-lote" element={<CrearLote />} />
                <Route path="/editar-lote/:id" element={<EditarLote />} />
                <Route path="/mi-tienda" element={<MiTienda />} />
                <Route path="/crear-tienda" element={<CrearTienda />} />
                <Route path="/editar-tienda/:id" element={<EditarTienda />} />
                <Route path="/crear-producto" element={<CrearProducto />} />
                <Route path="/editar-producto/:id" element={<EditarProducto />} />
                <Route path="/crear-servicio" element={<CrearServicio />} />
                <Route path="/editar-servicio/:id" element={<EditarServicio />} />
              </>
            ) : (
              <Route path="/panel-vendedor/*" element={<Navigate to="/planes" />} />
            )}
            {/* RUTAS DE ADMINISTRACIÓN */}
            <Route element={<ProtectedAdmin />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <AgroIA />
      <BannerCookies />
      <Footer />
    </div>
  );
}