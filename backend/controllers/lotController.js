import Lote from "../models/lotModel.js";
import User from "../models/userModel.js";
import TempUpload from "../models/tempUploadModel.js";
import Proveedor from "../models/proveedorModel.js";
import Expense from "../models/expenseModel.js";
import { puedePublicarLote } from "../config/planes.js";

/* --- MÉTODOS DE ARCHIVOS --- */

export const subirFotosTemporales = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ mensaje: "No hay fotos" });
    const rutas = req.files.map((file) => file.path);
    let temp = await TempUpload.findOneAndUpdate(
      { usuario: req.user._id },
      { $push: { fotos: { $each: rutas } } },
      { upsert: true, new: true }
    );
    res.status(200).json({ fotos: temp.fotos });
  } catch (error) {
    console.error("Error en subirFotosTemporales:", error);
    res.status(500).json({ mensaje: "Error en imágenes" });
  }
};

export const subirVideoTemporal = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ mensaje: "No hay video" });
    const rutaVideo = req.file.path;
    let temp = await TempUpload.findOneAndUpdate(
      { usuario: req.user._id },
      { video: rutaVideo },
      { upsert: true, new: true }
    );
    res.status(200).json({ video: temp.video });
  } catch (error) {
    console.error("Error en subirVideoTemporal:", error);
    res.status(500).json({ mensaje: "Error en video" });
  }
};

/* --- MÉTODOS DE LOTE --- */

export const crearLote = async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id);
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const lotesActivos = await Lote.countDocuments({ usuario: usuario._id });
    if (!puedePublicarLote(usuario.plan, lotesActivos)) {
      return res.status(403).json({ mensaje: "Límite de lotes alcanzado para tu plan." });
    }

    const planUser = usuario.plan?.toLowerCase() || "observador";

    // ✅ REPARACIÓN CRÍTICA: Aseguramos que body exista antes de leer propiedades
    const body = req.body || {};

    const temp = await TempUpload.findOne({ usuario: req.user._id });

    // 🔥 UNIFICACIÓN: Si no hay temp, usamos los que vienen directo en el body (Multer)
    let fotos = temp?.fotos || [];
    let video = temp?.video || null;

    if (fotos.length === 0 && req.files) {
      fotos = req.files
        .filter(f => f.fieldname === "fotos")
        .map(f => `/uploads/lotes/${f.filename}`);
    }

    if (!video && req.files) {
      const vFile = req.files.find(f => f.fieldname === "video");
      if (vFile) video = `/uploads/lotes/${vFile.filename}`;
    }

    // --- NUEVO: DOCUMENTACIÓN OFICIAL ---
    let documentoPropiedad = null;
    let certificadoSanitario = null;
    if (req.files) {
      const propFile = req.files.find(f => f.fieldname === "documentoPropiedad");
      if (propFile) documentoPropiedad = `/uploads/lotes/${propFile.filename}`;

      const sanFile = req.files.find(f => f.fieldname === "certificadoSanitario");
      if (sanFile) certificadoSanitario = `/uploads/lotes/${sanFile.filename}`;
    }

    // CREACIÓN DEL LOTE
    const nuevoLote = new Lote({
      ...body,
      fotos,
      video,
      documentoPropiedad,
      certificadoSanitario,
      numeroDicose: body.numeroDicose || null,
      usuario: req.user._id,
      departamento: body.departamento || null,
      localidad: body.localidad || null,
      ubicacion: body.ubicacion || `${body.localidad || ""}, ${body.departamento || ""}`.trim().replace(/^,\s*/, ""),
      // Manejamos el booleano que viene de FormData (que llega como string)
      destacado: ["pro", "empresa"].includes(planUser) && (body.destacado === "true" || body.destacado === true)
    });

    await nuevoLote.save();

    if (temp) {
      await TempUpload.deleteOne({ usuario: req.user._id });
    }

    res.status(201).json(nuevoLote);
  } catch (error) {
    console.error("DETALLE ERROR 500 CREAR LOTE:", error);
    res.status(500).json({ mensaje: "Error al crear lote", detalle: error.message });
  }
};

export const obtenerLotes = async (req, res) => {
  try {
    const { q, search, categoria } = req.query;
    const queryTerm = q || search;
    let filtro = { estado: { $ne: "Vendido" } };

    if (queryTerm) {
      filtro.$or = [
        { titulo: { $regex: queryTerm, $options: "i" } },
        { categoria: { $regex: queryTerm, $options: "i" } },
        { raza: { $regex: queryTerm, $options: "i" } },
        { descripcion: { $regex: queryTerm, $options: "i" } }
      ];
    }

    if (categoria && categoria !== "Todas") {
      filtro.categoria = { $regex: categoria, $options: "i" };
    }

    const deptoFiltro = req.query.departamento;
    if (deptoFiltro) {
      filtro.$or = [
        { departamento: { $regex: deptoFiltro, $options: "i" } },
        { ubicacion: { $regex: deptoFiltro, $options: "i" } }
      ];
    }

    const lotes = await Lote.find(filtro)
      .sort("-createdAt")
      .populate("usuario", "nombre plan esVerificado rating");

    res.status(200).json(lotes);
  } catch (error) {
    console.error("Error obtenerLotes:", error);
    res.status(500).json({ mensaje: "Error al obtener mercado" });
  }
};

export const obtenerLotePorId = async (req, res) => {
  try {
    const lote = await Lote.findByIdAndUpdate(
      req.params.id,
      { $inc: { "estadisticas.visitas": 1 } },
      { new: true }
    ).populate("usuario", "nombre plan email esVerificado rating");

    if (!lote) return res.status(404).json({ mensaje: "Lote no encontrado" });
    res.status(200).json(lote);
  } catch (error) {
    console.error("Error obtenerLotePorId:", error);
    res.status(500).json({ mensaje: "Error al obtener detalle" });
  }
};

export const editarLote = async (req, res) => {
  try {
    const body = req.body || {};
    const lote = await Lote.findById(req.params.id);
    if (!lote) return res.status(404).json({ mensaje: "Lote no encontrado" });
    if (lote.usuario.toString() !== req.user._id.toString()) return res.status(403).json({ mensaje: "No autorizado" });

    const loteActualizado = await Lote.findByIdAndUpdate(
      req.params.id,
      { $set: body },
      { new: true }
    );
    res.status(200).json(loteActualizado);
  } catch (error) {
    console.error("Error editarLote:", error);
    res.status(500).json({ mensaje: "Error al editar" });
  }
};

export const registrarInteraccionLote = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const { tipo } = body;
    if (!['whatsapp', 'contactos'].includes(tipo)) return res.status(400).json({ mensaje: "Tipo inválido" });

    const campo = `estadisticas.${tipo}`;
    await Lote.findByIdAndUpdate(id, { $inc: { [campo]: 1 } });
    res.status(200).json({ mensaje: "Métrica registrada" });
  } catch (error) {
    console.error("Error métricas:", error);
    res.status(500).json({ mensaje: "Error en métricas" });
  }
};

export const obtenerMisLotes = async (req, res) => {
  try {
    const lotes = await Lote.find({ usuario: req.user._id }).sort("-createdAt");
    res.status(200).json(lotes);
  } catch (error) {
    console.error("Error obtenerMisLotes:", error);
    res.status(500).json({ mensaje: "Error al obtener tus activos" });
  }
};

export const eliminarLote = async (req, res) => {
  try {
    const lote = await Lote.findById(req.params.id);
    if (!lote) return res.status(404).json({ mensaje: "No encontrado" });
    if (lote.usuario.toString() !== req.user._id.toString()) return res.status(403).send();
    await Expense.create({
      usuario: lote.usuario,
      fecha: new Date(),
      categoria: "Venta de Ganado",
      descripcion: `Lote cerrado: ${lote.titulo}`,
      monto: lote.precio || 0,
      lote: lote._id,
      estado: "Pagado",
    });
    await lote.deleteOne();
    res.status(200).json({ mensaje: "Eliminado" });
  } catch (error) {
    console.error("Error eliminarLote:", error);
    res.status(500).json({ mensaje: "Error al eliminar" });
  }
};