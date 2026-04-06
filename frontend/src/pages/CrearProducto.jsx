import { useState, useEffect } from "react";
import productoApi from "../api/productoApi";
import tiendaApi from "../api/tiendaApi"; // Usamos tu API de tiendas/proveedores
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

const CATEGORIAS_INSUMOS = [
  "Nutrición Animal",
  "Veterinaria y Fármacos",
  "Semillas y Fertilizantes",
  "Herramientas y Ferretería Rural",
  "Indumentaria y Seguridad",
  "Repuestos y Accesorios",
  "Otros Insumos"
];

export default function CrearProducto() {
  const navigate = useNavigate();
  const [tienda, setTienda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    categoria: CATEGORIAS_INSUMOS[0],
    stock: 1,
    unidadMedida: "unidad",
  });

  const [fotos, setFotos] = useState([]);

  useEffect(() => {
    const cargarValidacion = async () => {
      try {
        // Verificamos que el usuario tenga un perfil de negocio (Tienda) creado
        const { data } = await tiendaApi.obtenerMiTienda();
        setTienda(data);
      } catch (e) {
        console.error("❌ Acceso restringido: Perfil de negocio no detectado.");
      } finally {
        setLoading(false);
      }
    };
    cargarValidacion();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: (name === "stock" || name === "precio") ? Number(value) : value
    });
  };

  const handleFotos = (e) => {
    const seleccionadas = Array.from(e.target.files);
    if (fotos.length + seleccionadas.length > 5) {
      return toast.error("El límite por producto es de 5 imágenes.");
    }
    setFotos((prev) => [...prev, ...seleccionadas]);
  };

  const eliminarFoto = (index) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tienda) return toast.error("Debe configurar su tienda primero.");

    setEnviando(true);
    const tId = toast.loading("Sincronizando on la red...");

    try {
      // 1. Crear el registro base
      const { data: nuevo } = await productoApi.crearProducto(form);

      // 2. Subir activos visuales si existen
      if (fotos.length > 0) {
        const fd = new FormData();
        fotos.forEach((f) => fd.append("fotos", f));
        await productoApi.subirFotos(nuevo._id, fd);
      }

      toast.success("PRODUCTO PUBLICADO CON ÉXITO", { id: tId });
      navigate("/mi-tienda");
    } catch (err) {
      toast.error(err.response?.data?.mensaje || "Error en la carga", { id: tId });
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-agro-midnight">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-agro-teal mb-4 shadow-teal-glow"></div>
      <p className="text-agro-teal font-black uppercase tracking-widest text-[10px]">Verificando Credenciales...</p>
    </div>
  );

  if (!tienda) {
    return (
      <div className="bg-agro-midnight min-h-screen flex items-center justify-center px-6">
        <div className="p-16 bg-agro-charcoal/40 text-center max-w-xl rounded-[3.5rem] border border-white/5 shadow-2xl">
          <div className="text-6xl mb-8">🏢</div>
          <h2 className="text-3xl font-black text-white italic uppercase mb-6 tracking-tighter">Perfil de Negocio Requerido</h2>
          <p className="text-agro-cream/30 font-bold uppercase tracking-widest text-[9px] mb-10 leading-relaxed italic">
            Para publicar insumos, primero debe establecer la identidad de su <span className="text-agro-teal">Tienda o Agroveterinaria</span>.
          </p>
          <Link to="/crear-tienda" className="btn-emerald py-5 block">CONFIGURAR MI TIENDA ➔</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative z-10">
        <header className="mb-16">
          <span className="text-agro-teal font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Carga de Insumos</span>
          <h1 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter leading-none">
            NUEVO <span className="text-agro-teal not-italic font-black">PRODUCTO</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* SECCIÓN DATOS TÉCNICOS */}
          <section className="p-10 bg-agro-charcoal/30 rounded-[3rem] border border-white/5 shadow-2xl space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-agro-teal font-black uppercase tracking-widest ml-1">Nombre Comercial</label>
                <input type="text" name="titulo" placeholder="Ej: Herbicida Selectivo 5L" className="bg-agro-midnight p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-agro-teal/30 transition-all font-bold shadow-inner" required onChange={handleChange} />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-agro-teal font-black uppercase tracking-widest ml-1">Rubro / Categoría</label>
                <select name="categoria" className="bg-agro-midnight p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-agro-teal/30 transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-inner" onChange={handleChange}>
                  {CATEGORIAS_INSUMOS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-white/20 font-black uppercase tracking-widest ml-1">Precio Unitario (USD)</label>
                <input type="number" name="precio" placeholder="0.00" className="bg-agro-midnight p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-agro-teal/30 transition-all font-black text-xl shadow-inner text-glow-teal" required onChange={handleChange} />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-white/20 font-black uppercase tracking-widest ml-1">Stock Disponible</label>
                <input type="number" name="stock" placeholder="1" className="bg-agro-midnight p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-agro-teal/30 transition-all font-black text-xl shadow-inner" required onChange={handleChange} />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-white/20 font-black uppercase tracking-widest ml-1">Presentación</label>
                <select name="unidadMedida" className="bg-agro-midnight p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-agro-teal/30 transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-inner" onChange={handleChange}>
                  <option value="unidad">Por Unidad</option>
                  <option value="kg">Por Kilo (kg)</option>
                  <option value="litro">Por Litro (L)</option>
                  <option value="bolsa">Bolsa / Saco</option>
                  <option value="bidon">Bidón / Tambor</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] text-white/20 font-black uppercase tracking-widest ml-1">Especificaciones Técnicas</label>
              <textarea name="descripcion" placeholder="Describa la marca, principios activos y recomendaciones de uso..." className="w-full bg-agro-midnight p-8 rounded-3xl text-white border border-white/5 h-48 resize-none outline-none focus:border-agro-teal/30 transition-all font-medium leading-relaxed shadow-inner" required onChange={handleChange}></textarea>
            </div>
          </section>

          {/* SECCIÓN IMÁGENES */}
          <section className="p-10 bg-agro-charcoal/30 rounded-[3rem] border border-white/5 shadow-2xl">
            <header className="flex justify-between items-center mb-10">
              <h2 className="text-agro-teal font-black uppercase text-[10px] tracking-[0.3em] italic">Galería de Imágenes</h2>
              <span className="text-white/10 text-[9px] font-black uppercase tracking-[0.4em]">{fotos.length} / 5</span>
            </header>

            <div className="flex items-center justify-center w-full mb-10">
              <label className="w-full flex flex-col items-center px-4 py-10 bg-agro-midnight text-agro-teal rounded-[2rem] border-2 border-dashed border-white/5 cursor-pointer hover:border-agro-teal/20 transition-all group">
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📸</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cargar Fotografías</span>
                <input type="file" multiple accept="image/*" onChange={handleFotos} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {fotos.map((f, i) => (
                <div key={i} className="relative h-28 rounded-2xl overflow-hidden border border-white/10 group shadow-lg">
                  <img src={URL.createObjectURL(f)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Vista previa" />
                  <button type="button" onClick={() => eliminarFoto(i)} className="absolute inset-0 bg-red-600/80 text-white font-black text-[9px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center uppercase tracking-widest">Eliminar</button>
                </div>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={enviando}
            className="w-full btn-emerald py-10 shadow-[0_0_50px_rgba(16,185,129,0.4)] text-sm"
          >
            {enviando ? "INDEXANDO EN LA RED..." : "📤 CARGAR PRODUCTO ➔"}
          </button>
        </form>
      </div>
    </div>
  );
}