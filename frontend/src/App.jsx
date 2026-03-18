import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";
import AgroIA from "./components/AgroIA";

// Páginas generales
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
import MisServicios from "./pages/MisServicios";
import EditarServicio from "./pages/EditarServicio";

// PRODUCTOS
import CrearProducto from "./pages/CrearProducto";
import EditarProducto from "./pages/EditarProducto";
import ProductoDetalle from "./pages/ProductoDetalle";

// PANEL DE VENDEDOR
import PanelProveedor from "./pages/PanelProveedor";

// PROTECCIÓN
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { usuario, loadingAuth } = useContext(AuthContext);

  if (loadingAuth) return (
    <div className="bg-agro-midnight min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-agro-teal shadow-teal-glow"></div>
    </div>
  );

  // Lista de planes que pueden vender (Sincronizado con Navbar)
  const ES_VENDEDOR = ["empresa", "bronce", "plata", "oro", "pro"].includes(usuario?.plan?.toLowerCase());

  return (
    <div className="flex flex-col min-h-screen bg-agro-midnight">
      <Toaster position="top-right" />
      <Navbar />

      <main className="flex-1 pt-0">
        <Routes>
          {/* --- RUTAS PÚBLICAS --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explorar" element={<Explorar />} />
          <Route path="/tiendas" element={<Tiendas />} />
          <Route path="/tienda/:slug" element={<TiendaPublica />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/servicio/:id" element={<ServicioDetalle />} />
          <Route path="/lotes" element={<Lotes />} />
          <Route path="/lotes/:id" element={<LoteDetalle />} />
          <Route path="/planes" element={<Planes />} />

          {/* --- RUTAS PROTEGIDAS (Cualquier usuario logueado) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/mensajes" element={<Mensajes />} />
            <Route path="/mensajes/:referenciaId/:otroUsuarioId" element={<Chat />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/mis-ordenes" element={<MisOrdenes />} />
            <Route path="/publicar" element={<Publicar />} />
          </Route>

          {/* --- RUTAS DE VENDEDOR / PROVEEDOR --- */}
          <Route element={<ProtectedRoute />}>
            {ES_VENDEDOR ? (
              <>
                {/* Panel principal */}
                <Route path="/panel-vendedor" element={<PanelProveedor />} />
                
                {/* Gestión de Lotes */}
                <Route path="/mis-lotes" element={<MisLotes />} />
                <Route path="/crear-lote" element={<CrearLote />} />
                <Route path="/editar-lote/:id" element={<EditarLote />} />

                {/* Gestión de Tienda y Productos */}
                <Route path="/mi-tienda" element={<MiTienda />} />
                <Route path="/crear-tienda" element={<CrearTienda />} />
                <Route path="/editar-tienda" element={<EditarTienda />} />
                <Route path="/crear-producto" element={<CrearProducto />} />
                <Route path="/editar-producto/:id" element={<EditarProducto />} />

                {/* Gestión de Servicios */}
                <Route path="/mis-servicios" element={<MisServicios />} />
                <Route path="/crear-servicio" element={<CrearServicio />} />
                <Route path="/editar-servicio/:id" element={<EditarServicio />} />
              </>
            ) : (
              /* Si no tiene plan vendedor, cualquier intento lo manda a contratar uno */
              <Route path="/panel-vendedor/*" element={<Navigate to="/planes" />} />
            )}
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <AgroIA />
      <Footer />
    </div>
  );
}