// frontend/src/pages/PanelServicio.jsx
import { useState, useEffect } from "react";
import servicioApi from "../api/servicioApi";

import { BASE_URL } from "../api/axiosConfig";

export default function PanelServicio() {
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    nombre: "",
    tipoServicio: "",
    descripcion: "",
    zona: "",
    telefono: "",
    whatsapp: "",
    email: "",
    website: "",
  });

  const [nuevasFotos, setNuevasFotos] = useState([]);

  // --------------------------------------------------------------
  // Cargar datos iniciales
  // --------------------------------------------------------------
  const cargarDatos = async () => {
    try {
      const resp = await servicioApi.obtenerMiServicio();
      const data = resp.data;

      setServicio(data);

      setForm({
        nombre: data.nombre,
        tipoServicio: data.tipoServicio,
        descripcion: data.descripcion,
        zona: data.zona,
        telefono: data.telefono || "",
        whatsapp: data.whatsapp || "",
        email: data.email || "",
        website: data.website || "",
      });
    } catch (error) {
      console.error("❌ Error al cargar servicio:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // --------------------------------------------------------------
  // Guardar cambios (PUT)
  // --------------------------------------------------------------
  const guardarCambios = async () => {
    try {
      await servicioApi.editarServicio(servicio._id, form);
      alert("✅ Servicio actualizado correctamente");
    } catch (error) {
      alert("Error al actualizar servicio");
      console.error(error);
    }
  };

  // --------------------------------------------------------------
  // Subir fotos nuevas
  // --------------------------------------------------------------
  const handleFotos = (e) => {
    const arr = Array.from(e.target.files);
    setNuevasFotos((prev) => [...prev, ...arr]);
  };

  const subirFotos = async () => {
    if (nuevasFotos.length === 0) {
      alert("Selecciona imágenes primero");
      return;
    }

    try {
      const fd = new FormData();
      nuevasFotos.forEach((f) => fd.append("fotos", f));

      await servicioApi.subirFotos(fd);
      alert("📸 Fotos cargadas correctamente");

      cargarDatos(); // refrescar
      setNuevasFotos([]);
    } catch (error) {
      alert("Error al subir fotos");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600 text-lg mt-10">
        Cargando Panel...
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="text-center text-agro-tealDark text-lg mt-10">
        No tienes un servicio creado.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 fade-in">
      <h1 className="text-3xl font-bold text-agro-tealDark text-center mb-8">
        ⚙️ Panel de Servicio
      </h1>

      <div className="bg-white p-8 rounded-2xl shadow border border-agro-teal/20">

        {/* FORMULARIO */}
        <h2 className="text-xl font-bold text-agro-tealDark mb-4">
          📝 Información del Servicio
        </h2>

        <div className="space-y-4">
          <input
            className="w-full border rounded-lg p-3"
            name="nombre"
            placeholder="Nombre del Servicio"
            value={form.nombre}
            onChange={handleChange}
          />

          <input
            className="w-full border rounded-lg p-3"
            name="tipoServicio"
            placeholder="Tipo de Servicio (Ej: Fumigación, Trilla, Asesoría...)"
            value={form.tipoServicio}
            onChange={handleChange}
          />

          <textarea
            className="w-full border rounded-lg p-3"
            rows="4"
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
          ></textarea>

          <input
            className="w-full border rounded-lg p-3"
            name="zona"
            placeholder="Zona"
            value={form.zona}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              className="border rounded-lg p-3"
              name="telefono"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={handleChange}
            />

            <input
              className="border rounded-lg p-3"
              name="whatsapp"
              placeholder="WhatsApp"
              value={form.whatsapp}
              onChange={handleChange}
            />

            <input
              className="border rounded-lg p-3"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />

            <input
              className="border rounded-lg p-3"
              name="website"
              placeholder="Sitio Web (opcional)"
              value={form.website}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          onClick={guardarCambios}
          className="mt-6 w-full bg-agro-teal hover:bg-agro-tealDark text-white py-3 rounded-xl font-bold transition"
        >
          <span className="material-symbols-outlined text-sm">save</span> Guardar Cambios
        </button>

        {/* FOTOS */}
        <h2 className="text-xl font-bold text-agro-tealDark mt-10 mb-4">
          <span className="material-symbols-outlined text-sm">photo_camera</span> Galería de Fotos
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {servicio.fotos?.map((foto, i) => (
            <img
              key={i}
              src={/^https?:\/\//.test(foto?.trim()) ? foto.trim() : `${BASE_URL}${foto}`}
              className="w-full h-32 object-cover rounded-xl border shadow-sm"
            />
          ))}
        </div>

        <label className="font-semibold">Agregar nuevas fotos</label>
        <input
          type="file"
          multiple
          accept="image/*"
          className="w-full border p-3 rounded-lg mt-2"
          onChange={handleFotos}
        />

        <button
          onClick={subirFotos}
          className="mt-4 w-full bg-agro-tealDark hover:bg-agro-teal text-white py-3 rounded-xl font-bold transition"
        >
          📤 Subir Fotos
        </button>
      </div>
    </div>
  );
}
