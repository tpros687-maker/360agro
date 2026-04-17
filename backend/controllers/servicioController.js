import Servicio from "../models/servicioModel.js";
import Lote from "../models/lotModel.js";

const limitePorPlan = {
  observador: 0,
  productor: 3,
  pro: Infinity,
  empresa: Infinity,
};

/* =======================================================
    OBTENER TODOS LOS SERVICIOS (CATÁLOGO GLOBAL)
======================================================= */
export const obtenerServicios = async (req, res) => {
  try {
    const { q, search } = req.query;
    const queryTerm = (q || search || "").trim();
    let query = { activo: true };

    if (queryTerm) {
      const regex = new RegExp(queryTerm, "i");
      query.$or = [
        { nombre: regex },
        { tipoServicio: regex },
        { descripcion: regex },
        { zona: regex },
      ];
    }

    const servicios = await Servicio.find(query)
      .populate("usuario", "nombre _id")
      .sort("-createdAt");

    res.status(200).json(servicios);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    OBTENER MIS SERVICIOS (PANEL DE CONTROL)
======================================================= */
export const obtenerMiServicio = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ mensaje: "No autorizado" });
    const servicios = await Servicio.find({ usuario: req.user._id }).sort("-createdAt");
    res.status(200).json(servicios);
  } catch (error) {
    res.status(200).json([]);
  }
};

/* =======================================================
    OBTENER SERVICIO POR ID (DETALLE)
======================================================= */
export const obtenerServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id).populate("usuario", "nombre _id");
    if (!servicio) return res.status(404).json({ mensaje: "Servicio no encontrado" });

    await Servicio.updateOne({ _id: servicio._id }, { $inc: { "estadisticas.visitas": 1 } });

    res.status(200).json({
      ...servicio.toObject(),
      proveedorNombre: servicio.usuario?.nombre,
      proveedorUsuarioId: servicio.usuario?._id,
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    CREAR SERVICIO
======================================================= */
export const crearServicio = async (req, res) => {
  try {
    const body = req.body;
    const planUser = (req.user.plan || "observador").toLowerCase();
    const limite = limitePorPlan[planUser] ?? 0;

    if (limite === 0) {
      return res.status(403).json({
        mensaje: "Tu plan actual no permite publicar servicios. Actualiza tu suscripción.",
      });
    }

    if (limite !== Infinity) {
      const [lotesActivos, serviciosActivos] = await Promise.all([
        Lote.countDocuments({ usuario: req.user._id }),
        Servicio.countDocuments({ usuario: req.user._id }),
      ]);
      if (lotesActivos + serviciosActivos >= limite) {
        return res.status(403).json({
          mensaje: `Límite de publicaciones para el plan ${planUser.toUpperCase()} alcanzado. Actualiza tu plan.`,
        });
      }
    }

    const fotos = req.files?.map((f) => f.path) || [];

    const servicio = await Servicio.create({
      usuario: req.user._id,
      nombre: body.nombre,
      tipoServicio: body.tipoServicio,
      descripcion: body.descripcion,
      zona: body.zona,
      departamento: body.departamento,
      localidad: body.localidad,
      telefono: body.telefono,
      whatsapp: body.whatsapp,
      email: body.email,
      website: body.website,
      fotos,
    });

    res.status(201).json(servicio);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    EDITAR SERVICIO
======================================================= */
export const editarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!servicio) return res.status(404).json({ mensaje: "Servicio no encontrado" });

    const campos = [
      "nombre", "tipoServicio", "descripcion", "zona",
      "departamento", "localidad", "telefono", "whatsapp", "email", "website",
    ];
    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) servicio[campo] = req.body[campo];
    });

    if (req.files && req.files.length > 0) {
      const nuevasFotos = req.files.map((f) => f.path);
      servicio.fotos = [...servicio.fotos, ...nuevasFotos];
    }

    await servicio.save();
    res.status(200).json(servicio);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    ELIMINAR SERVICIO
======================================================= */
export const eliminarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!servicio) return res.status(404).json({ mensaje: "No autorizado" });
    await servicio.deleteOne();
    res.status(200).json({ mensaje: "Servicio eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    REGISTRAR MÉTRICAS
======================================================= */
export const registrarClick = async (req, res) => {
  try {
    const { id, tipo } = req.params;
    await Servicio.updateOne({ _id: id }, { $inc: { [`estadisticas.${tipo}`]: 1 } });
    res.status(200).json({ mensaje: `Métrica ${tipo} actualizada` });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
    CARGA EXTRA DE FOTOS
======================================================= */
export const subirFotosServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findOne({ _id: req.params.id, usuario: req.user._id });
    if (!servicio) return res.status(404).json({ mensaje: "Servicio no localizado" });

    const nuevasFotos = req.files?.map((f) => f.path) || [];
    servicio.fotos.push(...nuevasFotos);
    await servicio.save();

    res.status(200).json({ mensaje: "Galería actualizada", fotos: servicio.fotos });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
