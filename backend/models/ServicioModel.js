// backend/models/ServicioModel.js
import mongoose from "mongoose";

const ServicioSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    tipoServicio: {
      type: String,
      required: true,
      trim: true,
    },

    descripcion: {
      type: String,
      required: true,
      trim: true,
    },

    zona: {
      type: String,
      required: true,
    },

    telefono: {
      type: String,
      default: "",
    },

    whatsapp: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
    },

    fotos: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// ⛑️ FIX: evitar OverwriteModelError
export default mongoose.models.Servicio ||
  mongoose.model("Servicio", ServicioSchema);
