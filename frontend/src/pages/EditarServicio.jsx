// frontend/src/pages/EditarServicio.jsx
import { useState, useEffect } from "react";
import servicioApi from "../api/servicioApi";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

import { BASE_URL } from "../api/axiosConfig";

export default function EditarServicio() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombre: "",
    tipoServicio: "",
    descripcion: "",
    telefono: "",
    whatsapp: "",
    email: "",
    website: "",
    fotos: [],
    _id: "",
  });

  const cargarServicio = async () => {
    try {
      const resp = id
        ? await servicioApi.obtenerServicio(id)
        : await servicioApi.obtenerMiServicio();

      const data = resp.data;

      setForm({
        nombre: data.nombre || "",
        tipoServicio: data.tipoServicio || "",
        descripcion: data.descripcion || "",
        telefono: data.telefono || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        website: data.website || "",
        fotos: data.fotos || [],
        _id: data._id,
      });

    } catch (err) {
      navigate("/crear-servicio");
    }

    setLoading(false);
  };

  useEffect(() => {
    cargarServicio();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await servicioApi.editarServicio(form._id, form);
      toast.success("CONFIGURACIÓN PROFESIONAL ACTUALIZADA");
      navigate("/mis-servicios");
    } catch (err) {
      toast.error("ERROR EN LA CONSOLIDACIÓN TÉCNICA");
    }
  };

  const handleSubirFotos = async (e) => {
    const fd = new FormData();
    Array.from(e.target.files).forEach((f) => fd.append("fotos", f));

    try {
      const resp = await servicioApi.subirFotos(form._id, fd);
      setForm((prev) => ({ ...prev, fotos: resp.data.fotos }));
      toast.success("ASSETS VISUALES INDEXADOS");
    } catch (err) {
      toast.error("ERROR EN LA CARGA DE MULTIMEDIA");
    }
  };

  const eliminarFoto = async (foto) => {
    if (!window.confirm("¿Retirar este asset visual del registro?")) return;
    try {
      await servicioApi.eliminarFoto(foto);
      setForm((prev) => ({
        ...prev,
        fotos: prev.fotos.filter((f) => f !== foto),
      }));
      toast.success("ASSET RETIRADO DEL REGISTRO");
    } catch (err) {
      toast.error("ERROR EN LA ELIMINACIÓN DE DATOS");
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[200px] pointer-events-none opacity-30"></div>

      <div className="container mx-auto max-w-4xl relative z-10">

        <header className="mb-16 reveal">
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block">Gestión de Perfil Profesional</span>
          <h1 className="text-5xl md:text-7xl font-black text-on-surface italic tracking-tighter leading-none">
            EDITAR <span className="text-primary not-italic font-black">SERVICIO</span>
          </h1>
        </header>

        <form className="space-y-12" onSubmit={handleSubmit}>

          {/* IDENTIDAD TÉCNICA */}
          <section className="bg-surface-container-high border border-outline-variant/20 rounded-2xl p-10 space-y-8">
            <div className="flex items-center gap-6 mb-4">
              <h2 className="text-xl font-black text-primary italic tracking-tighter uppercase whitespace-nowrap">Núcleo del Servicio</h2>
              <div className="h-[1px] bg-outline-variant/20 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Nombre del Servicio</label>
                <input
                  className="w-full bg-background border border-outline-variant/20 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-bold text-on-surface shadow-inner"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Área de Especialización</label>
                <select
                  className="w-full bg-background border border-outline-variant/20 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-[10px] text-on-surface uppercase tracking-widest cursor-pointer appearance-none shadow-inner"
                  name="tipoServicio"
                  value={form.tipoServicio}
                  onChange={handleChange}
                >
                  <option value="">Selecciona...</option>
                  <option value="siembra">Siembra</option>
                  <option value="fumigación">Fumigación</option>
                  <option value="trilla">Trilla</option>
                  <option value="enfardado">Enfardado</option>
                  <option value="transporte">Transporte</option>
                  <option value="agrónomo">Ingeniero Agrónomo</option>
                  <option value="técnico">Técnico Agropecuario</option>
                  <option value="gestor">Gestor Agropecuario</option>
                  <option value="otros">Otro servicio</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Descripción y Metodología</label>
              <textarea
                className="w-full bg-background border border-outline-variant/20 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-medium text-on-surface shadow-inner leading-relaxed resize-none"
                name="descripcion"
                rows="4"
                value={form.descripcion}
                onChange={handleChange}
              ></textarea>
            </div>
          </section>

          {/* CONTACT TERMINAL */}
          <section className="bg-surface-container-high border border-outline-variant/20 rounded-2xl p-10 space-y-8">
            <div className="flex items-center gap-6 mb-4">
              <h2 className="text-xl font-black text-primary italic tracking-tighter uppercase whitespace-nowrap">Canales de Enlace</h2>
              <div className="h-[1px] bg-outline-variant/20 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Línea Telefónica</label>
                <input
                  name="telefono"
                  className="w-full bg-background border border-outline-variant/20 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-on-surface shadow-inner"
                  value={form.telefono}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">WhatsApp Business</label>
                <input
                  name="whatsapp"
                  className="w-full bg-background border border-outline-variant/20 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-on-surface shadow-inner"
                  value={form.whatsapp}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Dirección Email</label>
                <input
                  name="email"
                  className="w-full bg-background border border-outline-variant/20 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-on-surface shadow-inner"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Portal Externo</label>
                <input
                  name="website"
                  className="w-full bg-background border border-outline-variant/20 focus:border-primary/50 px-6 py-4 rounded-xl outline-none transition-all duration-500 font-black text-on-surface shadow-inner"
                  value={form.website}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* ASSETS VISUALES */}
          <section className="bg-surface-container-high border border-outline-variant/20 rounded-2xl p-10 space-y-8">
            <div className="flex items-center gap-6 mb-4">
              <h2 className="text-xl font-black text-primary italic tracking-tighter uppercase whitespace-nowrap">Evidencia Operativa</h2>
              <div className="h-[1px] bg-outline-variant/20 flex-1"></div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-2">Añadir Nuevos Assets</label>
              <label className="block w-full h-32 border-2 border-dashed border-outline-variant/20 rounded-[2rem] hover:border-primary/30 transition-all duration-500 cursor-pointer relative overflow-hidden group shadow-inner">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleSubirFotos}
                />
                <div className="absolute inset-0 flex items-center justify-center gap-4">
                  <span className="material-symbols-outlined text-on-surface-variant/20 group-hover:text-primary transition-colors">photo_camera</span>
                  <span className="text-[9px] font-black text-on-surface-variant/20 uppercase tracking-widest group-hover:text-primary">Seleccionar Archivos</span>
                </div>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
                {form.fotos.map((f, i) => (
                  <div key={i} className="relative group/img rounded-xl overflow-hidden border border-outline-variant/20 h-24 shadow-2xl">
                    <img
                      src={f.startsWith('http') ? f : `${BASE_URL}${f}`}
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition duration-500"
                    />
                    <button
                      type="button"
                      className="absolute inset-0 bg-red-900/80 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        eliminarFoto(f);
                      }}
                    >
                      REMOVER
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="pt-8 flex flex-col md:flex-row gap-6">
            <Link
              to="/mis-servicios"
              className="flex-1 py-5 bg-surface-container text-on-surface font-black rounded-xl border border-outline-variant/20 hover:bg-surface-container-high transition-all uppercase tracking-widest text-[10px] text-center"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="machined-gradient text-on-tertiary-fixed flex-[2] py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">save</span> CONSOLIDAR CONFIGURACIÓN
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
