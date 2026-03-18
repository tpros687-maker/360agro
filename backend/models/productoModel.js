import mongoose from "mongoose";

const productoSchema = new mongoose.Schema(
  {
    proveedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proveedor",
      required: true,
    },
    titulo: { 
      type: String, 
      required: true,
      trim: true // Elimina espacios accidentales al inicio/final
    },
    descripcion: { 
      type: String, 
      required: true 
    },
    precio: { 
      type: Number, 
      required: true 
    },
    // CAMBIO: De String a Number para permitir lógica de ventas
    stock: { 
      type: Number, 
      required: true,
      default: 0 
    },
    // NUEVO: Vital para un Agromarket
    unidadMedida: {
      type: String,
      enum: ["kg", "unidad", "litro", "tonelada", "lote"],
      default: "unidad",
      required: true
    },
    peso: { 
      type: Number, 
      default: null 
    },
    categoria: { 
      type: String, 
      required: true 
    },
    // CAMBIO: Guardar solo nombres de archivos (ej: "foto-123.jpg")
    fotos: [{ type: String }],
    fotoPrincipal: { 
      type: String, 
      default: null 
    },
    // NUEVO: Control de visibilidad del producto
    activo: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Virtual para facilitar la URL en el Frontend sin ensuciar la DB
productoSchema.virtual('fotoPrincipalUrl').get(function() {
  if (this.fotoPrincipal) {
    return `/uploads/productos/${this.fotoPrincipal}`;
  }
  return null;
});

const Producto = mongoose.model("Producto", productoSchema);
export default Producto;