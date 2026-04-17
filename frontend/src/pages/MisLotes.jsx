import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CardSkeleton } from "../components/Skeleton";
import API from "../api/axiosConfig";
import { BASE_URL, imgUrl } from "../api/axiosConfig";
import { toast } from "react-hot-toast";
import ModalConfirmar from "../components/ModalConfirmar"; // 1. Importación clave

export default function MisLotes() {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Estados para el control del Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [idABorrar, setIdABorrar] = useState(null);

  // Modal de venta
  const [modalVenta, setModalVenta] = useState(false);
  const [loteAVender, setLoteAVender] = useState(null);
  const [precioVenta, setPrecioVenta] = useState("");
  const [fechaVenta, setFechaVenta] = useState(new Date().toISOString().split("T")[0]);

  const fetchMisLotes = async () => {
    try {
      const res = await API.get("/lots/mis-lotes");
      setLotes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error("Error al sincronizar inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisLotes();
  }, []);

  // 3. Función que dispara el Modal
  const prepararEliminacion = (id) => {
    setIdABorrar(id);
    setModalAbierto(true);
  };

  const confirmarVenta = async () => {
    try {
      await API.put(`/lots/${loteAVender._id}`, { estado: "Vendido", precioVenta, fechaVenta });
      await API.post("/expenses", {
        tipo: "ingreso",
        descripcion: `Venta de lote: ${loteAVender.titulo}`,
        categoria: "Venta de Ganado",
        monto: parseFloat(precioVenta),
        fecha: fechaVenta,
        estado: "Pagado"
      });
      setLotes((prev) => prev.map((l) => l._id === loteAVender._id ? { ...l, estado: "Vendido" } : l));
      toast.success("Lote vendido registrado");
      setModalVenta(false);
      setLoteAVender(null);
    } catch (error) {
      toast.error("Error al registrar la venta");
    }
  };

  const confirmarEliminarLote = async () => {
    try {
      await API.delete(`/lots/${idABorrar}`);
      setLotes((prev) => prev.filter((l) => l._id !== idABorrar));
      toast.success("LOTE RETIRADO DEL MERCADO");
    } catch (error) {
      toast.error("No se pudo procesar la eliminación");
    } finally {
      setModalAbierto(false);
      setIdABorrar(null);
    }
  };

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">

      {/* 5. Inserción del Componente Modal */}
      <ModalConfirmar
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alConfirmar={confirmarEliminarLote}
        titulo="Retirar Activo"
        mensaje="¿Está seguro de que desea retirar este lote del mercado élite? Esta operación es irreversible y el activo dejará de ser visible para los compradores."
      />

      {/* Modal de confirmación de venta */}
      {modalVenta && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-surface-container-high border border-outline-variant/20 rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black text-on-surface italic uppercase tracking-tighter mb-2">Registrar Venta</h3>
            <p className="text-on-surface-variant/30 text-[10px] font-black uppercase tracking-widest mb-8 truncate">{loteAVender?.titulo}</p>

            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Precio de venta (USD)</label>
                <input
                  type="number"
                  value={precioVenta}
                  onChange={(e) => setPrecioVenta(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-5 py-4 text-on-surface font-bold outline-none focus:border-primary/40 transition-all"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Fecha de venta</label>
                <input
                  type="date"
                  value={fechaVenta}
                  onChange={(e) => setFechaVenta(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-5 py-4 text-on-surface font-bold outline-none focus:border-primary/40 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setModalVenta(false)}
                className="flex-1 py-4 bg-surface-container text-on-surface-variant/40 hover:bg-surface-container-high rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarVenta}
                className="flex-1 py-4 machined-gradient text-on-tertiary-fixed font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">sell</span> Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px] pointer-events-none -mr-32 -mt-32"></div>

      <header className="container mx-auto mb-20 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Gestión de Inventario</span>
            <h1 className="text-5xl md:text-7xl font-black text-on-surface italic tracking-tighter leading-none">
              MIS <span className="text-primary not-italic font-black">LOTES</span>
            </h1>
          </div>
          <Link to="/publicar" className="machined-gradient text-on-tertiary-fixed px-8 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 italic">
            <span className="material-symbols-outlined text-sm">add</span> PUBLICAR NUEVO LOTE <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : lotes.length === 0 ? (
          <div className="text-center py-40 bg-surface-container-high/20 border-2 border-dashed border-outline-variant/20 rounded-[3rem]">
            <p className="text-on-surface-variant/10 text-2xl font-black uppercase tracking-[0.5em] italic mb-10">Portafolio Vacío</p>
            <Link to="/publicar" className="text-primary font-black uppercase tracking-[0.3em] border-b border-primary/20 pb-2 hover:text-on-surface transition-colors">
              INICIAR PRIMERA PUBLICACIÓN <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {lotes.map((lote) => (
              <div
                key={lote._id}
                className={`group bg-surface-container-high border rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-700 shadow-2xl relative ${
                    lote.destacado ? "border-primary/30" : "border-outline-variant/20"
                }`}
              >
                {/* Badge de Destacado o Estado */}
                <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
                    {lote.destacado && (
                        <span className="bg-primary text-on-tertiary-fixed text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">star</span> DESTACADO
                        </span>
                    )}
                    <span className={`text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                      lote.estado === "Vendido" ? "bg-red-500/80 text-white" :
                      lote.estado === "Reservado" ? "bg-yellow-500/80 text-black" :
                      "bg-emerald-500/80 text-white"
                    }`}>
                      {lote.estado || "Disponible"}
                    </span>
                </div>

                {/* Imagen */}
                <div className="h-64 overflow-hidden relative">
                  <img
                    src={imgUrl(lote.fotos?.[0], "https://images.unsplash.com/photo-1545153996-e13f63438330?q=80&w=2071")}
                    alt={lote.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-[2s]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent"></div>
                </div>

                {/* Info */}
                <div className="p-10 flex flex-col flex-1">
                  <h2 className="text-2xl font-black text-on-surface italic tracking-tighter mb-4 group-hover:text-primary transition-colors duration-500 uppercase leading-none truncate">
                    {lote.titulo}
                  </h2>

                  <div className="space-y-4 mb-10">
                    <div className="flex items-center justify-between text-xs border-b border-outline-variant/20 pb-2">
                      <span className="text-on-surface-variant/20 font-black uppercase tracking-widest text-[9px]">Valoración</span>
                      <span className="text-on-surface font-black italic text-lg tracking-tighter">
                        USD {lote.precio?.toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="text-center">
                        <p className="text-on-surface font-black text-base">{lote.estadisticas?.visitas ?? 0}</p>
                        <p className="text-on-surface-variant/20 font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-xs">visibility</span> Visitas
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-on-surface font-black text-base">{lote.estadisticas?.whatsapp ?? 0}</p>
                        <p className="text-on-surface-variant/20 font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-xs">chat</span> WhatsApp
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-on-surface font-black text-base">{lote.estadisticas?.contactos ?? 0}</p>
                        <p className="text-on-surface-variant/20 font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-1">
                          <span className="material-symbols-outlined text-xs">mail</span> Contactos
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BOTONES */}
                  <div className="mt-auto flex gap-4 pt-8 border-t border-outline-variant/20">
                    <Link
                      to={`/editar-lote/${lote._id}`}
                      className="flex-1 py-4 bg-surface-container text-on-surface font-black rounded-xl border border-outline-variant/20 hover:bg-primary hover:text-on-tertiary-fixed transition-all text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span> Editar
                    </Link>

                    {lote.estado === "Vendido" ? (
                      <span className="px-5 py-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] uppercase tracking-widest font-black flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check_circle</span> Vendido
                      </span>
                    ) : (
                      <button
                        onClick={() => { setLoteAVender(lote); setPrecioVenta(lote.precio); setModalVenta(true); }}
                        className="px-5 py-4 bg-emerald-900/10 text-emerald-500/60 hover:bg-emerald-500 hover:text-white transition-all rounded-xl border border-emerald-900/20 text-[10px] uppercase tracking-widest font-black"
                      >
                        <span className="material-symbols-outlined text-sm">sell</span>
                      </button>
                    )}

                    <button
                      onClick={() => prepararEliminacion(lote._id)}
                      className="px-6 py-4 bg-red-900/10 text-red-500/40 hover:bg-red-500 hover:text-white transition-all rounded-xl border border-red-900/20 text-[10px] uppercase tracking-widest font-black"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
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
