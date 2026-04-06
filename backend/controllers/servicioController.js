import Proveedor from "../models/proveedorModel.js";
import User from "../models/userModel.js";
import Lote from "../models/lotModel.js";
import fs from "fs";
import path from "path";

/**
 * 🔥 Límites de publicaciones por plan (Sincronizados)
 */
const limitePorPlan = {
  gratis: 0,
  basico: 5,
  productor: 5,
  bronce: 5,
  plata: 15,
  pro: Infinity,
  oro: Infinity,
  "élite pro": Infinity,
  empresa: Infinity,
};

/* =======================================================
    📌 OBTENER TODOS LOS SERVICIOS (CATÁLOGO GLOBAL)
    Estrategia: Flattening de todos los proveedores
======================================================= */
export const obtenerServicios = async (req, res) => {
  try {
    const { q, search } = req.query;
    const queryTerm = (q || search || "").trim();

    // Traemos todos los proveedores que tengan al menos un servicio registrado
    const proveedores = await Proveedor.find({
      servicios: { $exists: true, $not: { $size: 0 } }
    });

    // 🔥 FLATTENING: Extraemos y unificamos los servicios en un array plano
    let todosLosServicios = [];

    proveedores.forEach((p) => {
      if (p.servicios && Array.isArray(p.servicios)) {
        p.servicios.forEach((s) => {
          const servicioData = s.toObject();
          todosLosServicios.push({
            ...servicioData,
            proveedorId: p._id,
            proveedorNombre: p.nombre,
            proveedorSlug: p.slug,
            proveedorEsVerificado: p.esVerificado,
            proveedorRating: p.rating,
            // Priorizamos la zona del servicio, sino la del proveedor
            zona: servicioData.zona || p.zona || "Uruguay"
          });
        });
      }
    });

    // Filtro por búsqueda si existe
    if (queryTerm) {
      const regex = new RegExp(queryTerm, "i");
      todosLosServicios = todosLosServicios.filter(s =>
        regex.test(s.nombre) ||
        regex.test(s.tipoServicio) ||
        regex.test(s.descripcion) ||
        regex.test(s.zona)
      );
    }

    res.status(200).json(todosLosServicios);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    📌 OBTENER MIS SERVICIOS (PANEL DE CONTROL)
======================================================= */
export const obtenerMiServicio = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ mensaje: "No autorizado" });

    // Intentamos buscar el proveedor sin lean por si acaso
    const proveedor = await Proveedor.findOne({ usuario: req.user._id });

    if (!proveedor) {
      return res.status(200).json([]);
    }

    res.status(200).json(proveedor.servicios || []);
  } catch (error) {
    console.error("DEBUG - Fallo en obtenerMiServicio:", error);
    res.status(200).json([]); // Devolvemos vacío para no romper el panel
  }
};

/* =======================================================
    📌 OBTENER SERVICIO POR ID (DETALLE)
======================================================= */
export const obtenerServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const proveedor = await Proveedor.findOne({ "servicios._id": id });
    if (!proveedor) return res.status(404).json({ mensaje: "Servicio no encontrado" });

    const servicio = proveedor.servicios.id(id);

    // Sumar visita silenciosa
    servicio.estadisticas.visitas = (servicio.estadisticas.visitas || 0) + 1;
    await proveedor.save();

    res.status(200).json({
      ...servicio.toObject(),
      proveedorNombre: proveedor.nombre,
      proveedorSlug: proveedor.slug,
      proveedorWhatsapp: proveedor.whatsapp,
      proveedorTelefono: proveedor.telefono,
      proveedorEsVerificado: proveedor.esVerificado,
      proveedorRating: proveedor.rating,
      zona: servicio.zona || proveedor.zona
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    📌 CREAR SERVICIO (PROTOCOL "MATRIOSHKA")
======================================================= */
export const crearServicio = async (req, res) => {
  try {
    const body = req.body;
    let proveedor = await Proveedor.findOne({ usuario: req.user._id });

    // Si el usuario no tiene perfil de proveedor, lo creamos automáticamente
    if (!proveedor) {
      proveedor = await Proveedor.create({
        usuario: req.user._id,
        nombre: req.user.nombre || body.nombre,
        rubro: "Servicios Profesionales",
        tipoProveedor: "servicio",
        descripcion: body.descripcion || "Proveedor de servicios profesionales registrado en la red.",
        zona: body.zona || "No especificada",
        email: req.user.email,
        servicios: []
      });
    }

    // Validación de límites según plan
    const lotesActivos = await Lote.countDocuments({ usuario: req.user._id });
    const serviciosActivos = proveedor.servicios?.length || 0;
    const planUser = (req.user.plan || "gratis").toLowerCase();
    const limite = limitePorPlan[planUser] || 0;

    if (lotesActivos + serviciosActivos >= limite) {
      return res.status(403).json({
        mensaje: `Límite de publicaciones para el plan ${planUser.toUpperCase()} alcanzado. Actualiza tu plan para seguir publicando.`
      });
    }

    // Procesar fotos enviadas por Multer (upload.any())
    const fotos = req.files?.map(f => `/uploads/servicios/${f.filename}`) || [];

    const nuevoServicio = {
      nombre: body.nombre,
      tipoServicio: body.tipoServicio,
      descripcion: body.descripcion,
      telefono: body.telefono,
      whatsapp: body.whatsapp,
      email: body.email,
      zona: body.zona,
      fotos: fotos,
      estadisticas: { visitas: 0, whatsapp: 0, telefono: 0, email: 0 }
    };

    proveedor.servicios.push(nuevoServicio);
    await proveedor.save();

    // Devolver el último servicio creado
    res.status(201).json(proveedor.servicios[proveedor.servicios.length - 1]);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    📌 EDITAR SERVICIO
======================================================= */
export const editarServicio = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({ usuario: req.user._id });
    if (!proveedor) return res.status(404).json({ mensaje: "Perfil de proveedor no encontrado" });

    const servicio = proveedor.servicios.id(req.params.id);
    if (!servicio) return res.status(404).json({ mensaje: "Servicio no encontrado" });

    // Actualizamos campos de texto
    const { nombre, tipoServicio, descripcion, zona, telefono, whatsapp, email } = req.body;
    if (nombre) servicio.nombre = nombre;
    if (tipoServicio) servicio.tipoServicio = tipoServicio;
    if (descripcion) servicio.descripcion = descripcion;
    if (zona) servicio.zona = zona;
    if (telefono) servicio.telefono = telefono;
    if (whatsapp) servicio.whatsapp = whatsapp;
    if (email) servicio.email = email;

    // Agregar nuevas fotos si existen
    if (req.files && req.files.length > 0) {
      const nuevasFotos = req.files.map(f => `/uploads/servicios/${f.filename}`);
      servicio.fotos = [...servicio.fotos, ...nuevasFotos];
    }

    await proveedor.save();
    res.status(200).json(servicio);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    📌 ELIMINAR SERVICIO
======================================================= */
export const eliminarServicio = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({ usuario: req.user._id });
    if (!proveedor) return res.status(404).json({ mensaje: "No autorizado" });

    const servicio = proveedor.servicios.id(req.params.id);
    if (!servicio) return res.status(404).json({ mensaje: "No encontrado" });

    // Borrado físico de fotos
    servicio.fotos?.forEach(foto => {
      const fileName = path.basename(foto);
      const ruta = path.join(process.cwd(), "uploads", "servicios", fileName);
      if (fs.existsSync(ruta)) {
        try { fs.unlinkSync(ruta); } catch (e) { console.error("Error al borrar foto:", e); }
      }
    });

    proveedor.servicios.pull(req.params.id);
    await proveedor.save();

    res.status(200).json({ mensaje: "Servicio eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    📌 REGISTRAR MÉTRICAS DINÁMICAS (PUT)
======================================================= */
export const registrarClick = async (req, res) => {
  try {
    const { id, tipo } = req.params; // tipo: 'whatsapp', 'telefono', 'email'
    const proveedor = await Proveedor.findOne({ "servicios._id": id });
    if (!proveedor) return res.status(404).json({ mensaje: "Servicio no rastreable" });

    const servicio = proveedor.servicios.id(id);
    if (servicio && servicio.estadisticas[tipo] !== undefined) {
      servicio.estadisticas[tipo] += 1;
      await proveedor.save();
      return res.status(200).json({ mensaje: `Métrica ${tipo} actualizada` });
    }

    res.status(400).json({ mensaje: "Tipo de métrica inválido" });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    📌 CARGA EXTRA DE FOTOS (Mantenimiento)
======================================================= */
export const subirFotosServicio = async (req, res) => {
  try {
    const id = req.params.id || req.body.servicioId;

    // Buscamos el proveedor que contiene este servicio
    const proveedor = await Proveedor.findOne({ "servicios._id": id });
    if (!proveedor) return res.status(404).json({ mensaje: "Servicio no localizado en el sistema" });

    const servicio = proveedor.servicios.id(id);
    if (!servicio) return res.status(404).json({ mensaje: "Error al indexar el servicio dentro del proveedor" });

    const nuevasFotos = req.files?.map(f => `/uploads/servicios/${f.filename}`) || [];
    servicio.fotos.push(...nuevasFotos);

    await proveedor.save();
    res.status(200).json({ mensaje: "Galería actualizada", fotos: servicio.fotos });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};