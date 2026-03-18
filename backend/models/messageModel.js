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
      ref: "Product", // Asegúrate de que el modelo de productos se llame "Product"
      required: false,
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