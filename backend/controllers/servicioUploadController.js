import Proveedor from "../models/proveedorModel.js";
import path from "path";
import fs from "fs";

// =============================================
//  SUBIR FOTOS DE SERVICIO
// =============================================
export const subirFotosServicio = async (req, res) => {
  try {
    const proveedor = await Proveedor.findOne({ usuario: req.user._id });

    if (!proveedor) {
      return res.status(404).json({ mensaje: "Proveedor no encontrado" });
    }

    const servicio = proveedor.servicios[0];
    if (!servicio) {
      return res.status(404).json({ mensaje: "Debes crear un servicio antes" });
    }

    // Siempre guardar con el formato correcto:
    //  /uploads/servicios/archivo.jpg
    const nuevasRutas = req.files.map((file) => {
      return `/uploads/servicios/${file.filename}`;
    });

    servicio.fotos.push(...nuevasRutas);
    await proveedor.save();

    return res.status(200).json({
      mensaje: "Fotos subidas correctamente",
      fotos: servicio.fotos,
    });
  } catch (error) {
    return res.status(500).json({ mensaje: error.message });
  }
};

// =============================================
//  ELIMINAR FOTO
// =============================================
// =============================================
//  ELIMINAR FOTO (CORREGIDO)
// =============================================
export const eliminarFotoServicio = async (req, res) => {
  try {
    const { ruta } = req.body;

    if (!ruta) {
      return res.status(400).json({ mensaje: "Ruta de la foto no recibida" });
    }

    const proveedor = await Proveedor.findOne({ usuario: req.user._id });
    if (!proveedor) {
      return res.status(404).json({ mensaje: "Proveedor no encontrado" });
    }

    const servicio = proveedor.servicios[0];
    if (!servicio) {
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    }

    // ░░░ LOG PARA VER QUÉ LLEGA ░░░
    console.log("📸 Foto a eliminar:", ruta);

    // 1️⃣ Eliminar de la lista del servicio
    servicio.fotos = servicio.fotos.filter((f) => f !== ruta);

    // 2️⃣ Generar path real en disco
    //    ruta = "/uploads/servicios/abc.jpg"
    const relativePath = ruta.replace("/uploads/", ""); // → servicios/abc.jpg
    const absolutePath = path.join("uploads", relativePath);

    console.log("🗂 Archivo local:", absolutePath);

    // 3️⃣ Eliminar físicamente el archivo
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log("🗑 Foto eliminada del disco");
    } else {
      console.log("⚠ Foto NO encontrada en disco");
    }

    await proveedor.save();

    return res.json({
      mensaje: "Foto eliminada",
      fotos: servicio.fotos,
    });

  } catch (error) {
    console.error("❌ Error eliminar foto:", error);
    res.status(500).json({ mensaje: error.message });
  }
};

