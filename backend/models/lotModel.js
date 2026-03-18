import mongoose from "mongoose";

const lotSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    titulo: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, "La descripción técnica es obligatoria"],
    },
    categoria: {
      type: String,
      enum: ["Ganado", "Maquinaria", "Campos"],
      default: "Ganado",
    },
    raza: { type: String, trim: true },
    cantidad: { type: Number, default: 0 },
    pesoPromedio: { type: Number, default: 0 },
    precio: { type: Number, required: true },
    ubicacion: { type: String, required: true },
    fotos: { type: [String], default: [] },
    video: { type: String, default: null },
    
    // --- MÉTRICAS DE ÉLITE ---
    estadisticas: {
      visitas: { type: Number, default: 0 },
      whatsapp: { type: Number, default: 0 }, // Clics directos al botón de compra
      contactos: { type: Number, default: 0 }, // Otros clics (teléfono/mail)
    },

    // --- LÓGICA DE NEGOCIO ---
    destacado: { type: Boolean, default: false }, // Para planes superiores
    estado: {
      type: String,
      enum: ["Disponible", "Vendido", "Reservado"],
      default: "Disponible",
    },
  },
  { timestamps: true }
);

const Lote = mongoose.model("Lote", lotSchema);
export default Lote;