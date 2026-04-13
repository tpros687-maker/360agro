import { useEffect, useState } from "react";
import tiendaApi from "../api/tiendaApi";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { BASE_URL } from "../api/axiosConfig";

const SECTORES_AGRO = [
  "Veterinaria y Fármacos",
  "Maquinaria Agrícola",
  "Insumos y Semillas",
  "Equipamiento Rural",
  "Cabaña / Genética",
  "Logística y Transporte",
  "Otros Servicios"
];

export default function EditarTienda() {
  const navigate = useNavigate();
  const [tienda, setTienda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    descripcion: "",
    zona: "",
    telefono: "",
    whatsapp: "",
    email: "",
    website: "",
  });

  const [logoActual, setLogoActual] = useState(null);
  const [logoNuevo, setLogoNuevo] = useState(null);
  const [fotosActuales, setFotosActuales] = useState([]);
  const [fotosNuevas, setFotosNuevas] = useState([]);

  const cargarTienda = async () => {
    try {
      const { data } = await tiendaApi.obtenerMiTienda();
      setTienda(data);

      // 🛡️ SEGURIDAD: Si no existe el perfil, redirigimos a la creación
      if (data.noExiste) {
        toast.error("Showroom no detectado. Redirigiendo...");
        navigate("/mi-tienda");
        return;
      }

      setForm({
        nombre: data.nombre || "",
        categoria: data.rubro || "",
        descripcion: data.descripcion || "",
        zona: data.zona || "",
        telefono: data.telefono || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        website: data.website || "",
      });
      setLogoActual(data.logo || null);
      setFotosActuales(data.fotos || []);
    } catch (error) {
      console.error("❌ Error al cargar la terminal de marca:", error);
      toast.error("No se pudo sincronizar la identidad corporativa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTienda();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNuevoLogo = (e) => {
    const file = e.target.files[0];
    if (file) setLogoNuevo(file);
  };

  const handleNuevasFotos = (e) => {
    const arr = Array.from(e.target.files);
    if (fotosActuales.length + fotosNuevas.length + arr.length > 8) {
      return toast.error("Límite de 8 activos visuales excedido");
    }
    setFotosNuevas((prev) => [...prev, ...arr]);
  };

  const eliminarFotoActual = async (ruta) => {
    if (!confirm("¿Desea purgar este asset visual de la red?")) return;
    try {
      await tiendaApi.eliminarFoto(tienda._id, ruta);
      setFotosActuales((prev) => prev.filter((f) => f !== ruta));
      toast.success("ASSET ELIMINADO");
    } catch {
      toast.error("ERROR EN LA PURGA");
    }
  };

  const eliminarLogoActual = async () => {
    if (!confirm("¿Retirar identificador visual de marca?")) return;
    try {
      await tiendaApi.eliminarLogo(tienda._id);
      setLogoActual(null);
      toast.success("IDENTIDAD RETIRADA");
    } catch {
      toast.error("ERROR AL ELIMINAR LOGO");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const tId = toast.loading("Consolidando cambios en la red...");

    try {
      if (!tienda?._id) {
        toast.error("ID de tienda perdido. Recargando...", { id: tId });
        return cargarTienda();
      }

      // 1. Actualización de datos (Sincronizamos rubro con categoria)
      await tiendaApi.editarTienda(tienda._id, {
        ...form,
        rubro: form.categoria
      });

      // 2. Subida de Logo (Si hay cambio)
      if (logoNuevo) {
        const fd = new FormData();
        fd.append("logo", logoNuevo);
        await tiendaApi.subirLogo(fd);
      }

      // 3. Subida de Galería
      if (fotosNuevas.length > 0) {
        const fd2 = new FormData();
        fotosNuevas.forEach((f) => fd2.append("fotos", f));
        await tiendaApi.subirFotos(fd2);
      }

      toast.success("IDENTIDAD ACTUALIZADA", { id: tId });
      navigate("/mi-tienda");
    } catch (error) {
      toast.error("FALLO EN LA CONSOLIDACIÓN", { id: tId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="bg-background min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] -ml-20 -mt-20 opacity-20"></div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <header className="mb-16 border-b border-outline-variant/60 pb-10">
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Brand Management Terminal</span>
          <h1 className="text-6xl font-black text-on-surface italic tracking-tighter uppercase leading-none">
            RECONFIGURAR <span className="text-primary not-italic">TIENDA</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* SECCIÓN 1: IDENTIDAD BÁSICA */}
          <section className="p-10 bg-surface-container-high border border-outline-variant/60 space-y-8 rounded-[2.5rem] shadow-xl">
            <h2 className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-6 italic">Parámetros de Marca</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Nombre Comercial</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/30 transition-all font-bold" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Sector</label>
                <select name="categoria" value={form.categoria} onChange={handleChange} required className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/30 transition-all font-black text-[10px] uppercase tracking-widest appearance-none">
                  <option value="">Seleccionar Sector...</option>
                  {SECTORES_AGRO.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Descripcion</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows="4" className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/30 transition-all resize-none font-medium leading-relaxed"></textarea>
            </div>
          </section>

          {/* SECCIÓN 2: ACTIVOS VISUALES */}
          <section className="p-10 bg-surface-container-high border border-outline-variant/60 space-y-10 rounded-[2.5rem] shadow-xl">
            <h2 className="text-primary font-black text-[10px] uppercase tracking-[0.4em] italic">Visual Assets & Branding</h2>

            {/* LOGO */}
            <div className="space-y-6">
              <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Identificador Logotipo</p>
              <div className="flex flex-col md:flex-row items-center gap-8">
                {logoActual && (
                  <div className="relative group">
                    <img src={`${BASE_URL}${logoActual}`} className="w-32 h-32 rounded-3xl object-contain bg-surface-container-lowest border border-outline-variant/30 p-4" alt="Logo" />
                    <button type="button" onClick={eliminarLogoActual} className="absolute inset-0 bg-red-600/80 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-black text-white uppercase tracking-widest">Remover</button>
                  </div>
                )}
                <label className="flex-1 w-full h-32 border-2 border-dashed border-outline-variant/30 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/30 transition-all bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-3xl mb-1 text-primary/40">file_upload</span>
                  <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Subir Nuevo Logo</span>
                  <input type="file" onChange={handleNuevoLogo} className="hidden" />
                  {logoNuevo && <span className="text-primary text-[8px] mt-2 font-black italic">{logoNuevo.name}</span>}
                </label>
              </div>
            </div>

            {/* GALERÍA */}
            <div className="space-y-6">
              <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Galería de Tienda</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {fotosActuales.map((f, i) => (
                  <div key={i} className="relative group h-24 rounded-xl overflow-hidden border border-outline-variant/30">
                    <img src={`${BASE_URL}${f}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Gallery Asset" />
                    <button type="button" onClick={() => eliminarFotoActual(f)} className="absolute inset-0 bg-red-900/60 opacity-0 group-hover:opacity-100 transition-all text-[8px] font-black text-white uppercase">Eliminar</button>
                  </div>
                ))}
              </div>
              <label className="block w-full py-6 border-2 border-dashed border-outline-variant/30 rounded-2xl text-center cursor-pointer hover:border-primary/30 transition-all bg-surface-container-lowest">
                <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">add</span> Añadir Assets Visuales
                </span>
                <input type="file" multiple onChange={handleNuevasFotos} className="hidden" />
              </label>
            </div>
          </section>

          <footer className="flex flex-col md:flex-row gap-6 pt-10">
            <Link to="/mi-tienda" className="flex-1 py-6 bg-surface-container-low text-on-surface-variant/60 font-black rounded-full text-[10px] uppercase text-center tracking-[0.3em] hover:bg-surface-container-high transition-all border border-outline-variant/60">Cancelar</Link>
            <button type="submit" disabled={saving} className="machined-gradient flex-[2] py-6 rounded-full shadow-xl text-on-tertiary-fixed font-black uppercase tracking-[0.4em] text-xs italic">
              {saving ? "Procesando..." : <>CONSOLIDAR IDENTIDAD <span className="material-symbols-outlined text-sm">arrow_forward</span></>}
            </button>
          </footer>

        </form>
      </div>
    </div>
  );
}