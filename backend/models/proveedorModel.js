import mongoose from "mongoose";
import slugify from "slugify";

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

    // rubro: ej. "Agroveterinaria", "Contratista", "Insumos"
    rubro: { 
      type: String, 
      required: true 
    },

    // Definimos si es una Tienda física/insumos o un Proveedor de Servicios
    tipoProveedor: {
      type: String,
      enum: ["tienda", "servicio"],
      required: true,
    },

    descripcion: { type: String, required: true },
    zona: { type: String, required: true }, // Ej: "Venado Tuerto", "Balcarce"

    // Contacto Directo
    telefono: String,
    whatsapp: String,
    email: String,
    website: String,

    // Identidad Visual del Negocio
    logo: { type: String, default: null },
    fotos: [{ type: String }], // Galería del local o maquinaria

    // Métricas de Rendimiento del Perfil
    estadisticas: {
      visitas: { type: Number, default: 0 },
      whatsapp: { type: Number, default: 0 },
      telefono: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
    },

    // Sincronizado con los planes de la plataforma
    plan: { 
      type: String, 
      enum: ["gratis", "bronce", "plata", "oro", "empresa"], 
      default: "gratis" 
    },
    destacado: { type: Boolean, default: false },
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
// Esto permite que al ver "Agroveterinaria Sur" traigamos sus productos
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