// frontend/src/pages/EditarProducto.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import productoApi from "../api/productoApi";
import { toast } from "react-hot-toast";

import { BASE_URL } from "../api/axiosConfig";

export default function EditarProducto() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo: "",
    precio: "",
    categoria: "",
    stock: "disponible",
    peso: "",
    descripcion: "",
  });

  const [fotosActuales, setFotosActuales] = useState([]);
  const [fotosNuevas, setFotosNuevas] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarProducto = async () => {
    try {
      const { data } = await productoApi.obtenerProducto(id);

      setForm({
        titulo: data.titulo,
        precio: data.precio,
        categoria: data.categoria,
        stock: data.stock,
        peso: data.peso || "",
        descripcion: data.descripcion,
      });

      setFotosActuales(data.fotos || []);
    } catch (err) {
      console.error("No se pudo cargar el producto:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarProducto();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFotosNuevas = (e) => {
    const nuevas = Array.from(e.target.files);
    setFotosNuevas((prev) => [...prev, ...nuevas]);
  };

  const eliminarFotoNueva = (index) => {
    setFotosNuevas((prev) => prev.filter((_, i) => i !== index));
  };

  const eliminarFoto = async (ruta) => {
    if (!confirm("¿Retirar este registro visual del activo?")) return;
    try {
      await productoApi.eliminarFoto(id, ruta);
      setFotosActuales((prev) => prev.filter((f) => f !== ruta));
      toast.success("ASSET VISUAL RETIRADO");
    } catch (error) {
      toast.error("ERROR EN LA ELIMINACIÓN DE DATOS");
    }
  };

  const setPrincipal = async (ruta) => {
    try {
      await productoApi.setFotoPrincipal(id, ruta);
      setFotosActuales((prev) => [ruta, ...prev.filter((f) => f !== ruta)]);
      toast.success("JERARQUÍA VISUAL ACTUALIZADA");
    } catch (err) {
      toast.error("ERROR AL DEFINIR ASSET PRINCIPAL");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await productoApi.editarProducto(id, form);

      if (fotosNuevas.length > 0) {
        const fd = new FormData();
        fotosNuevas.forEach((f) => fd.append("fotos", f));
        await productoApi.subirFotos(id, fd);
        setFotosNuevas([]);
        cargarProducto();
      }

      toast.success("REGISTRO DE PRODUCTO ACTUALIZADO");
      navigate("/mi-tienda");
    } catch (err) {
      toast.error("ERROR EN LA CONSOLIDACIÓN CATALÓGICA");
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
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[200px] pointer-events-none opacity-30 -mr-40 -mt-40"></div>

      <div className="container mx-auto max-w-4xl relative z-10">

        <header className="mb-16 border-b border-outline-variant/60 pb-12">
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Mantenimiento de Catálogo</span>
          <h1 className="text-5xl md:text-7xl font-black text-on-surface italic tracking-tighter leading-none uppercase">
            GESTIÓN DE <span className="text-primary not-italic font-black">ACTIVO</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">

          <section className="p-10 bg-surface-container-high space-y-8 rounded-[2.5rem] border border-outline-variant/60 shadow-xl">
            <div className="flex items-center gap-6 mb-4">
              <h2 className="text-xl font-black text-on-surface italic tracking-tighter uppercase whitespace-nowrap text-primary">Especificaciones Técnicas</h2>
              <div className="h-[1px] bg-outline-variant/30 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Designación de Producto</label>
                <input
                  type="text"
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-bold text-on-surface"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Categorización</label>
                <input
                  type="text"
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-[10px] text-on-surface uppercase tracking-widest"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Valuación Comercial (USD)</label>
                <input
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-lg text-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Disponibilidad de Stock</label>
                <select
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-[10px] text-on-surface uppercase tracking-widest cursor-pointer appearance-none shadow-inner"
                >
                  <option value="disponible">En Almacén</option>
                  <option value="agotado">Sin Existencias</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Métricas / Peso</label>
                <input
                  type="text"
                  name="peso"
                  value={form.peso}
                  onChange={handleChange}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-bold text-on-surface"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Ficha Descriptiva</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows="4"
                className="w-full bg-surface-container-lowest border border-outline-variant/50 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-medium text-on-surface leading-relaxed resize-none"
                required
              />
            </div>
          </section>

          {/* ASSETS CURRENT */}
          <section className="p-10 bg-surface-container-high space-y-8 rounded-[2.5rem] border border-outline-variant/60 shadow-xl">
            <div className="flex items-center gap-6 mb-4">
              <h2 className="text-xl font-black text-on-surface italic tracking-tighter uppercase whitespace-nowrap text-primary">Showcase de Activos</h2>
              <div className="h-[1px] bg-outline-variant/30 flex-1"></div>
            </div>

            <div>
              <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2 mb-6 block">Galería de Producto Actual</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 py-4">
                {fotosActuales.map((ruta, i) => (
                  <div key={i} className={`relative group/img rounded-2xl overflow-hidden border transition-all duration-700 h-32 shadow-2xl ${i === 0 ? "border-primary shadow-xl scale-105 z-10" : "border-outline-variant/30 grayscale-[30%]"
                    }`}>
                    <img
                      src={`${BASE_URL}${ruta}`}
                      className="w-full h-full object-cover group-hover:grayscale-0 transition duration-500"
                      alt="Product Asset"
                    />

                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-primary text-on-tertiary-fixed text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">
                        Principal
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => eliminarFoto(ruta)}
                      className="absolute top-2 right-2 bg-red-900/80 text-white w-6 h-6 rounded-lg flex items-center justify-center text-xs opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>

                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => setPrincipal(ruta)}
                        className="absolute inset-0 bg-primary/80 text-on-tertiary-fixed font-black text-[9px] uppercase tracking-widest flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                      >
                        DEFINIR PRINCIPAL
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* NEW ASSETS */}
            <div className="space-y-6 pt-10 border-t border-outline-variant/30">
              <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2 group-hover:text-primary transition duration-500">Inyectar Nuevos Assets Visuales</label>
              <label className="block w-full h-32 border-2 border-dashed border-outline-variant/30 rounded-[2rem] hover:border-primary/30 transition-all duration-500 cursor-pointer relative overflow-hidden group bg-surface-container-lowest">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFotosNuevas}
                  className="hidden"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-6 pointer-events-none">
                  <span className="text-3xl text-primary opacity-40 group-hover:opacity-100 transition duration-500 text-center flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl mb-2">upload_file</span>
                    <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest group-hover:text-primary">SELECCIÓN DE ARCHIVOS MULTIMEDIA</span>
                  </span>
                </div>
              </label>

              {fotosNuevas.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 py-4">
                  {fotosNuevas.map((f, i) => (
                    <div key={i} className="relative group/new rounded-xl overflow-hidden border border-outline-variant/60 h-20 shadow-xl">
                      <img
                        src={URL.createObjectURL(f)}
                        className="w-full h-full object-cover"
                        alt="New Asset Preview"
                      />
                      <button
                        type="button"
                        onClick={() => eliminarFotoNueva(i)}
                        className="absolute inset-0 bg-red-900/80 text-white font-black text-[9px] uppercase tracking-widest flex items-center justify-center opacity-0 group-hover/new:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <footer className="pt-8 flex flex-col md:flex-row gap-6">
            <Link
              to="/mi-tienda"
              className="flex-1 py-6 bg-surface-container-low text-on-surface font-black rounded-full border border-outline-variant/60 hover:bg-surface-container-high transition-all uppercase tracking-widest text-[10px] text-center"
            >
              Cancelar Cambios
            </Link>
            <button
              type="submit"
              className="machined-gradient flex-[2] py-6 rounded-full shadow-xl text-on-tertiary-fixed font-black uppercase text-sm italic tracking-widest"
            >
              <span className="material-symbols-outlined text-sm">save</span> CONCORDAR REGISTRO DE PRODUCTO
            </button>
          </footer>

        </form>
      </div>
    </div>
  );
}
