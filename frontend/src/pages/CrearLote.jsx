import { useState, useContext, useEffect } from "react";
import API from "../api/lotApi";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const LOCALIDADES_POR_DEPTO = {
  "Artigas": ["Artigas", "Tomás Gomensoro", "Baltasar Brum", "Bella Unión"],
  "Canelones": ["Canelones", "Las Piedras", "La Paz", "Pando", "Santa Lucía", "Atlántida", "Ciudad de la Costa", "Sauce"],
  "Cerro Largo": ["Melo", "Río Branco", "Fraile Muerto", "Aceguá"],
  "Colonia": ["Colonia del Sacramento", "Carmelo", "Nueva Helvecia", "Juan Lacaze", "Rosario", "Nueva Palmira"],
  "Durazno": ["Durazno", "Sarandí del Yí", "Carlos Reyles", "La Paloma"],
  "Flores": ["Trinidad", "Ismael Cortinas", "Andresito"],
  "Florida": ["Florida", "Sarandí Grande", "Casupá", "25 de Mayo"],
  "Lavalleja": ["Minas", "Solís de Mataojo", "José Pedro Varela", "Pirarajá"],
  "Maldonado": ["Maldonado", "Punta del Este", "San Carlos", "Piriápolis", "Aiguá"],
  "Montevideo": ["Montevideo"],
  "Paysandú": ["Paysandú", "Guichón", "Quebracho", "Tambores"],
  "Río Negro": ["Fray Bentos", "Young", "Nuevo Berlín", "San Javier", "Algorta"],
  "Rivera": ["Rivera", "Tranqueras", "Vichadero", "Minas de Corrales"],
  "Rocha": ["Rocha", "Chuy", "Lascano", "La Paloma", "Castillos"],
  "Salto": ["Salto", "Belén", "Constitución", "Termas del Daymán"],
  "San José": ["San José de Mayo", "Libertad", "Ciudad del Plata", "Rodríguez"],
  "Soriano": ["Mercedes", "Dolores", "Cardona", "Palmitas", "Villa Soriano"],
  "Tacuarembó": ["Tacuarembó", "Paso de los Toros", "San Gregorio de Polanco", "Curtina"],
  "Treinta y Tres": ["Treinta y Tres", "Vergara", "Santa Clara de Olimar"]
};

export default function CrearLote() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    categoria: "Novillos",
    raza: "",
    cantidad: "",
    pesoPromedio: "",
    precio: "",
    ubicacion: "",
    departamento: "",
    localidad: "",
    numeroDicose: "",
  });

  const [fotos, setFotos] = useState([]);
  const [video, setVideo] = useState(null);
  const [docPropiedad, setDocPropiedad] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localidadesDisponibles, setLocalidadesDisponibles] = useState([]);

  useEffect(() => {
    if (formData.departamento) {
      setLocalidadesDisponibles(LOCALIDADES_POR_DEPTO[formData.departamento] || []);
      setFormData(prev => ({ ...prev, localidad: "" }));
    }
  }, [formData.departamento]);

  const userPlan = usuario?.plan?.toLowerCase() || "gratis";
  const puedePublicar = ["productor", "pro", "empresa"].includes(userPlan);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (fotos.length + files.length > 5) {
      toast.error("MÁXIMO 5 REGISTROS FOTOGRÁFICOS");
      return;
    }
    setFotos((prev) => [...prev, ...files]);
  };

  const eliminarFoto = (i) => setFotos((prev) => prev.filter((_, index) => index !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("SINCRONIZANDO ACTIVO EN LA RED...");

    try {
      const formFull = new FormData();
      Object.keys(formData).forEach(key => formFull.append(key, formData[key]));
      fotos.forEach((file) => formFull.append("fotos", file));
      if (video) formFull.append("video", video);
      if (docPropiedad) formFull.append("documentoPropiedad", docPropiedad);

      formFull.append("destacado", ["pro", "empresa"].includes(userPlan));

      await API.crearLote(formFull);
      toast.success("ACTIVO PUBLICADO CON ÉXITO", { id: toastId });
      navigate("/lotes");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.detalle || "ERROR DE VALIDACIÓN", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!puedePublicar) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center px-6">
        <div className="bg-surface-container-high p-16 text-center max-w-xl border border-outline-variant/60 rounded-[3rem] shadow-2xl">
          <div className="mb-10 flex justify-center text-primary"><span className="material-symbols-outlined text-4xl">warning</span></div>
          <h2 className="text-4xl font-black text-on-surface italic tracking-tighter uppercase mb-6">Acceso Restringido</h2>
          <p className="text-on-surface-variant/60 text-sm font-black uppercase tracking-widest mb-10 leading-loose">
            No cuenta con un plan operativo activo para publicar activos en el mercado.
          </p>
          <Link to="/planes" className="machined-gradient py-5 px-10 inline-block font-black rounded-full uppercase tracking-widest shadow-xl text-on-tertiary-fixed">VER PLANES DE ÉLITE <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[200px] pointer-events-none opacity-20"></div>

      <div className="container mx-auto max-w-4xl relative z-10">

        <header className="mb-16 border-b border-outline-variant/60 pb-10">
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">New Asset Deployment</span>
          <h1 className="text-6xl font-black text-on-surface italic tracking-tighter uppercase leading-none">
            SUMAR <span className="text-primary not-italic">LOTE</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* SECCIÓN 1: BIOMETRÍA Y CATEGORIZACIÓN */}
          <section className="bg-surface-container-high p-10 border-outline-variant/60 space-y-8 rounded-[2.5rem] border backdrop-blur-sm">
            <h2 className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-6 border-b border-outline-variant/30 pb-4">Especificaciones Biométricas</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Título del Activo</label>
                <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} required placeholder="Ej: Lote 50 Novillos Hereford" className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 transition-all font-bold" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Clasificación Técnica</label>
                <select name="categoria" value={formData.categoria} onChange={handleChange} className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 transition-all font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Raza / Genética</label>
                <input type="text" name="raza" value={formData.raza} onChange={handleChange} placeholder="Ej: Angus Negro" className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface border border-outline-variant/50 outline-none focus:border-primary/50 transition-all font-bold" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Cantidad / Cabezas</label>
                <input type="number" name="cantidad" value={formData.cantidad} onChange={handleChange} placeholder="0" className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface border border-outline-variant/50 outline-none focus:border-primary/50 transition-all font-bold text-center" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Peso Prom. (KG)</label>
                <input type="number" name="pesoPromedio" value={formData.pesoPromedio} onChange={handleChange} placeholder="0" className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface border border-outline-variant/50 outline-none focus:border-primary/50 transition-all font-bold text-center text-primary" />
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: LOGÍSTICA Y MERCADO */}
          <section className="bg-surface-container-high p-10 border-outline-variant/60 space-y-8 rounded-[2.5rem] border backdrop-blur-sm">
            <h2 className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-6 border-b border-outline-variant/30 pb-4">Valuación y Jurisdicción</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Precio Objetivo (USD)</label>
                <input type="number" name="precio" value={formData.precio} onChange={handleChange} required placeholder="0.00" className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface border border-outline-variant/50 outline-none focus:border-primary/50 transition-all font-black text-2xl tracking-tighter" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Departamento</label>
                <select name="departamento" value={formData.departamento} onChange={handleChange} required className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface border border-outline-variant/50 outline-none focus:border-primary/50 transition-all font-bold">
                  <option value="">Seleccionar departamento...</option>
                  {["Artigas","Canelones","Cerro Largo","Colonia","Durazno","Flores","Florida","Lavalleja","Maldonado","Montevideo","Paysandú","Río Negro","Rivera","Rocha","Salto","San José","Soriano","Tacuarembó","Treinta y Tres"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Localidad</label>
                <select
                  name="localidad"
                  value={formData.localidad}
                  onChange={handleChange}
                  disabled={!formData.departamento}
                  className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 transition-all font-bold appearance-none"
                >
                  <option value="">Seleccionar localidad...</option>
                  {localidadesDisponibles.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: FICHA DESCRIPTIVA */}
          <section className="bg-surface-container-high p-10 border-outline-variant/60 space-y-8 rounded-[2.5rem] border backdrop-blur-sm">
            <h2 className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-6 border-b border-outline-variant/30 pb-4">Memoria Técnica</h2>
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest ml-1">Detalles de Sanidad y Alimentación</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="5" required placeholder="Describa el estado del lote, historial de vacunación, suplementación..." className="bg-surface-container-lowest p-6 rounded-2xl text-on-surface border border-outline-variant/50 outline-none focus:border-primary/50 transition-all resize-none font-medium leading-relaxed"></textarea>
            </div>
          </section>

          {/* SECCIÓN 4: CERTIFICACIÓN OFICIAL */}
          <section className="bg-surface-container-high p-10 border-primary/30 space-y-10 rounded-[2.5rem] border relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-[15rem]"></div>

            <header className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 machined-gradient rounded-2xl flex items-center justify-center text-on-tertiary-fixed shadow-xl">
                <span className="material-symbols-outlined font-black text-2xl">verified_user</span>
              </div>
              <div>
                <h3 className="text-on-surface font-black italic uppercase tracking-tighter text-2xl leading-none">Certificación de Elite</h3>
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] mt-2 italic">Protocolo de Verificación Documental</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              {/* Input DICOSE */}
              <div className="flex flex-col gap-4">
                <label className="text-primary text-[10px] font-black uppercase tracking-[0.3em] ml-1">Número DICOSE / ID Oficial</label>
                <input
                  type="text"
                  name="numeroDicose"
                  value={formData.numeroDicose}
                  onChange={handleChange}
                  placeholder="DICOSE - 9 DÍGITOS"
                  className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface border border-outline-variant/50 focus:border-primary/50 transition-all outline-none font-black italic tracking-widest"
                />
              </div>

              {/* Guía de Propiedad */}
              <div className="flex flex-col gap-4">
                <label className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.3em] ml-1">Guía de Propiedad (PDF/IMG)</label>
                <label className="relative group cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setDocPropiedad(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface border border-outline-variant/60 group-hover:border-primary/40 transition-all flex items-center justify-between">
                    <span className="text-[10px] font-bold truncate max-w-[200px] text-on-surface-variant font-mono uppercase tracking-widest">
                      {docPropiedad ? docPropiedad.name : "VINCULAR ARCHIVO"}
                    </span>
                    <span className="material-symbols-outlined text-primary text-xl">upload_file</span>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* SECCIÓN 5: GALERÍA DE ACTIVOS */}
          <section className="bg-surface-container-high p-10 border-outline-variant/60 space-y-8 rounded-[2.5rem] border backdrop-blur-sm">
            <h2 className="text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-6 border-b border-outline-variant/30 pb-4">Evidencia Visual del Activo</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* VIDEO UPLOAD */}
              <div className="flex flex-col gap-4">
                <label className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.3em] ml-1">Video del Lote (MP4 / MAX 15MB)</label>
                <label className="relative group cursor-pointer h-32 border-2 border-dashed border-outline-variant/60 rounded-[2.5rem] hover:border-primary/30 transition-all flex flex-col items-center justify-center bg-surface-container-lowest">
                  <input type="file" accept="video/mp4" onChange={(e) => setVideo(e.target.files[0])} className="hidden" />
                  <div className="flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-2xl mb-1 text-primary">{video ? <span className="material-symbols-outlined text-sm">check_circle</span> : <span className="material-symbols-outlined text-sm">videocam</span>}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-on-surface">
                      {video ? video.name : "Subir Video de Inspección"}
                    </span>
                  </div>
                </label>
              </div>

              {/* FOTOS UPLOAD */}
              <div className="flex flex-col gap-4">
                <label className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.3em] ml-1">Fotos del Ganado (MAX 5)</label>
                <label className="relative group cursor-pointer h-32 border-2 border-dashed border-outline-variant/60 rounded-[2.5rem] hover:border-primary/30 transition-all flex flex-col items-center justify-center bg-surface-container-lowest">
                  <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                  <div className="flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-2xl mb-1 text-primary"><span className="material-symbols-outlined text-sm">photo_camera</span></span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-on-surface">Añadir Registro Fotográfico</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-8">
              {fotos.map((f, i) => (
                <div key={i} className="relative group h-20 rounded-2xl overflow-hidden border border-outline-variant/60 shadow-xl">
                  <img src={URL.createObjectURL(f)} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => eliminarFoto(i)} className="absolute inset-0 bg-red-900/80 text-white font-black text-[14px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
              ))}
            </div>
          </section>

          <footer className="pt-12">
            <button
              type="submit"
              disabled={loading}
              className="machined-gradient w-full py-8 rounded-full shadow-xl text-[13px] font-black uppercase tracking-[0.5em] italic transition-all active:scale-95 text-on-tertiary-fixed"
            >
              {loading ? "Indexando Activo Vivo..." : <><span className="material-symbols-outlined text-sm">construction</span> DESPLEGAR LOTE EN LA RED</>}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}