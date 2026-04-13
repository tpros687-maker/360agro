import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { toast } from "react-hot-toast";
import {
  TrendingUp, TrendingDown, PlusCircle, Trash2,
  BookOpen, DollarSign, BarChart2, Filter
} from "lucide-react";

const CATEGORIAS_INGRESO = ["Venta de Granos", "Venta de Ganado", "Servicios", "Subsidio", "Otro"];
const CATEGORIAS_EGRESO = ["Insumos", "Maquinaria", "Mano de Obra", "Flete", "Impuestos", "Otro"];

const TIPO_COLORS = {
  ingreso: "text-emerald-400",
  egreso: "text-rose-400",
};

export default function AgroLedger() {
  const { usuario } = useContext(AuthContext);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({
    tipo: "ingreso",
    monto: "",
    descripcion: "",
    categoria: CATEGORIAS_INGRESO[0],
    fecha: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const cargarMovimientos = async () => {
    try {
      const { data } = await api.get("/expenses");
      setMovimientos(data);
    } catch {
      // Si el endpoint no existe aún, usamos datos locales del localStorage
      const guardados = localStorage.getItem(`ledger_${usuario?._id}`);
      setMovimientos(guardados ? JSON.parse(guardados) : []);
    } finally {
      setLoading(false);
    }
  };

  const guardarLocal = (lista) => {
    localStorage.setItem(`ledger_${usuario?._id}`, JSON.stringify(lista));
  };

  const agregarMovimiento = async () => {
    if (!form.monto || isNaN(Number(form.monto)) || Number(form.monto) <= 0) {
      toast.error("Ingrese un monto válido.");
      return;
    }
    if (!form.descripcion.trim()) {
      toast.error("Ingrese una descripción.");
      return;
    }

    const nuevo = {
      ...form,
      monto: parseFloat(form.monto),
      id: Date.now().toString(),
      creadoEn: new Date().toISOString(),
    };

    const payload = {
      fecha: form.fecha,
      categoria: form.categoria,
      descripcion: form.descripcion,
      monto: parseFloat(form.monto),
      estado: "Pagado",
    };

    try {
      await api.post("/expenses", payload);
      await cargarMovimientos();
    } catch {
      const actualizado = [nuevo, ...movimientos];
      setMovimientos(actualizado);
      guardarLocal(actualizado);
    }

    toast.success("Movimiento registrado.");
    setForm({
      tipo: "ingreso",
      monto: "",
      descripcion: "",
      categoria: CATEGORIAS_INGRESO[0],
      fecha: new Date().toISOString().split("T")[0],
    });
    setMostrarForm(false);
  };

  const eliminarMovimiento = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      await cargarMovimientos();
    } catch {
      const actualizado = movimientos.filter((m) => m.id !== id && m._id !== id);
      setMovimientos(actualizado);
      guardarLocal(actualizado);
    }
    toast.success("Movimiento eliminado.");
  };

  const movimientosFiltrados = movimientos.filter((m) =>
    filtro === "todos" ? true : m.tipo === filtro
  );

  const totalIngresos = movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((acc, m) => acc + m.monto, 0);

  const totalEgresos = movimientos
    .filter((m) => m.tipo === "egreso")
    .reduce((acc, m) => acc + m.monto, 0);

  const balance = totalIngresos - totalEgresos;

  const fmt = (n) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6">
      <div className="container mx-auto max-w-5xl">

        {/* Header */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="text-primary font-black text-[10px] uppercase tracking-[0.8em] block mb-3 italic">
              Herramienta Premium
            </span>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter text-on-surface leading-none">
              Agro <span className="text-primary">Ledger</span>
            </h1>
            <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest mt-4 italic">
              Registro financiero de su operación agrícola
            </p>
          </div>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="machined-gradient text-on-tertiary-fixed px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl border border-primary/20 self-start md:self-auto"
          >
            <PlusCircle className="w-5 h-5" />
            Nuevo Movimiento
          </button>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Ingresos Totales", valor: totalIngresos, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
            { label: "Egresos Totales", valor: totalEgresos, icon: TrendingDown, color: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/20" },
            { label: "Balance Neto", valor: balance, icon: BarChart2, color: balance >= 0 ? "text-primary" : "text-rose-400", bg: "bg-surface-container border-outline-variant/20" },
          ].map((kpi) => (
            <div key={kpi.label} className={`rounded-[2.5rem] border p-8 ${kpi.bg} flex items-center gap-6`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-surface-container-high`}>
                <kpi.icon className={`w-7 h-7 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant italic mb-1">{kpi.label}</p>
                <p className={`text-3xl font-black italic tracking-tighter ${kpi.color}`}>{fmt(kpi.valor)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Formulario */}
        {mostrarForm && (
          <div className="bg-surface-container border border-outline-variant/20 rounded-[2.5rem] p-10 mb-12 animate-in slide-in-from-top-4 duration-500">
            <h2 className="font-black text-sm uppercase tracking-[0.5em] italic text-on-surface mb-8 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary" />
              Registrar Movimiento
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipo */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant italic block mb-3">Tipo</label>
                <div className="flex gap-3">
                  {["ingreso", "egreso"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({
                        ...form,
                        tipo: t,
                        categoria: t === "ingreso" ? CATEGORIAS_INGRESO[0] : CATEGORIAS_EGRESO[0],
                      })}
                      className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border
                        ${form.tipo === t
                          ? t === "ingreso"
                            ? "bg-emerald-400/20 text-emerald-400 border-emerald-400/40"
                            : "bg-rose-400/20 text-rose-400 border-rose-400/40"
                          : "bg-surface-container-high text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/50"
                        }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monto */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant italic block mb-3">Monto (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.monto}
                    onChange={(e) => setForm({ ...form, monto: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl pl-10 pr-5 py-4 text-on-surface text-sm font-bold outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant italic block mb-3">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface text-sm font-bold outline-none focus:border-primary/50 transition-all"
                >
                  {(form.tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_EGRESO).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant italic block mb-3">Fecha</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface text-sm font-bold outline-none focus:border-primary/50 transition-all"
                />
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-on-surface-variant italic block mb-3">Descripción</label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Detalle del movimiento..."
                  className="w-full bg-surface-container-high border border-outline-variant/20 rounded-2xl px-5 py-4 text-on-surface text-sm font-bold outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={agregarMovimiento}
                className="machined-gradient text-on-tertiary-fixed px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-xl border border-primary/20"
              >
                Guardar
              </button>
              <button
                onClick={() => setMostrarForm(false)}
                className="bg-surface-container-high text-on-surface-variant px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all border border-outline-variant/20"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex items-center gap-4 mb-8">
          <Filter className="w-4 h-4 text-on-surface-variant" />
          {["todos", "ingreso", "egreso"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border
                ${filtro === f
                  ? "machined-gradient text-on-tertiary-fixed border-primary/20"
                  : "bg-surface-container text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/50"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Lista de movimientos */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
            </div>
          ) : movimientosFiltrados.length === 0 ? (
            <div className="text-center py-24 border border-outline-variant/10 rounded-[2.5rem] bg-surface-container">
              <BookOpen className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-6" />
              <p className="text-on-surface-variant font-black text-[10px] uppercase tracking-[0.5em] italic">
                Sin movimientos registrados
              </p>
            </div>
          ) : (
            movimientosFiltrados.map((m) => {
              const id = m._id || m.id;
              return (
                <div
                  key={id}
                  className="bg-surface-container border border-outline-variant/15 rounded-[2rem] px-8 py-6 flex items-center gap-6 hover:border-outline-variant/40 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${m.tipo === "ingreso" ? "bg-emerald-400/10" : "bg-rose-400/10"}`}>
                    {m.tipo === "ingreso"
                      ? <TrendingUp className="w-6 h-6 text-emerald-400" />
                      : <TrendingDown className="w-6 h-6 text-rose-400" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-on-surface truncate">{m.descripcion}</p>
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-on-surface-variant italic mt-1">
                      {m.categoria} · {new Date(m.fecha || m.creadoEn).toLocaleDateString("es-AR")}
                    </p>
                  </div>

                  <p className={`font-black text-xl italic tracking-tighter shrink-0 ${TIPO_COLORS[m.tipo]}`}>
                    {m.tipo === "egreso" ? "−" : "+"}{fmt(m.monto)}
                  </p>

                  <button
                    onClick={() => eliminarMovimiento(id)}
                    className="opacity-0 group-hover:opacity-100 transition-all text-on-surface-variant hover:text-rose-400 shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
