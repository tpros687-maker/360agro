import { useEffect, useState, useContext } from "react";
import pedidoApi from "../api/pedidoApi";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Skeleton from "../components/Skeleton";

const BASE_URL = "http://localhost:5000";

export default function MisOrdenes() {
    const { usuario } = useContext(AuthContext);
    const [ordenes, setOrdenes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarOrdenes = async () => {
            try {
                const resp = await pedidoApi.obtenerMisPedidos();
                setOrdenes(resp.data);
            } catch (error) {
                console.error("❌ Error cargando tus órdenes:", error);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };

        if (usuario) cargarOrdenes();
    }, [usuario]);

    // Map de Estados de color
    const statusColors = {
        Pendiente: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        Coordinando: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        Completado: "bg-agro-teal/10 text-agro-teal border-agro-teal/20",
        Cancelado: "bg-red-500/10 text-red-500 border-red-500/20",
    };

    if (loading) {
        return (
            <div className="bg-agro-midnight min-h-screen pt-32 px-6">
                <div className="container mx-auto">
                    <Skeleton className="h-16 w-1/3 mb-10" />
                    <div className="grid grid-cols-1 gap-6">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-[2rem]" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-radial from-agro-teal/5 to-transparent pointer-events-none opacity-50"></div>

            <div className="container mx-auto relative z-10">

                <header className="mb-16 border-b border-white/5 pb-10">
                    <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Dashboard Cliente B2C</span>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none mb-4 uppercase">
                        Mis Órdenes de <br /><span className="text-agro-teal not-italic font-black">Compra</span>
                    </h1>
                    <p className="text-agro-cream/40 text-sm font-medium italic">
                        Historial de interacciones comerciales y pedidos generados mediante la plataforma.
                    </p>
                </header>

                {ordenes.length === 0 ? (
                    <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3.5rem] bg-white/[0.01]">
                        <span className="text-6xl mb-6 block opacity-50">🧾</span>
                        <h2 className="text-3xl font-black text-white italic mb-10 uppercase tracking-tighter">No tienes órdenes activas</h2>
                        <Link to="/tiendas" className="btn-emerald py-5 inline-block">
                            🛒 Explorar Tiendas
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {ordenes.map((orden) => (
                            <div key={orden._id} className="card-midnight bg-agro-charcoal border border-white/5 p-8 rounded-[2.5rem] shadow-2xl flex flex-col xl:flex-row gap-10 hover:border-agro-teal/20 transition-all duration-500 group">

                                {/* Meta Datos Orden */}
                                <div className="xl:w-1/4 shrink-0 flex flex-col justify-between border-b xl:border-b-0 xl:border-r border-white/5 pb-8 xl:pb-0 xl:pr-10">
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-agro-cream/40 block mb-1">Cód. Operación</span>
                                        <p className="text-lg font-black text-white uppercase tracking-tighter mb-4">{orden.numeroOrden}</p>

                                        <span className="text-[9px] font-black uppercase tracking-widest text-agro-cream/40 block mb-1">Socio Vendedor</span>
                                        <Link to={`/proveedor/${orden.vendedor.slug}`} className="flex items-center gap-3 mb-6 hover:opacity-75 transition">
                                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center p-1">
                                                <img src={`${BASE_URL}${orden.vendedor.logo}`} alt="Store" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-sm font-bold text-agro-teal uppercase">{orden.vendedor.nombre}</span>
                                        </Link>
                                    </div>

                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-agro-cream/40 block mb-1">Estado del Pedido</span>
                                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center justify-center border ${statusColors[orden.estado]}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse"></span>
                                            {orden.estado}
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="flex-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-agro-cream/40 block mb-4 border-b border-white/5 pb-2">Desglose de Ítems</span>
                                    <div className="space-y-4">
                                        {orden.items.map(item => (
                                            <div key={item._id} className="flex items-center gap-4 group/item">
                                                <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden shrink-0 pointer-events-none">
                                                    <img src={`${BASE_URL}${item.producto.fotoPrincipal}`} className="w-full h-full object-cover grayscale-[40%]" alt="prod" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-black text-white uppercase line-clamp-1">{item.producto.titulo || item.producto.nombre}</h4>
                                                    <p className="text-[10px] text-agro-cream/40 font-bold uppercase tracking-widest mt-1">
                                                        ${item.precioUnitario.toLocaleString()} x {item.cantidad} U.
                                                    </p>
                                                </div>
                                                <div className="text-right whitespace-nowrap">
                                                    <p className="text-sm font-black text-agro-teal italic">${(item.precioUnitario * item.cantidad).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Resumen Logística */}
                                <div className="xl:w-1/4 shrink-0 bg-agro-midnight p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-agro-cream/40 block mb-2">Destino Logístico</span>
                                        <p className="text-xs font-bold text-white mb-1 line-clamp-2">{orden.datosEnvio.direccion}</p>
                                        <p className="text-xs text-agro-cream/60 mb-6">Telf: {orden.datosEnvio.telefono}</p>
                                    </div>

                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-agro-cream/40 block mb-1 border-t border-white/5 pt-4">Inversión Total</span>
                                        <p className="text-3xl font-black text-white text-glow-teal italic tracking-tighter">${orden.total.toLocaleString()}</p>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
