import Producto from "../models/productoModel.js";
import Proveedor from "../models/proveedorModel.js";
import fs from "fs";
import path from "path";

// =======================================================
// HELPERS
// =======================================================

// Busca la tienda (negocio) vinculada al usuario
const buscarProveedor = async (userId) => {
  return await Proveedor.findOne({ usuario: userId });
};

const borrarArchivoFisico = (rutaRelativa) => {
  if (!rutaRelativa) return;
  const cleanPath = rutaRelativa.startsWith('/uploads/') ? rutaRelativa.replace('/uploads/', '') : rutaRelativa;
  const localPath = path.join(process.cwd(), "uploads", cleanPath);

  if (fs.existsSync(localPath)) {
    fs.unlinkSync(localPath);
  }
};

// =======================================================
// 🔍 BUSCADOR GLOBAL DE PRODUCTOS (Insumos/Maquinaria)
// =======================================================
export const buscarProductosGlobal = async (req, res) => {
  try {
    const { q, search, categoria, zona, minPrecio, maxPrecio } = req.query;
    const queryTerm = q || search;

    let query = { activo: true };

    if (queryTerm) {
      query.$or = [
        { titulo: { $regex: queryTerm, $options: "i" } },
        { descripcion: { $regex: queryTerm, $options: "i" } },
        { categoria: { $regex: queryTerm, $options: "i" } },
      ];
    }

    if (categoria && categoria !== "Todas") {
      query.categoria = categoria;
    }

    if (minPrecio || maxPrecio) {
      query.precio = {};
      if (minPrecio) query.precio.$gte = Number(minPrecio);
      if (maxPrecio) query.precio.$lte = Number(maxPrecio);
    }

    // Traemos el producto con la info de la tienda que lo vende
    let productos = await Producto.find(query)
      .populate({
        path: "proveedor",
        select: "nombre zona slug logo whatsapp esVerificado rating"
      })
      .sort("-createdAt");

    // Filtro por zona del negocio
    if (zona && zona !== "Todas") {
      productos = productos.filter(p => p.proveedor && p.proveedor.zona === zona);
    }

    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// =======================================================
// 📌 CATÁLOGO ESPECÍFICO DE UNA TIENDA
// =======================================================
export const obtenerProductosPorTienda = async (req, res) => {
  try {
    const { slug } = req.params;
    const { q, search, categoria } = req.query;
    const queryTerm = q || search;

    const proveedor = await Proveedor.findOne({ slug });
    if (!proveedor) return res.status(404).json({ mensaje: "Tienda no encontrada" });

    let query = { proveedor: proveedor._id, activo: true };

    if (queryTerm) {
      query.$or = [
        { titulo: { $regex: queryTerm, $options: "i" } },
        { descripcion: { $regex: queryTerm, $options: "i" } },
      ];
    }

    if (categoria && categoria !== "Todas") {
      query.categoria = categoria;
    }

    const productos = await Producto.find(query).sort("-createdAt");
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

/**
 * 🔗 Obtener detalle de un producto específico
 */
export const obtenerProductoPorId = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).populate("proveedor", "nombre slug logo zona whatsapp esVerificado rating");
    if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// =======================================================
// OPERACIONES DE GESTIÓN (CRUD)
// =======================================================

export const crearProducto = async (req, res) => {
  try {
    const proveedor = await buscarProveedor(req.user._id);
    if (!proveedor) return res.status(404).json({ mensaje: "Primero debes configurar tu perfil de Tienda o Servicio" });
    const producto = await Producto.create({
      ...req.body,
      proveedor: proveedor._id,
      fotos: [],
      fotoPrincipal: null,
    });
    res.status(201).json(producto);
  } catch (error) {
    res.status(error.message.includes("perfil") ? 404 : 500).json({ mensaje: error.message });
  }
};

// ... (Las funciones de editar, eliminar y gestión de fotos se mantienen sólidas)

export const obtenerProductosProveedor = async (req, res) => {
  try {
    const proveedor = await buscarProveedor(req.user._id);
    if (!proveedor) return res.status(200).json([]);
    const productos = await Producto.find({ proveedor: proveedor._id }).sort("-createdAt");
    res.status(200).json(productos);
  } catch (error) {
    console.error("DEBUG - Fallo en obtenerProductosProveedor:", error);
    res.status(200).json([]);
  }
};

export const editarProducto = async (req, res) => {
  try {
    const proveedor = await buscarProveedor(req.user._id);
    const producto = await Producto.findOneAndUpdate(
      { _id: req.params.id, proveedor: proveedor._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });
    res.status(200).json(producto);
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

export const eliminarProducto = async (req, res) => {
  try {
    const proveedor = await buscarProveedor(req.user._id);
    const producto = await Producto.findOne({ _id: req.params.id, proveedor: proveedor._id });
    if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });
    producto.fotos.forEach(ruta => borrarArchivoFisico(ruta));
    await producto.deleteOne();
    res.status(200).json({ mensaje: "Producto eliminado" });
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

export const subirFotosProducto = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ mensaje: "No hay imágenes" });
    const proveedor = await buscarProveedor(req.user._id);
    const producto = await Producto.findOne({ _id: req.params.id, proveedor: proveedor._id });
    const nuevas = req.files.map(file => `/uploads/productos/${file.filename}`);
    producto.fotos.push(...nuevas);
    if (!producto.fotoPrincipal) producto.fotoPrincipal = nuevas[0];
    await producto.save();
    res.status(200).json(producto);
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

export const eliminarFotoProducto = async (req, res) => {
  try {
    const { ruta } = req.body;
    const proveedor = await buscarProveedor(req.user._id);
    const producto = await Producto.findOne({ _id: req.params.id, proveedor: proveedor._id });
    borrarArchivoFisico(ruta);
    producto.fotos = producto.fotos.filter(f => f !== ruta);
    if (producto.fotoPrincipal === ruta) producto.fotoPrincipal = producto.fotos[0] || null;
    await producto.save();
    res.status(200).json(producto);
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};

export const setFotoPrincipal = async (req, res) => {
  try {
    const { ruta } = req.body;
    const proveedor = await buscarProveedor(req.user._id);
    const producto = await Producto.findOneAndUpdate(
      { _id: req.params.id, proveedor: proveedor._id, fotos: ruta },
      { $set: { fotoPrincipal: ruta } },
      { new: true }
    );
    res.status(200).json({ fotoPrincipal: producto.fotoPrincipal });
  } catch (error) { res.status(500).json({ mensaje: error.message }); }
};