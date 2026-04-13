import Tienda from "../models/tiendaModel.js";
import User from "../models/userModel.js";

/* =======================================================
   OBTENER TODAS LAS TIENDAS
======================================================= */
export const obtenerTiendas = async (req, res) => {
  try {
    const tiendas = await Tienda.find().populate("usuario", "nombre email plan");
    res.status(200).json(tiendas);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
   OBTENER TIENDA PROPIA
======================================================= */
export const obtenerMiTienda = async (req, res) => {
  try {
    const tienda = await Tienda.findOne({ usuario: req.user._id })
      .populate("productos")
      .populate("usuario", "nombre email plan");

    if (!tienda)
      return res.status(404).json({ mensaje: "Aún no tienes una tienda creada." });

    res.status(200).json(tienda);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
   OBTENER TIENDA POR ID + SUMAR VISITA
======================================================= */
export const obtenerTienda = async (req, res) => {
  try {
    const tienda = await Tienda.findById(req.params.id)
      .populate("productos")
      .populate("usuario", "nombre email");

    if (!tienda)
      return res.status(404).json({ mensaje: "Tienda no encontrada." });

    tienda.estadisticas.visitas += 1;
    await tienda.save();

    res.status(200).json(tienda);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
   CREAR TIENDA (solo plan empresa)
======================================================= */
export const crearTienda = async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id);

    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });

    if (usuario.plan !== "empresa") {
      return res.status(403).json({ mensaje: "Solo el Plan Empresa puede crear tienda." });
    }

    const existe = await Tienda.findOne({ usuario: req.user._id });
    if (existe) {
      return res.status(400).json({ mensaje: "Ya tienes una tienda creada." });
    }

    const tienda = await Tienda.create({
      usuario: req.user._id,
      nombre: req.body.nombre,
      categoria: req.body.categoria,
      descripcion: req.body.descripcion,
      zona: req.body.zona,
      telefono: req.body.telefono,
      whatsapp: req.body.whatsapp,
      email: req.body.email,
      website: req.body.website,
      logo: null,
      fotos: [],
    });

    res.status(201).json(tienda);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
   EDITAR TIENDA
======================================================= */
export const editarTienda = async (req, res) => {
  try {
    const tienda = await Tienda.findOne({
      _id: req.params.id,
      usuario: req.user._id,
    });

    if (!tienda)
      return res.status(404).json({ mensaje: "Tienda no encontrada" });

    const campos = [
      "nombre",
      "categoria",
      "descripcion",
      "zona",
      "telefono",
      "whatsapp",
      "email",
      "website",
      "logo",
      "fotos",
    ];

    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) tienda[campo] = req.body[campo];
    });

    await tienda.save();
    res.status(200).json(tienda);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/* =======================================================
   ELIMINAR TIENDA
======================================================= */
export const eliminarTienda = async (req, res) => {
  try {
    const tienda = await Tienda.findOne({
      _id: req.params.id,
      usuario: req.user._id,
    });

    if (!tienda)
      return res.status(404).json({ mensaje: "Tienda no encontrada" });

    await tienda.deleteOne();

    res.status(200).json({ mensaje: "Tienda eliminada" });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
