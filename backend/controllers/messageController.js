import Message from "../models/messageModel.js";
import Lote from "../models/lotModel.js";
import Producto from "../models/productoModel.js";

/**
 * 📨 ENVIAR MENSAJE
 */
export const enviarMensaje = async (req, res) => {
  try {
    const { loteId, productoId, mensaje, receptor } = req.body;
    const emisorId = req.user._id;

    if (emisorId.toString() === receptor) {
      return res.status(400).json({ mensaje: "No puedes enviarte mensajes a ti mismo." });
    }

    if (!mensaje && !req.file) {
      return res.status(400).json({ mensaje: "El contenido del mensaje es obligatorio." });
    }

    // Creamos el objeto de mensaje de forma limpia
    const nuevoMensaje = new Message({
      mensaje: mensaje || "",
      archivo: req.file ? `/uploads/mensajes/${req.file.filename}` : null,
      lote: loteId || null,
      producto: productoId || null,
      emisor: emisorId,
      receptor,
      leido: false,
    });

    await nuevoMensaje.save();

    // 💡 POBLACIÓN DINÁMICA: Solo poblamos lo que realmente existe en el mensaje
    const paths = [
      { path: "emisor", select: "nombre" },
      { path: "receptor", select: "nombre" }
    ];

    if (nuevoMensaje.lote) paths.push({ path: "lote", select: "titulo" });
    if (nuevoMensaje.producto) paths.push({ path: "producto", select: "titulo" });

    const mensajePopulado = await nuevoMensaje.populate(paths);

    return res.status(201).json(mensajePopulado);
  } catch (error) {
    console.error("❌ Error al enviar mensaje:", error);
    return res.status(500).json({ mensaje: "Error interno al procesar el envío" });
  }
};

/**
 * 💬 BANDEJA DE ENTRADA (Agrupada)
 */
export const obtenerConversaciones = async (req, res) => {
  try {
    const userId = req.user._id;

    const mensajes = await Message.find({
      $or: [{ emisor: userId }, { receptor: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("emisor", "nombre")
      .populate("receptor", "nombre")
      .populate("lote", "titulo fotos")
      .populate("producto", "titulo fotos");

    const mapaConversaciones = {};

    mensajes.forEach((msg) => {
      const otroUsuario = msg.emisor._id.toString() === userId.toString() 
                          ? msg.receptor 
                          : msg.emisor;

      // Llave única: Si no hay lote ni producto, es una consulta general
      const referenciaId = msg.lote?._id || msg.producto?._id || "general";
      const key = `${referenciaId}_${otroUsuario._id}`;

      if (!mapaConversaciones[key]) {
        mapaConversaciones[key] = {
          _id: key,
          lote: msg.lote,
          producto: msg.producto,
          otroUsuario: otroUsuario,
          ultimoMensaje: {
            contenido: msg.mensaje || "📎 Archivo adjunto",
            createdAt: msg.createdAt
          },
          noLeidos: 0,
        };
      }

      if (msg.receptor._id.toString() === userId.toString() && !msg.leido) {
        mapaConversaciones[key].noLeidos++;
      }
    });

    return res.status(200).json(Object.values(mapaConversaciones));
  } catch (error) {
    console.error("❌ Error en bandeja de entrada:", error);
    return res.status(500).json({ mensaje: "Error al cargar conversaciones" });
  }
};

/**
 * 🔍 OBTENER CHAT ESPECÍFICO
 */
export const obtenerConversacion = async (req, res) => {
  try {
    const { referenciaId, otroUsuarioId } = req.params;
    const userId = req.user._id;

    // Filtro inteligente para buscar por Lote o por Producto
    let filtroReferencia = { lote: null, producto: null };

    if (referenciaId !== "general") {
      filtroReferencia = { 
        $or: [
          { lote: referenciaId }, 
          { producto: referenciaId }
        ] 
      };
    }

    // 1. Marcar como leídos
    await Message.updateMany(
      {
        ...filtroReferencia,
        emisor: otroUsuarioId,
        receptor: userId,
        leido: false,
      },
      { $set: { leido: true } }
    );

    // 2. Traer historial con población segura
    const mensajes = await Message.find({
      ...filtroReferencia,
      $or: [
        { emisor: userId, receptor: otroUsuarioId },
        { emisor: otroUsuarioId, receptor: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("emisor", "nombre")
      .populate("lote", "titulo")
      .populate("producto", "titulo");

    return res.status(200).json(mensajes);
  } catch (error) {
    console.error("❌ Error al cargar historial:", error);
    return res.status(500).json({ mensaje: "Error al cargar el historial" });
  }
};