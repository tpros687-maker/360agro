import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  // Nombre interno del plan → siempre en minúsculas y sin acentos
  nombre: {
    type: String,
    required: true,
    enum: ["gratis", "productor", "pro", "empresa"]
  },

  // Precio en USD, mensual o anual según el caso
  precio: { type: Number, required: true },

  // Límite de publicaciones
  publicacionesMax: { type: Number, default: 0 },

  // Si puede marcar publicaciones como destacadas
  destacado: { type: Boolean, default: false },

  // Tipo del plan (lo mismo que nombre)
  tipo: {
    type: String,
    enum: ["gratis", "productor", "pro", "empresa"],
    required: true
  },

  // Límites técnicos adicionales
  productosMax: { type: Number, default: 0 },
  serviciosMax: { type: Number, default: 0 },
  consultasAI: { type: Boolean, default: true }
});

//
// ⭐ Normalizar valores por seguridad
//
planSchema.pre("save", function (next) {
  if (this.nombre) this.nombre = this.nombre.toLowerCase();
  if (this.tipo) this.tipo = this.tipo.toLowerCase();
  next();
});

planSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.nombre) update.nombre = update.nombre.toLowerCase();
  if (update.tipo) update.tipo = update.tipo.toLowerCase();
  next();
});

const Plan = mongoose.model("Plan", planSchema);
export default Plan;
