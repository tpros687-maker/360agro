import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { BASE_URL } from "../api/axiosConfig";
import ModalConfirmar from "../components/ModalConfirmar";

export default function Carrito() {
  const { carrito, eliminarDelCarrito, modificarCantidad, subtotal, vaciarCarrito } = useContext(CartContext);
  const [modalVaciarAbierto, setModalVaciarAbierto] = useState(false);

  const enviarPedidoWhatsApp = (tiendaNombre, whatsapp, productosTienda) => {
    const saludo = `*ORDEN DE COMPRA - 360 AGRO*%0A%0A`;
    const detalles = productosTienda.map(item =>
      `• *${item.cantidad}x* ${item.titulo} _(Ref: USD ${item.precio})_`
    ).join("%0A");

    const totalTienda = productosTienda.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const mensaje = `${saludo}Hola *${tiendaNombre}*, solicito cotización y disponibilidad de los siguientes activos:%0A%0A${detalles}%0A%0A*VALOR ESTIMADO: USD ${totalTienda.toLocaleString()}*%0A%0A_Generado vía Red 360 Agro_`;

    const telSaneado = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${telSaneado}?text=${mensaje}`, '_blank');
  };

  const agrupadoPorTienda = carrito.reduce((groups, item) => {
    const nombreTienda = item.tienda?.nombre || "Vendedor Independiente";
    if (!groups[nombreTienda]) {
      groups[nombreTienda] = {
        nombre: nombreTienda,
        whatsapp: item.tienda?.whatsapp || "",
        items: []
      };
    }
    groups[nombreTienda].items.push(item);
    return groups;
  }, {});

  if (carrito.length === 0) {
    return (
      <div className="bg-background min-h-screen pt-40 flex flex-col items-center px-6">
        <div className="mb-12 opacity-5 grayscale"><span className="material-symbols-outlined text-9xl">shopping_cart</span></div>
        <h2 className="text-4xl md:text-5xl font-black text-on-surface italic uppercase tracking-tighter mb-8 text-center leading-none animate-reveal">
          TU SOLICITUD DE ACTIVOS<br /><span className="text-primary">ESTÁ VACÍA</span>
        </h2>
        <Link to="/tiendas" className="bg-primary text-white px-10 py-4 rounded-full font-black uppercase tracking-[0.3em] text-[10px] shadow-xl hover:scale-105 transition-all">
          EXPLORAR TIENDAS <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <ModalConfirmar
        abierto={modalVaciarAbierto}
        alCerrar={() => setModalVaciarAbierto(false)}
        alConfirmar={() => {
          vaciarCarrito();
          setModalVaciarAbierto(false);
        }}
        titulo="VACIAR INVENTARIO"
        mensaje="¿Está seguro de que desea remover todos los activos del carrito? Esta acción limpiará su selección actual de todas las tiendas."
      />

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[180px] -mr-40 -mt-40"></div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-end mb-8 gap-8 border-b border-outline-variant/70 pb-8">
          <div>
            <span className="text-primary font-black text-[10px] uppercase tracking-[0.6em] mb-4 block italic">Gestión de Adquisiciones</span>
            <h1 className="text-4xl md:text-5xl font-black text-on-surface italic tracking-tighter uppercase leading-none">MI <span className="text-primary">CARRITO</span></h1>
          </div>
          <button
            onClick={() => setModalVaciarAbierto(true)}
            className="text-[9px] font-black text-red-500/40 hover:text-red-500 uppercase tracking-[0.3em] transition-all border border-red-500/10 hover:border-red-500/30 px-6 py-3 rounded-xl"
          >
            Vaciar Inventario
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            {Object.keys(agrupadoPorTienda).map((tiendaKey) => (
              <div key={tiendaKey} className="bg-surface-container-high border border-outline-variant/70 rounded-[3rem] p-10 md:p-14 shadow-xl backdrop-blur-sm animate-reveal">
                <div className="flex items-center justify-between mb-12 border-b border-outline-variant/70 pb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-3 h-3 rounded-full bg-primary shadow-xl"></div>
                    <h3 className="text-2xl font-black text-on-surface uppercase italic tracking-tighter">
                      {agrupadoPorTienda[tiendaKey].nombre}
                    </h3>
                  </div>
                </div>

                <div className="space-y-6">
                  {agrupadoPorTienda[tiendaKey].items.map((item) => (
                    <div key={item._id} className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-8 group">
                      <div className="w-24 h-24 rounded-2xl bg-background overflow-hidden border border-outline-variant/70 shrink-0 shadow-lg">
                        <img
                          src={item.fotoPrincipal ? `${BASE_URL}${item.fotoPrincipal}` : (item.fotos?.[0] ? `${BASE_URL}${item.fotos[0]}` : "/placeholder.png")}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-on-surface font-black uppercase text-base italic tracking-tight leading-none mb-2">{item.titulo}</h4>
                        <p className="text-primary font-black text-sm tracking-tighter italic">USD {item.precio?.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center bg-background rounded-2xl border border-outline-variant/70 p-1.5 shadow-inner">
                        <button onClick={() => modificarCantidad(item._id, -1)} className="w-10 h-10 text-on-surface-variant/40 hover:text-primary font-black text-xl">-</button>
                        <span className="text-on-surface font-black text-sm px-6 min-w-[50px] text-center italic">{item.cantidad}</span>
                        <button onClick={() => modificarCantidad(item._id, 1)} className="w-10 h-10 text-on-surface-variant/40 hover:text-primary font-black text-xl">+</button>
                      </div>
                      <button onClick={() => eliminarDelCarrito(item._id)} className="text-on-surface-variant/10 hover:text-red-500 transition-all text-xl p-2">✕</button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => enviarPedidoWhatsApp(agrupadoPorTienda[tiendaKey].nombre, agrupadoPorTienda[tiendaKey].whatsapp, agrupadoPorTienda[tiendaKey].items)}
                  className="w-full mt-14 py-6 machined-gradient text-on-tertiary-fixed rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:scale-[1.01] transition-all active:scale-95"
                >
                  Confirmar con {agrupadoPorTienda[tiendaKey].nombre} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-surface-container-high border border-outline-variant/70 rounded-[3rem] p-12 sticky top-32 shadow-2xl">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-12 text-center italic">Liquidación Estimada</h3>
              <div className="border-y border-outline-variant/70 py-12 mb-12">
                <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] mb-4">Monto Total de Operación</p>
                <p className="text-4xl font-black text-on-surface italic tracking-tighter leading-none">USD {subtotal.toLocaleString()}</p>
              </div>
              <div className="space-y-6">
                <p className="text-[10px] text-on-surface-variant/40 font-bold leading-relaxed uppercase italic text-center">
                  * LOS PRECIOS EXPRESADOS SON REFERENCIALES.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}