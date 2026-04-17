import mongoose from "mongoose";
import slugify from "slugify";

const servicioSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nombre: { type: String, required: true },
    tipoServicio: { type: String, required: true },
    descripcion: { type: String, required: true },
    zona: { type: String, required: true },
    departamento: String,
    localidad: String,
    telefono: String,
    whatsapp: String,
    email: String,
    website: String,
    fotos: [String],
    slug: { type: String, unique: true, sparse: true },
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

servicioSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("nombre")) {
    let base = slugify(this.nombre, { lower: true, strict: true });
    let slug = base;
    let count = 0;
    const Servicio = mongoose.models.Servicio;
    while (await Servicio?.findOne({ slug, _id: { $ne: this._id } })) {
      count++;
      slug = `${base}-${count}`;
    }
    this.slug = slug;
  }
  next();
});

const Servicio =
  mongoose.models.Servicio || mongoose.model("Servicio", servicioSchema);

export default Servicio;
