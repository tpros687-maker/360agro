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
      default: "Sin descripción técnica detallada.", // ✅ Valor por defecto por si falla el front
    },
    categoria: {
      type: String,
      enum: ["Terneros", "Terneras", "Novillos", "Vaquillonas", "Vacas", "Toros", "Pieza de Cría"],
      default: "Novillos",
    },
    raza: { type: String, trim: true },
    cantidad: { type: Number, default: 0 },
    pesoPromedio: { type: Number, default: 0 },
    precio: { type: Number, required: true },
    ubicacion: { type: String, required: true },
    departamento: { type: String, trim: true, default: null },
    localidad: { type: String, trim: true, default: null },
    fotos: { type: [String], default: [] },
    video: { type: String, default: null },

    estadisticas: {
      visitas: { type: Number, default: 0 },
      whatsapp: { type: Number, default: 0 },
      contactos: { type: Number, default: 0 },
    },

    destacado: { type: Boolean, default: false },
    estado: {
      type: String,
      enum: ["Disponible", "Vendido", "Reservado"],
      default: "Disponible",
    },
    // --- CERTIFICACIÓN OFICIAL ---
    numeroDicose: { type: String, trim: true, default: null },
    documentoPropiedad: { type: String, default: null },
    certificadoSanitario: { type: String, default: null },
  },
  { timestamps: true }
);

const Lote = mongoose.models.Lote || mongoose.model("Lote", lotSchema, "lotes");
export default Lote;