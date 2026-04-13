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
    <div className="min-h-screen flex flex-col justify-center items-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mb-4 shadow-xl"></div>
      <p className="text-primary font-black uppercase tracking-widest text-[10px]">Verificando Credenciales...</p>
    </div>
  );

  if (!tienda) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center px-6">
        <div className="p-16 bg-surface-container-high text-center max-w-xl rounded-[3.5rem] border border-outline-variant/60 shadow-2xl">
          <div className="text-6xl mb-8">🏢</div>
          <h2 className="text-3xl font-black text-on-surface italic uppercase mb-6 tracking-tighter">Perfil de Negocio Requerido</h2>
          <p className="text-on-surface-variant/40 font-bold uppercase tracking-widest text-[9px] mb-10 leading-relaxed italic">
            Para publicar insumos, primero debe establecer la identidad de su <span className="text-primary">Tienda o Agroveterinaria</span>.
          </p>
          <Link to="/crear-tienda" className="machined-gradient py-5 block rounded-full text-on-tertiary-fixed font-black uppercase tracking-widest text-[10px]">CONFIGURAR MI TIENDA <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[200px] pointer-events-none opacity-20"></div>
      <div className="container mx-auto max-w-4xl relative z-10">
        <header className="mb-16 border-b border-outline-variant/60 pb-10">
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Carga de Insumos</span>
          <h1 className="text-5xl md:text-6xl font-black text-on-surface italic tracking-tighter leading-none">
            NUEVO <span className="text-primary not-italic font-black">PRODUCTO</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* SECCIÓN DATOS TÉCNICOS */}
          <section className="p-10 bg-surface-container-high rounded-[3rem] border border-outline-variant/60 shadow-2xl space-y-10">
            <h2 className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-6 border-b border-outline-variant/30 pb-4">Especificaciones del Insumo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-primary font-black uppercase tracking-widest ml-1">Nombre Comercial</label>
                <input type="text" name="titulo" placeholder="Ej: Herbicida Selectivo 5L" className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 transition-all font-bold" required onChange={handleChange} />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-primary font-black uppercase tracking-widest ml-1">Rubro / Categoría</label>
                <select name="categoria" className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer" onChange={handleChange}>
                  {CATEGORIAS_INSUMOS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest ml-1">Precio Unitario (USD)</label>
                <input type="number" name="precio" placeholder="0.00" className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 transition-all font-black text-xl text-primary" required onChange={handleChange} />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest ml-1">Stock Disponible</label>
                <input type="number" name="stock" placeholder="1" className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 transition-all font-black text-xl" required onChange={handleChange} />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest ml-1">Presentación</label>
                <select name="unidadMedida" className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer" onChange={handleChange}>
                  <option value="unidad">Por Unidad</option>
                  <option value="kg">Por Kilo (kg)</option>
                  <option value="litro">Por Litro (L)</option>
                  <option value="bolsa">Bolsa / Saco</option>
                  <option value="bidon">Bidón / Tambor</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest ml-1">Especificaciones Técnicas</label>
              <textarea name="descripcion" placeholder="Describa la marca, principios activos y recomendaciones de uso..." className="w-full bg-surface-container-lowest p-8 rounded-3xl text-on-surface border border-outline-variant/50 h-48 resize-none outline-none focus:border-primary/50 transition-all font-medium leading-relaxed" required onChange={handleChange}></textarea>
            </div>
          </section>

          {/* SECCIÓN IMÁGENES */}
          <section className="p-10 bg-surface-container-high rounded-[3rem] border border-outline-variant/60 shadow-2xl">
            <header className="flex justify-between items-center mb-10 border-b border-outline-variant/30 pb-4">
              <h2 className="text-primary font-black uppercase text-[10px] tracking-[0.3em] italic">Galería de Imágenes</h2>
              <span className="text-on-surface-variant/10 text-[9px] font-black uppercase tracking-[0.4em]">{fotos.length} / 5</span>
            </header>

            <div className="flex items-center justify-center w-full mb-10">
              <label className="w-full flex flex-col items-center px-4 py-10 bg-surface-container-lowest text-primary rounded-[2rem] border-2 border-dashed border-outline-variant/60 cursor-pointer hover:border-primary/20 transition-all group">
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-sm">photo_camera</span></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cargar Fotografías</span>
                <input type="file" multiple accept="image/*" onChange={handleFotos} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {fotos.map((f, i) => (
                <div key={i} className="relative h-28 rounded-2xl overflow-hidden border border-outline-variant/60 group shadow-lg">
                  <img src={URL.createObjectURL(f)} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Vista previa" />
                  <button type="button" onClick={() => eliminarFoto(i)} className="absolute inset-0 bg-red-600/80 text-white font-black text-[9px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center uppercase tracking-widest">Eliminar</button>
                </div>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={enviando}
            className="machined-gradient text-on-tertiary-fixed w-full py-5 rounded-full font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
          >
            {enviando ? "INDEXANDO EN LA RED..." : <>CARGAR PRODUCTO <span className="material-symbols-outlined text-sm">arrow_forward</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}