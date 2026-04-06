import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { BASE_URL } from "../api/axiosConfig";
import ModalConfirmar from "../components/ModalConfirmar"; // Inyectamos el guardián

export default function Carrito() {
  const { carrito, eliminarDelCarrito, modificarCantidad, subtotal, vaciarCarrito } = useContext(CartContext);

  // Estado para el Modal de vaciado completo
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
    // 💡 Con la estructura aplanada, item ya contiene los datos del producto y la tienda
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
      <div className="bg-agro-midnight min-h-screen pt-40 flex flex-col items-center px-6">
        <div className="text-9xl mb-12 opacity-5 grayscale">🛒</div>
        <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-8 text-center leading-none animate-reveal">
          TU SOLICITUD DE ACTIVOS<br /><span className="text-agro-teal">ESTÁ VACÍA</span>
        </h2>
        <Link to="/tiendas" className="bg-agro-teal text-agro-midnight px-10 py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:shadow-teal-glow transition-all">
          EXPLORAR TIENDAS ➔
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">

      {/* MODAL DE CONFIRMACIÓN PARA VACIAR TODO */}
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

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-agro-teal/5 blur-[180px] -mr-40 -mt-40"></div>

      <div className="container mx-auto max-w-6xl relative z-10">

        <header className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-b border-white/5 pb-12">
          <div>
            <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.6em] mb-4 block italic">Gestión de Adquisiciones</span>
            <h1 className="text-6xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">MI <span className="text-agro-teal">CARRITO</span></h1>
          </div>

          {/* Botón que ahora abre el Modal */}
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
              <div key={tiendaKey} className="bg-agro-charcoal/20 border border-white/5 rounded-[4rem] p-10 md:p-14 shadow-2xl backdrop-blur-sm animate-reveal">
                <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-3 h-3 rounded-full bg-agro-teal shadow-teal-glow"></div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                      {agrupadoPorTienda[tiendaKey].nombre}
                    </h3>
                  </div>
                </div>

                <div className="space-y-10">
                  {agrupadoPorTienda[tiendaKey].items.map((item) => (
                    <div key={item._id} className="flex flex-col md:flex-row items-center gap-8 group">
                      <div className="w-24 h-24 rounded-[2rem] bg-agro-midnight overflow-hidden border border-white/5 shrink-0 shadow-xl">
                        <img
                          src={item.fotoPrincipal ? `${BASE_URL}${item.fotoPrincipal}` : (item.fotos?.[0] ? `${BASE_URL}${item.fotos[0]}` : "/placeholder.png")}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-white font-black uppercase text-base italic tracking-tight">{item.titulo}</h4>
                        <p className="text-agro-teal font-black text-sm tracking-tighter">USD {item.precio?.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center bg-agro-midnight rounded-2xl border border-white/5 p-1.5">
                        <button onClick={() => modificarCantidad(item._id, -1)} className="w-10 h-10 text-white/40 hover:text-agro-teal font-black text-xl">-</button>
                        <span className="text-white font-black text-sm px-6 min-w-[50px] text-center italic">{item.cantidad}</span>
                        <button onClick={() => modificarCantidad(item._id, 1)} className="w-10 h-10 text-white/40 hover:text-agro-teal font-black text-xl">+</button>
                      </div>
                      <button onClick={() => eliminarDelCarrito(item._id)} className="text-white/5 hover:text-red-500 transition-all text-xl p-2">✕</button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => enviarPedidoWhatsApp(agrupadoPorTienda[tiendaKey].nombre, agrupadoPorTienda[tiendaKey].whatsapp, agrupadoPorTienda[tiendaKey].items)}
                  className="w-full mt-14 py-6 bg-agro-teal text-agro-midnight rounded-3xl font-black text-[10px] uppercase tracking-[0.4em] hover:shadow-teal-glow transition-all active:scale-95"
                >
                  Confirmar con {agrupadoPorTienda[tiendaKey].nombre} ➔
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-agro-charcoal border border-agro-teal/20 rounded-[4rem] p-12 sticky top-32 shadow-2xl">
              <h3 className="text-[10px] font-black text-agro-teal uppercase tracking-[0.5em] mb-12 text-center italic">Liquidación Estimada</h3>
              <div className="border-y border-white/5 py-12 mb-12">
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">Monto Total de Operación</p>
                <p className="text-5xl font-black text-white italic tracking-tighter leading-none">USD {subtotal.toLocaleString()}</p>
              </div>
              <div className="space-y-6">
                <p className="text-[10px] text-agro-cream/20 font-bold leading-relaxed uppercase italic text-center">
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