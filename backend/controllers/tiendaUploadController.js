// backend/controllers/tiendaUploadController.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import Tienda from "../models/tiendaModel.js";
import { cloudinary, eliminarDeCloudinary } from "../config/cloudinary.js";

// ============= MULTER STORAGE (Cloudinary) =============
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "agro/tiendas",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ quality: "auto" }],
  },
});

export const upload = multer({ storage });

// =======================================================
// SUBIR LOGO
// =======================================================
export const subirLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ mensaje: "No enviaste logo" });

    const tienda = await Tienda.findOne({ usuario: req.user._id });
    if (!tienda) return res.status(404).json({ mensaje: "No tienes tienda" });

    // Borrar logo anterior si existe
    if (tienda.logo) {
      await eliminarDeCloudinary(tienda.logo);
    }

    tienda.logo = req.file.path;
    await tienda.save();

    res.json({ mensaje: "Logo actualizado", logo: tienda.logo });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// =======================================================
// ELIMINAR LOGO
// =======================================================
export const eliminarLogo = async (req, res) => {
  try {
    const tienda = await Tienda.findOne({ usuario: req.user._id });
    if (!tienda) return res.status(404).json({ mensaje: "No tienes tienda" });

    if (tienda.logo) {
      await eliminarDeCloudinary(tienda.logo);
    }

    tienda.logo = null;
    await tienda.save();

    res.json({ mensaje: "Logo eliminado" });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// =======================================================
// SUBIR FOTOS
// =======================================================
export const subirFotos = async (req, res) => {
  try {
    if (!req.files?.length)
      return res.status(400).json({ mensaje: "No enviaste fotos" });

    const tienda = await Tienda.findOne({ usuario: req.user._id });
    if (!tienda) return res.status(404).json({ mensaje: "No tienes tienda" });

    const nuevasRutas = req.files.map((f) => f.path);

    tienda.fotos.push(...nuevasRutas);
    await tienda.save();

    res.json({ mensaje: "Fotos subidas", fotos: tienda.fotos });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// =======================================================
// ELIMINAR FOTO
// =======================================================
export const eliminarFoto = async (req, res) => {
  try {
    const { ruta } = req.body;

    if (!ruta) return res.status(400).json({ mensaje: "Falta la ruta" });

    const tienda = await Tienda.findOne({ usuario: req.user._id });
    if (!tienda) return res.status(404).json({ mensaje: "No tienes tienda" });

    if (!tienda.fotos.includes(ruta))
      return res.status(400).json({ mensaje: "Foto no encontrada" });

    // Eliminar de Cloudinary
    await eliminarDeCloudinary(ruta);

    // Eliminar de Mongo
    tienda.fotos = tienda.fotos.filter((f) => f !== ruta);
    await tienda.save();

    res.json({ mensaje: "Foto eliminada" });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
