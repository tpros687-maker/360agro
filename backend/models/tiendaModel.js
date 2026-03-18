import mongoose from "mongoose";

const tiendaSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    nombre: { type: String, required: true },
    categoria: { type: String, required: true }, // Ej: Veterinaria, Maquinaria
    descripcion: { type: String, required: true },
    zona: { type: String, required: true },

    telefono: String,
    whatsapp: String,
    email: String,
    website: String,

    logo: String,
    fotos: [String],

    // Productos asociados (catálogo)
    productos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Producto",
      },
    ],

    // Estadísticas
    estadisticas: {
      visitas: { type: Number, default: 0 },
      whatsapp: { type: Number, default: 0 },
      telefono: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
    },

    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ✅ CORRECCIÓN CRÍTICA: Verifica si el modelo ya existe antes de compilarlo
const Tienda = mongoose.models.Tienda || mongoose.model("Tienda", tiendaSchema);

export default Tienda;