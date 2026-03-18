import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../api/axiosConfig"; // Cambiado a axiosConfig para consistencia
import { toast } from "react-hot-toast";

export default function EditarLote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    categoria: "",
    raza: "", // Sincronizado con el modelo
    precio: "",
    zona: "", // Sincronizado con el modelo (antes ubicacion)
    cantidad: "", // Añadido campo faltante
    pesoPromedio: "", // Añadido campo faltante
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLote = async () => {
      try {
        // Obtenemos el lote por ID directamente (más eficiente que buscar en un array)
        const res = await API.get(`/lots/${id}`);
        const lote = res.data;

        // Validamos que el lote pertenezca al usuario (opcional, el backend ya debería filtrarlo)
        setForm({
          titulo: lote.titulo || "",
          descripcion: lote.descripcion || "",
          categoria: lote.categoria || "",
          raza: lote.raza || "",
          precio: lote.precio || "",
          zona: lote.zona || "",
          cantidad: lote.cantidad || "",
          pesoPromedio: lote.pesoPromedio || "",
        });
      } catch (error) {
        console.error("❌ Error al cargar el lote:", error);
        toast.error("No se pudo localizar el activo solicitado");
        navigate("/mis-lotes");
      } finally {
        setLoading(false);
      }
    };
    fetchLote();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Sincronizando cambios con la red...");
    try {
      await API.put(`/lots/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("REGISTRO DE ACTIVO ACTUALIZADO", { id: tId });
      navigate("/mis-lotes");
    } catch (error) {
      console.error("❌ Error al actualizar el lote:", error);
      toast.error("ERROR EN LA CONSOLIDACIÓN DE DATOS", { id: tId });
    }
  };

  if (loading) {
    return (
      <div className="bg-agro-midnight min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-agro-teal shadow-teal-glow"></div>
      </div>
    );
  }

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-agro-teal/5 blur-[200px] pointer-events-none opacity-30"></div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <header className="mb-16">
          <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Actualización de Registro</span>
          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none uppercase">
            RECONFIGURAR <span className="text-agro-teal not-italic font-black">LOTE</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* SECCIÓN INFORMACIÓN GENERAL */}
          <section className="card-midnight p-10 bg-agro-charcoal/40 border border-white/5 space-y-8">
            <div className="flex items-center gap-6 mb-4">
              <h2 className="text-xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap text-agro-teal">Parámetros del Activo</h2>
              <div className="h-[1px] bg-white/5 flex-1"></div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Título de Publicación</label>
              <input
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                required
                className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-bold text-white shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Ficha Técnica / Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows="4"
                required
                className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-medium text-white shadow-inner leading-relaxed resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Categoría (Ej: Terneros)</label>
                <input
                  type="text"
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-[10px] text-white uppercase tracking-widest shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Raza Principal</label>
                <input
                  type="text"
                  name="raza"
                  value={form.raza}
                  onChange={handleChange}
                  className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-[10px] text-white uppercase tracking-widest shadow-inner"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Valuación USD</label>
                <input
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-lg text-white shadow-inner text-glow-teal"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Cabezas</label>
                <input
                  type="number"
                  name="cantidad"
                  value={form.cantidad}
                  onChange={handleChange}
                  className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-lg text-white shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Peso Prom.</label>
                <input
                  type="number"
                  name="pesoPromedio"
                  value={form.pesoPromedio}
                  onChange={handleChange}
                  className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-lg text-white shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-agro-cream/20 uppercase tracking-[0.3em] ml-2">Ubicación / Localidad</label>
              <input
                type="text"
                name="zona"
                value={form.zona}
                onChange={handleChange}
                className="w-full bg-agro-midnight border border-white/5 focus:border-agro-teal/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-bold text-white shadow-inner"
              />
            </div>
          </section>

          <footer className="pt-8 flex flex-col md:flex-row gap-6">
            <Link
              to="/mis-lotes"
              className="flex-1 py-5 bg-white/5 text-white font-black rounded-xl border border-white/5 hover:bg-white/10 transition-all uppercase tracking-widest text-[10px] text-center"
            >
              Cancelar Cambios
            </Link>
            <button
              type="submit"
              className="btn-emerald flex-[2] py-5 shadow-teal-glow-lg text-sm"
            >
              💾 ACTUALIZAR ACTIVO EN LA RED
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}