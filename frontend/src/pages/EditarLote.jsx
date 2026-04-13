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
    ubicacion: "",
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
          ubicacion: lote.ubicacion || "",
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
      <div className="bg-background min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary shadow-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[200px] pointer-events-none opacity-30"></div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <header className="mb-16 border-b border-outline-variant/60 pb-10">
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Actualización de Registro</span>
          <h1 className="text-5xl md:text-7xl font-black text-on-surface italic tracking-tighter leading-none uppercase">
            RECONFIGURAR <span className="text-primary not-italic font-black">LOTE</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* SECCIÓN INFORMACIÓN GENERAL */}
          <section className="p-10 bg-surface-container-high border border-outline-variant/60 space-y-8 rounded-[2.5rem]">
            <div className="flex items-center gap-6 mb-4">
              <h2 className="text-xl font-black text-on-surface italic tracking-tighter uppercase whitespace-nowrap text-primary">Parámetros del Activo</h2>
              <div className="h-[1px] bg-outline-variant/30 flex-1"></div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Título de Publicación</label>
              <input
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                required
                className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-bold text-on-surface"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Ficha Técnica / Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows="4"
                required
                className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-medium text-on-surface leading-relaxed resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Categoría (Ej: Terneros)</label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-[10px] text-on-surface uppercase tracking-widest appearance-none cursor-pointer"
                >
                  <option value="Terneros">Terneros</option>
                  <option value="Terneras">Terneras</option>
                  <option value="Novillos">Novillos</option>
                  <option value="Vaquillonas">Vaquillonas</option>
                  <option value="Vacas">Vacas</option>
                  <option value="Toros">Toros</option>
                  <option value="Pieza de Cría">Pieza de Cría</option>
                  <option value="Invernada">Invernada</option>
                  <option value="Maquinaria">Maquinaria</option>
                  <option value="Campos">Campos</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Raza Principal</label>
                <input
                  type="text"
                  name="raza"
                  value={form.raza}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-[10px] text-on-surface uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Valuación USD</label>
                <input
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-lg text-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Cabezas</label>
                <input
                  type="number"
                  name="cantidad"
                  value={form.cantidad}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-lg text-on-surface"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Peso Prom.</label>
                <input
                  type="number"
                  name="pesoPromedio"
                  value={form.pesoPromedio}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-lg text-on-surface"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Ubicación / Localidad</label>
              <input
                type="text"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-bold text-on-surface"
              />
            </div>
          </section>

          <footer className="pt-8 flex flex-col md:flex-row gap-6">
            <Link
              to="/mis-lotes"
              className="flex-1 py-5 bg-surface-container-low text-on-surface font-black rounded-full border border-outline-variant/60 hover:bg-surface-container-high transition-all uppercase tracking-widest text-[10px] text-center"
            >
              Cancelar Cambios
            </Link>
            <button
              type="submit"
              className="machined-gradient flex-[2] py-5 rounded-full shadow-xl text-on-tertiary-fixed font-black uppercase text-sm italic tracking-widest"
            >
              <span className="material-symbols-outlined text-sm">save</span> ACTUALIZAR ACTIVO EN LA RED
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}