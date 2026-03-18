import Lote from "../models/lotModel.js";
import User from "../models/userModel.js";
import TempUpload from "../models/tempUploadModel.js";
import Proveedor from "../models/proveedorModel.js";

const limitePorPlan = {
  gratis: 2,
  bronce: 5,
  plata: 15,
  oro: Infinity,
  empresa: Infinity,
};

/* --- MÉTODOS DE ARCHIVOS --- */

export const subirFotosTemporales = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ mensaje: "No hay fotos" });
    const rutas = req.files.map((file) => `/uploads/${file.filename}`);
    let temp = await TempUpload.findOneAndUpdate(
      { usuario: req.user._id },
      { $push: { fotos: { $each: rutas } } },
      { upsert: true, new: true }
    );
    res.status(200).json({ fotos: temp.fotos });
  } catch (error) { res.status(500).json({ mensaje: "Error en imágenes" }); }
};

export const subirVideoTemporal = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ mensaje: "No hay video" });
    const rutaVideo = `/uploads/${req.file.filename}`;
    let temp = await TempUpload.findOneAndUpdate(
      { usuario: req.user._id },
      { video: rutaVideo },
      { upsert: true, new: true }
    );
    res.status(200).json({ video: temp.video });
  } catch (error) { res.status(500).json({ mensaje: "Error en video" }); }
};

/* --- MÉTODOS DE LOTE --- */

export const crearLote = async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id);
    const planUser = usuario.plan?.toLowerCase() || "gratis";
    const limite = limitePorPlan[planUser] || 2;

    const lotesActivos = await Lote.countDocuments({ usuario: usuario._id });
    const proveedor = await Proveedor.findOne({ usuario: usuario._id });
    const serviciosActivos = proveedor ? proveedor.servicios.length : 0;

    if (lotesActivos + serviciosActivos >= limite) {
      return res.status(403).json({ mensaje: `Límite alcanzado (${limite} activos).` });
    }

    const temp = await TempUpload.findOne({ usuario: req.user._id });
    const fotos = temp?.fotos || [];
    const video = temp?.video || null;

    const nuevoLote = await Lote.create({
      ...req.body,
      fotos,
      video,
      usuario: req.user._id,
      destacado: ["oro", "empresa"].includes(planUser) && req.body.destacado
    });

    if (temp) await temp.deleteOne();
    res.status(201).json(nuevoLote);
  } catch (error) { res.status(500).json({ mensaje: "Error al crear lote" }); }
};

// 🔍 OPTIMIZADO: Obtener todos los lotes con soporte para Buscador Universal
export const obtenerLotes = async (req, res) => {
  try {
    const { q, search, categoria } = req.query;
    const queryTerm = q || search;

    let filtro = {};

    // Si hay término de búsqueda, filtramos por campos clave
    if (queryTerm) {
      filtro.$or = [
        { titulo: { $regex: queryTerm, $options: "i" } },
        { categoria: { $regex: queryTerm, $options: "i" } },
        { raza: { $regex: queryTerm, $options: "i" } },
        { descripcion: { $regex: queryTerm, $options: "i" } }
      ];
    }

    // Filtro por categoría específica (si viene del explorador)
    if (categoria && categoria !== "Todas") {
      filtro.categoria = categoria;
    }

    const lotes = await Lote.find(filtro)
      .sort("-createdAt")
      .populate("usuario", "nombre plan");

    res.status(200).json(lotes);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener mercado de hacienda" });
  }
};

export const obtenerLotePorId = async (req, res) => {
  try {
    const lote = await Lote.findByIdAndUpdate(
      req.params.id,
      { $inc: { "estadisticas.visitas": 1 } },
      { new: true }
    ).populate("usuario", "nombre plan email");

    if (!lote) return res.status(404).json({ mensaje: "Lote no encontrado" });
    res.status(200).json(lote);
  } catch (error) { res.status(500).json({ mensaje: "Error al obtener detalle" }); }
};

export const editarLote = async (req, res) => {
  try {
    const lote = await Lote.findById(req.params.id);
    if (!lote) return res.status(404).json({ mensaje: "Lote no encontrado" });
    if (lote.usuario.toString() !== req.user._id.toString()) return res.status(403).json({ mensaje: "No autorizado" });

    const loteActualizado = await Lote.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(loteActualizado);
  } catch (error) { res.status(500).json({ mensaje: "Error al editar" }); }
};

export const registrarInteraccionLote = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.body;
    if (!['whatsapp', 'contactos'].includes(tipo)) return res.status(400).json({ mensaje: "Tipo inválido" });

    const campo = `estadisticas.${tipo}`;
    await Lote.findByIdAndUpdate(id, { $inc: { [campo]: 1 } });
    res.status(200).json({ mensaje: "Métrica registrada" });
  } catch (error) { res.status(500).json({ mensaje: "Error en métricas" }); }
};

export const obtenerMisLotes = async (req, res) => {
  try {
    const lotes = await Lote.find({ usuario: req.user._id }).sort("-createdAt");
    res.status(200).json(lotes);
  } catch (error) { res.status(500).json({ mensaje: "Error al obtener tus activos" }); }
};

export const eliminarLote = async (req, res) => {
  try {
    const lote = await Lote.findById(req.params.id);
    if (!lote) return res.status(404).json({ mensaje: "No encontrado" });
    if (lote.usuario.toString() !== req.user._id.toString()) return res.status(403).send();
    await lote.deleteOne();
    res.status(200).json({ mensaje: "Eliminado" });
  } catch (error) { res.status(500).json({ mensaje: "Error al eliminar" }); }
};