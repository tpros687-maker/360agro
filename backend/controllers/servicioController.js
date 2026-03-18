import Proveedor from "../models/proveedorModel.js";
import User from "../models/userModel.js";
import Lote from "../models/lotModel.js";
import fs from "fs";
import path from "path";

/**
 * 🔥 Límites de publicaciones por plan globales (Lotes + Servicios)
 */
const limitePorPlan = {
  gratis: 5,
  basico: 5,
  pro: 10,
  empresa: Infinity,
};

/* =======================================================
    📌 OBTENER TODOS LOS SERVICIOS (Listado público con Buscador)
======================================================= */
export const obtenerServicios = async (req, res) => {
  try {
    const { q, search } = req.query;
    const queryTerm = q || search; // Soporta parámetros del Navbar y del Buscador local

    const proveedores = await Proveedor.find();

    // Blindaje con validación de existencia de 'servicios'
    let servicios = proveedores.flatMap((p) => {
      if (!p.servicios || !Array.isArray(p.servicios)) return [];
      
      return p.servicios.map((s) => ({
        ...s.toObject(),
        proveedorId: p._id,
        proveedorNombre: p.nombre,
        proveedorSlug: p.slug,
        zona: p.zona,
      }));
    });

    // 🔍 Lógica de filtrado para el Buscador Universal
    if (queryTerm) {
      const regex = new RegExp(queryTerm, "i");
      servicios = servicios.filter(s => 
        regex.test(s.nombre) || 
        regex.test(s.tipoServicio) || 
        regex.test(s.descripcion) ||
        regex.test(s.zona)
      );
    }

    res.status(200).json(servicios);
  } catch (error) {
    console.error("❌ ERROR obtenerServicios:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    📌 OBTENER MIS SERVICIOS (Dashboard)
======================================================= */
export const obtenerMiServicio = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({ usuario: req.user._id });

    if (!proveedor || !proveedor.servicios || proveedor.servicios.length === 0) {
        return res.status(200).json([]);
    }

    const servicios = proveedor.servicios.map(servicio => {
      const s = servicio.toObject();
      s.estadisticas = s.estadisticas || { visitas: 0, whatsapp: 0, telefono: 0, email: 0 };
      s.fotos = s.fotos || [];
      return s;
    });

    res.status(200).json(servicios);
  } catch (error) {
    console.error("❌ ERROR obtenerMisServicios:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    📌 OBTENER SERVICIO POR ID (Detalle con Contador)
======================================================= */
export const obtenerServicio = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({
      "servicios._id": req.params.id,
    });

    if (!proveedor)
      return res.status(404).json({ mensaje: "Servicio no encontrado" });

    const servicio = proveedor.servicios.id(req.params.id);

    // Incrementar visitas automáticamente al entrar al detalle
    servicio.estadisticas = servicio.estadisticas || { visitas: 0, whatsapp: 0, telefono: 0, email: 0 };
    servicio.estadisticas.visitas += 1;
    
    await proveedor.save();

    res.status(200).json({
      ...servicio.toObject(),
      proveedorNombre: proveedor.nombre,
      proveedorSlug: proveedor.slug,
      zona: proveedor.zona,
    });
  } catch (error) {
    console.error("❌ ERROR obtenerServicio:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    📌 REGISTRAR CLICK (Métricas WhatsApp/Email/Tel)
======================================================= */
export const registrarClick = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({
      "servicios._id": req.params.id,
    });

    if (!proveedor)
      return res.status(404).json({ mensaje: "Servicio no encontrado" });

    const servicio = proveedor.servicios.id(req.params.id);
    const { tipo } = req.params;

    servicio.estadisticas = servicio.estadisticas || { visitas: 0, whatsapp: 0, telefono: 0, email: 0 };

    if (servicio.estadisticas[tipo] === undefined)
      return res.status(400).json({ mensaje: "Tipo de click inválido" });

    servicio.estadisticas[tipo] += 1;
    await proveedor.save();

    res.status(200).json({ mensaje: "Métrica registrada" });
  } catch (error) {
    console.error("❌ ERROR registrarClick:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    📌 CREAR SERVICIO (Con Validación de Planes)
======================================================= */
export const crearServicio = async (req, res) => {
  try {
    let proveedor = await Proveedor.findOne({ usuario: req.user._id });

    if (!proveedor) {
      proveedor = await Proveedor.create({
        usuario: req.user._id,
        nombre: req.user.nombre,
        rubro: "servicio",
        tipoProveedor: "servicio",
        descripcion: "Perfil de servicios profesional",
        zona: req.body.zona || "No especificado",
        email: req.user.email,
        servicios: [],
      });
    }

    const lotesActivos = await Lote.countDocuments({ usuario: req.user._id });
    const serviciosActivos = proveedor.servicios ? proveedor.servicios.length : 0;
    const publicacionesTotales = lotesActivos + serviciosActivos;
    const limite = limitePorPlan[req.user.plan] || 5;

    if (publicacionesTotales >= limite) {
      return res.status(403).json({
        mensaje: `Tu plan (${req.user.plan}) permite máximo ${limite} publicaciones. Tienes ${publicacionesTotales}.`,
      });
    }

    if (req.user.plan === "gratis" || req.user.plan === "basico") {
      return res.status(403).json({
        mensaje: "Tu plan no permite registro de Servicios Profesionales. Mejora tu membresía."
      });
    }

    if (req.user.plan !== "empresa" && serviciosActivos >= 1) {
      return res.status(400).json({
        mensaje: "Para registrar múltiples servicios necesitas el Plan Empresa."
      });
    }

    proveedor.servicios.push({
      nombre: req.body.nombre,
      tipoServicio: req.body.tipoServicio,
      descripcion: req.body.descripcion,
      telefono: req.body.telefono || "",
      whatsapp: req.body.whatsapp || "",
      email: req.body.email || "",
      website: req.body.website || "",
      fotos: [],
      estadisticas: { visitas: 0, whatsapp: 0, telefono: 0, email: 0 },
    });

    if (proveedor.tipoProveedor === "tienda") {
      proveedor.tipoProveedor = "servicio"; 
    }

    await proveedor.save();
    res.status(201).json(proveedor.servicios[proveedor.servicios.length - 1]);

  } catch (error) {
    console.error("❌ Error crear servicio:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    📌 EDITAR SERVICIO
======================================================= */
export const editarServicio = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({ usuario: req.user._id });
    if (!proveedor) return res.status(404).json({ mensaje: "No tienes perfil de proveedor." });

    const servicio = proveedor.servicios.id(req.params.id);
    if (!servicio) return res.status(404).json({ mensaje: "Servicio no encontrado." });

    const campos = ["nombre", "tipoServicio", "descripcion", "telefono", "whatsapp", "email", "website", "zona"];
    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) servicio[campo] = req.body[campo];
    });

    await proveedor.save();
    res.status(200).json(servicio);
  } catch (error) {
    console.error("❌ ERROR editarServicio:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    📌 ELIMINAR SERVICIO
======================================================= */
export const eliminarServicio = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({ usuario: req.user._id });
    if (!proveedor) return res.status(404).json({ mensaje: "Perfil no encontrado." });

    const servicio = proveedor.servicios.id(req.params.id);
    if (!servicio) return res.status(404).json({ mensaje: "Servicio no encontrado." });

    // Borrado de archivos físicos
    servicio.fotos?.forEach((foto) => {
      const relative = foto.replace("/uploads/", "");
      const local = path.join("uploads", relative);
      if (fs.existsSync(local)) fs.unlinkSync(local);
    });

    servicio.deleteOne();
    await proveedor.save();

    res.status(200).json({ mensaje: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("❌ ERROR eliminarServicio:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    📌 SUBIR FOTOS
======================================================= */
export const subirFotosServicio = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({ usuario: req.user._id });
    if (!proveedor) return res.status(404).json({ mensaje: "Perfil no encontrado." });

    const servicio = proveedor.servicios.id(req.body.servicioId);
    if (!servicio) return res.status(404).json({ mensaje: "Servicio inexistente." });

    const nuevas = req.files.map(file => `/uploads/servicios/${file.filename}`);
    servicio.fotos.push(...nuevas);
    await proveedor.save();

    res.status(200).json({ mensaje: "Fotos subidas", fotos: servicio.fotos });
  } catch (error) {
    console.error("❌ ERROR subirFotosServicio:", error);
    res.status(500).json({ mensaje: error.message });
  }
};