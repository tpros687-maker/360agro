import fs from "fs";
import path from "path";
import Proveedor from "../models/proveedorModel.js";
import slugify from "slugify";
import mongoose from "mongoose";
import { puedeTenerTienda } from "../config/planes.js";

// Helper para borrar archivos físicos
const borrarArchivoFisico = (ruta) => {
  if (!ruta) return;
  const cleanPath = ruta.startsWith('/uploads/') ? ruta.replace('/uploads/', '') : ruta;
  const localPath = path.join(process.cwd(), "uploads", cleanPath);
  if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
};

// ==========================
//   PANEL DE VENDEDOR (PROPIO)
// ==========================
export const obtenerMiProveedor = async (req, res) => {
  try {
    const { tipo } = req.query;
    const filtro = { usuario: req.user._id };
    if (tipo) filtro.tipoProveedor = tipo;

    const proveedor = await Proveedor.findOne(filtro).populate("misProductos");

    if (!proveedor) {
      return res.status(200).json({ mensaje: "No tienes un perfil configurado", noExiste: true });
    }

    res.json(proveedor);
  } catch (error) {
    console.error(`❌ Error en obtenerMiProveedor: ${error.message}`);
    res.status(500).json({ mensaje: error.message });
  }
};

// ==========================
//   LISTADO PÚBLICO DE TIENDAS
// ==========================
export const obtenerProveedores = async (req, res) => {
  try {
    const { tipo, rubro, zona, search } = req.query;
    let query = {};
    if (tipo) {
      query.tipoProveedor = tipo;
    }
    if (rubro) query.rubro = rubro;
    if (zona) query.zona = zona;

    if (search) {
      query.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { rubro: { $regex: search, $options: "i" } },
        { zona: { $regex: search, $options: "i" } }
      ];
    }

    const proveedores = await Proveedor.find(query).sort("-createdAt");
    res.json(proveedores);
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

export const obtenerProveedorPorSlug = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({ slug: req.params.slug }).populate("misProductos");
    if (!proveedor) return res.status(404).json({ mensaje: "Negocio no encontrado" });
    await Proveedor.updateOne({ _id: proveedor._id }, { $inc: { "estadisticas.visitas": 1 } });
    res.json(proveedor);
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

export const obtenerProveedor = async (req, res) => {
  try {
    const proveedor = await Proveedor.findById(req.params.id).populate("misProductos");
    if (!proveedor) return res.status(404).json({ mensaje: "Negocio no encontrado" });
    res.json(proveedor);
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

// ==========================
//   CRUD DE NEGOCIO
// ==========================
export const crearProveedor = async (req, res) => {
  try {
    const usuario = req.user; // Obtenido por el middleware 'proteger'

    if (!puedeTenerTienda(req.user.plan)) {
      return res.status(403).json({ mensaje: "Tu plan no incluye acceso a tienda. Necesitás el plan Pro o Empresa." });
    }

    const tipoProveedor = req.body.tipoProveedor || "tienda";
    const existe = await Proveedor.findOne({ usuario: req.user._id, tipoProveedor });

    if (existe) {
      return res.status(200).json(existe);
    }

    const datos = {
      ...req.body,
      usuario: req.user._id,
      tipoProveedor,
    };

    // 📸 PROCESAMIENTO DE ARCHIVOS (Logo y Fotos) — f.path = URL Cloudinary
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        datos.logo = req.files.logo[0].path;
      }
      if (req.files.fotos) {
        datos.fotos = req.files.fotos.map(f => f.path);
      }
    }

    const proveedor = await Proveedor.create(datos);
    console.log(`🆕 Proveedor creado: ${proveedor.nombre} (Plan: ${usuario.plan})`);
    res.status(201).json(proveedor);
  } catch (error) {
    console.error(`❌ Error en crearProveedor: ${error.message}`);
    res.status(500).json({ mensaje: error.message });
  }
};

export const editarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "ID de proveedor no válido" });
    }

    const proveedor = await Proveedor.findOneAndUpdate(
      { _id: id, usuario: req.user._id },
      { $set: req.body },
      { new: true }
    );

    if (!proveedor) return res.status(404).json({ mensaje: "Perfil no encontrado" });
    res.json(proveedor);
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

// --- FUNCIÓN QUE FALTABA PARA LAS RUTAS ---
export const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "ID de proveedor no válido" });
    }

    const proveedor = await Proveedor.findOne({ _id: id, usuario: req.user._id });
    if (!proveedor) return res.status(404).json({ mensaje: "Perfil no encontrado" });

    if (proveedor.logo) borrarArchivoFisico(proveedor.logo);
    proveedor.fotos.forEach(f => borrarArchivoFisico(f));

    await proveedor.deleteOne();
    res.json({ mensaje: "Perfil de negocio eliminado exitosamente" });
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

// ==========================
//   GESTIÓN DE LOGO Y FOTOS
// ==========================
export const subirLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ mensaje: "No hay archivo" });
    const proveedor = await Proveedor.findOne({ usuario: req.user._id });
    if (proveedor.logo) borrarArchivoFisico(proveedor.logo);
    proveedor.logo = `/uploads/proveedores/${req.file.filename}`;
    await proveedor.save();
    res.json({ logo: proveedor.logo });
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

export const eliminarLogoProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "ID de proveedor no válido" });
    }

    const proveedor = await Proveedor.findOne({ _id: id, usuario: req.user._id });
    if (!proveedor) return res.status(404).json({ mensaje: "Perfil no encontrado" });

    if (proveedor.logo) borrarArchivoFisico(proveedor.logo);
    proveedor.logo = null;
    await proveedor.save();
    res.json({ mensaje: "Logo eliminado" });
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

export const subirFotosProveedor = async (req, res) => {
  try {
    if (!req.files) return res.status(400).json({ mensaje: "No hay archivos" });
    const proveedor = await Proveedor.findOne({ usuario: req.user._id });
    const rutas = req.files.map(f => `/uploads/proveedores/${f.filename}`);
    proveedor.fotos.push(...rutas);
    await proveedor.save();
    res.json(proveedor.fotos);
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

export const eliminarFotoProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ mensaje: "ID de proveedor no válido" });
    }

    const { ruta } = req.body;
    const proveedor = await Proveedor.findOne({ _id: id, usuario: req.user._id });
    if (!proveedor) return res.status(404).json({ mensaje: "Perfil no encontrado" });

    borrarArchivoFisico(ruta);
    proveedor.fotos = proveedor.fotos.filter(f => f !== ruta);
    await proveedor.save();
    res.json(proveedor.fotos);
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

export const registrarClick = async (req, res) => {
  try {
    const { slug, tipo } = req.params;
    await Proveedor.updateOne({ slug }, { $inc: { [`estadisticas.${tipo}`]: 1 } });
    res.json({ mensaje: "Click registrado" });
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};