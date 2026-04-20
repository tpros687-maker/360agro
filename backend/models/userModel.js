import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    telefono: { type: String, default: null, trim: true },

    // Tipo de usuario: 'productor', 'proveedor', 'admin'
    tipoUsuario: { type: String, default: "productor" },

    // 📌 Plan normalizado SIEMPRE en minúsculas
    plan: {
      type: String,
      enum: ["observador", "productor", "pro", "empresa"],
      default: "observador",
    },
    // 💳 Automatización estilo Netflix
    suscripcionId: { type: String, default: null },
    fechaInicioPlan: { type: Date, default: null },
    periodoPlan: { type: String, enum: ["mensual", "trimestral", "anual"], default: null },
    proximaFechaCobro: { type: Date, default: null },
    estadoSuscripcion: {
      type: String,
      enum: ["activa", "cancelada", "vencida", "pendiente"],
      default: "pendiente"
    },
    // ✅ Verificación de email
    codigoVerificacion: { type: String, default: null },
    codigoExpira: { type: Date, default: null },
    emailVerificado: { type: Boolean, default: false },
    // ✅ Agro-Trust System
    esVerificado: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    rating: {
      promedio: { type: Number, default: 0 },
      totalOpiniones: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

//
// 🔥 Normalizar plan ANTES de guardar (para evitar EMPRESAS, Empresas, etc.)
//
userSchema.pre("save", function (next) {
  if (this.plan) {
    this.plan = this.plan.toLowerCase();
  }
  next();
});

//
// 🔥 Normalizar plan también cuando se hace findOneAndUpdate
//
userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.plan) {
    update.plan = update.plan.toLowerCase();
  }
  next();
});

//
// 🔐 Encriptar contraseña
//
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
