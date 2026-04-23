import { useState, useEffect, useContext } from "react";
import servicioApi from "../api/servicioApi";
import lotApi from "../api/lotApi";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";

const LIMITE_TOTAL = { gratis: 0, observador: 0, productor: 6, pro: Infinity, empresa: Infinity };

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

export default function CrearServicio() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [yaExiste, setYaExiste] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    tipoServicio: "",
    descripcion: "",
    departamento: "",
    localidad: "",
    telefono: "",
    whatsapp: "",
    email: "",
    website: "",
  });

  const [fotos, setFotos] = useState([]);
  const [localidadesDisponibles, setLocalidadesDisponibles] = useState([]);

  useEffect(() => {
    const verificarLimite = async () => {
      const plan = usuario?.plan?.toLowerCase() || "gratis";
      const limite = LIMITE_TOTAL[plan] ?? 0;
      if (limite === Infinity) { setVerificando(false); return; }
      try {
        const [{ data: lotes }, { data: servicios }] = await Promise.all([
          lotApi.obtenerMisLotes(),
          servicioApi.obtenerMiServicio(),
        ]);
        if ((lotes.length + servicios.length) >= limite) setLimiteAlcanzado(true);
      } catch {}
      setVerificando(false);
    };
    verificarLimite();
  }, [usuario]);

  useEffect(() => {
    if (form.departamento) {
      setLocalidadesDisponibles(LOCALIDADES_POR_DEPTO[form.departamento] || []);
      setForm(prev => ({ ...prev, localidad: "" }));
    }
  }, [form.departamento]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFotos = (e) => {
    const arr = Array.from(e.target.files);
    if (fotos.length + arr.length > 6) {
      return toast.error("Máximo 6 evidencias técnicas permitidas");
    }
    setFotos((prev) => [...prev, ...arr]);
  };

  const eliminarFoto = (i) => setFotos((prev) => prev.filter((_, index) => index !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tId = toast.loading("Configurando terminal profesional...");

    try {
      // ✅ UNIFICACIÓN: Enviamos TODO en un solo FormData (Igual que en Lotes)
      const data = new FormData();

      // Agregamos campos de texto
      const zona = form.localidad
        ? `${form.localidad}, ${form.departamento}`
        : form.departamento;
      Object.keys(form).forEach((key) => {
        if (key !== "departamento" && key !== "localidad") data.append(key, form[key]);
      });
      data.append("zona", zona);
      data.append("departamento", form.departamento);
      data.append("localidad", form.localidad);

      // Agregamos las fotos
      fotos.forEach((f) => {
        data.append("fotos", f);
      });

      // Enviamos una sola petición al backend
      await servicioApi.crearServicio(data);

      toast.success("PERFIL TÉCNICO DESPLEGADO", { id: tId });
      navigate("/mis-servicios");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.mensaje || "ERROR EN LA INDEXACIÓN", { id: tId });
    } finally {
      setLoading(false);
    }
  };

  if (verificando) return (
    <div className="bg-background min-h-screen flex justify-center items-center">
      <div className="animate-pulse text-primary font-black uppercase tracking-widest">Validando Credenciales...</div>
    </div>
  );

  if (limiteAlcanzado) {
    const plan = usuario?.plan?.toLowerCase() || "gratis";
    const limite = LIMITE_TOTAL[plan] ?? 0;
    return (
      <div className="bg-background min-h-screen flex items-center justify-center px-6">
        <div className="bg-surface-container-high p-16 text-center max-w-xl border border-outline-variant/60 rounded-[3rem] shadow-2xl">
          <div className="mb-10 flex justify-center text-primary"><span className="material-symbols-outlined text-4xl">inventory</span></div>
          <h2 className="text-4xl font-black text-on-surface italic tracking-tighter uppercase mb-6">Límite alcanzado</h2>
          <p className="text-on-surface-variant/60 text-sm font-black uppercase tracking-widest mb-10 leading-loose">
            Tu plan <span className="text-primary">{plan.toUpperCase()}</span> permite hasta {limite} publicaciones. Para publicar más, pasá al plan Pro.
          </p>
          <Link to="/planes" className="machined-gradient py-5 px-10 inline-block font-black rounded-full uppercase tracking-widest shadow-xl text-on-tertiary-fixed">Ver planes <span className="material-symbols-outlined text-sm">arrow_forward</span></Link>
        </div>
      </div>
    );
  }

  if (yaExiste) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center px-6">
        <div className="p-16 bg-surface-container-high text-center max-w-xl border border-outline-variant/70 rounded-[3rem] shadow-2xl">
          <div className="text-7xl mb-10">⚙️</div>
          <h2 className="text-4xl font-black text-on-surface italic tracking-tighter uppercase mb-6">Registro Activo</h2>
          <p className="text-on-surface-variant text-sm font-black uppercase tracking-widest mb-10 leading-loose">
            "Su terminal de servicios profesionales ya se encuentra operativa en la red de Élite Agro."
          </p>
          <Link to="/mis-servicios" className="machined-gradient text-on-tertiary-fixed py-5 px-10 inline-block rounded-full font-black uppercase tracking-widest">
            GESTIONAR MI SERVICIO <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-24 px-6 relative overflow-hidden">
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[200px] pointer-events-none opacity-20"></div>

      <div className="container mx-auto max-w-4xl relative z-10">

        <header className="mb-16 border-b border-outline-variant/30 pb-10">
          <span className="text-primary font-black text-[10px] uppercase tracking-[0.5em] mb-4 block italic">Professional Service Deployment</span>
          <h1 className="text-4xl font-black text-on-surface italic tracking-tighter uppercase leading-none">
            SUMAR <span className="text-primary not-italic">SOLUCIÓN</span>
          </h1>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* IDENTIDAD TÉCNICA */}
          <section className="p-10 bg-surface-container-high border-outline-variant/70 space-y-8 rounded-[2.5rem] border backdrop-blur-sm shadow-xl">
            <div className="border-b border-outline-variant/30 pb-4 mb-6">
              <h2 className="text-primary font-black text-[10px] uppercase tracking-[0.4em]">Especificaciones de Servicio</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Nombre Profesional / Empresa</label>
                <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej: Servicios Agrícolas Sierra" className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 transition-all font-bold" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Área de Especialidad</label>
                <select name="tipoServicio" value={form.tipoServicio} onChange={handleChange} required className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 transition-all font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer">
                  <option value="">Seleccionar área...</option>
                  <option value="siembra">Siembra Profesional</option>
                  <option value="fumigación">Control de Plagas / Fumigación</option>
                  <option value="trilla">Cosecha y Trilla</option>
                  <option value="transporte">Logística y Transporte</option>
                  <option value="agrónomo">Asesoría Agronómica</option>
                  <option value="gestor">Gestión de Proyectos</option>
                  <option value="otros">Otros Servicios Técnicos</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Descripción de Metodología</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows="4" required placeholder="Detalle su flota de maquinaria, certificaciones y experiencia en el sector..." className="bg-surface-container-lowest p-6 rounded-2xl text-on-surface border border-outline-variant/50 outline-none focus:border-primary/50 transition-all resize-none font-medium leading-relaxed"></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Departamento</label>
                <select name="departamento" value={form.departamento} onChange={handleChange} required className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface border border-outline-variant/50 outline-none focus:border-primary/50 transition-all font-bold">
                  <option value="">Seleccionar departamento...</option>
                  {Object.keys(LOCALIDADES_POR_DEPTO).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Localidad</label>
                <select name="localidad" value={form.localidad} onChange={handleChange} disabled={!form.departamento} className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface border border-outline-variant/50 outline-none focus:border-primary/50 transition-all font-bold disabled:opacity-40">
                  <option value="">Seleccionar localidad...</option>
                  {localidadesDisponibles.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* CONTACTO */}
          <section className="p-10 bg-surface-container-high border-outline-variant/70 space-y-8 rounded-[2.5rem] border backdrop-blur-sm shadow-xl">
            <div className="border-b border-outline-variant/30 pb-4 mb-6">
              <h2 className="text-primary font-black text-[10px] uppercase tracking-[0.4em]">Canales de Enlace Directo</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">WhatsApp de Negocios</label>
                <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="Ej: +598 99..." className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface border border-outline-variant/50 outline-none focus:border-primary/50 transition-all font-black" />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Email Profesional</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="bg-surface-container-lowest p-5 rounded-2xl text-on-surface border border-outline-variant/50 outline-none focus:border-primary/50 transition-all font-black" />
              </div>
            </div>
          </section>

          {/* EVIDENCIA */}
          <section className="p-10 bg-surface-container-high border-outline-variant/70 space-y-8 rounded-[2.5rem] border backdrop-blur-sm shadow-xl">
            <div className="border-b border-outline-variant/30 pb-4 mb-6">
              <h2 className="text-primary font-black text-[10px] uppercase tracking-[0.4em]">Showcase de Operaciones</h2>
            </div>
            <label className="block w-full h-32 border-2 border-dashed border-outline-variant/50 rounded-[2rem] hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden group">
              <input type="file" accept="image/*" multiple onChange={handleFotos} className="hidden" />
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="text-3xl mb-1 text-primary"><span className="material-symbols-outlined">photo_camera</span></span>
                <span className="text-[9px] font-black text-on-surface uppercase tracking-widest">Añadir Evidencia Visual</span>
              </div>
            </label>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-8">
              {fotos.map((f, i) => (
                <div key={i} className="relative group h-20 rounded-xl overflow-hidden border border-outline-variant/50 shadow-lg">
                  <img src={URL.createObjectURL(f)} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => eliminarFoto(i)} className="absolute inset-0 bg-red-900/80 text-white font-black text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
              ))}
            </div>
          </section>

          <footer className="pt-8">
            <button type="submit" disabled={loading} className="machined-gradient text-on-tertiary-fixed w-full py-6 rounded-full font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-4 group">
              {loading ? "Indexando Perfil..." : <><span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">construction</span> DESPLEGAR EN LA RED</>}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}