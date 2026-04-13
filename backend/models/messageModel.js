import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    mensaje: {
      type: String,
      default: "",
    },

    archivo: {
      type: String,
      default: null,
    },

    // Referencia a Lotes (Ganado)
    lote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lote",
      required: false, // Cambiado a false para permitir mensajes de productos
    },

    // 🔥 NUEVO: Referencia a Productos (Tienda/Insumos)
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto", // Corregido: El modelo se llama "Producto" en productoModel.js
      required: false,
    },

    // Referencia a Servicios (Proveedores)
    servicio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Servicio",
      default: null,
    },

    emisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receptor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    leido: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);