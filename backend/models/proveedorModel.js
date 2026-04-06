import mongoose from "mongoose";
import slugify from "slugify";

/**
 * 📦 ESQUEMA DE SERVICIO (Subdocumento)
 * Los servicios no tienen colección propia. Viven dentro de Proveedor.
 */
const servicioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    tipoServicio: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      required: true
    },
    zona: {
      type: String,
      required: true
    },
    // Contacto específico del servicio (por si difiere del proveedor)
    telefono: String,
    whatsapp: String,
    email: String,
    website: String,

    fotos: [{
      type: String
    }],

    estadisticas: {
      visitas: { type: Number, default: 0 },
      whatsapp: { type: Number, default: 0 },
      telefono: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const proveedorSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    nombre: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      unique: true
    },

    rubro: {
      type: String,
      required: true
    },

    tipoProveedor: {
      type: String,
      default: "tienda",
    },

    descripcion: { type: String, required: true },
    zona: { type: String, required: true },

    telefono: String,
    whatsapp: String,
    email: String,
    website: String,

    logo: { type: String, default: null },
    fotos: [{ type: String }],

    estadisticas: {
      visitas: { type: Number, default: 0 },
      whatsapp: { type: Number, default: 0 },
      telefono: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
    },

    // 🚀 MATRIOSHKA: Array de servicios embebidos
    servicios: [servicioSchema],

    plan: {
      type: String,
      enum: ["gratis", "basico", "pro", "empresa"],
      default: "gratis"
    },
    destacado: { type: Boolean, default: false },
    esVerificado: { type: Boolean, default: false },
    rating: {
      promedio: { type: Number, default: 0 },
      totalOpiniones: { type: Number, default: 0 }
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

/* ===============================================
    VIRTUALS (Conexión con productos)
=============================================== */
proveedorSchema.virtual('misProductos', {
  ref: 'Producto',
  localField: '_id',
  foreignField: 'proveedor'
});

/* ===============================================
    GENERAR SLUG AUTOMÁTICO
=============================================== */
proveedorSchema.pre("save", function (next) {
  if (this.isModified("nombre")) {
    this.slug = slugify(this.nombre, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

/* ===============================================
    ÍNDICES (Para el Buscador Universal)
=============================================== */
proveedorSchema.index({ nombre: "text", rubro: "text", zona: "text" });

export default mongoose.model("Proveedor", proveedorSchema);