import mongoose from "mongoose";

const schema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true, uppercase: true },
  plan: { type: String, required: true, enum: ["productor", "pro", "empresa"] },
  periodo: { type: String, default: "mensual", enum: ["mensual", "trimestral", "anual"] },
  usado: { type: Boolean, default: false },
  usadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  fechaUso: { type: Date, default: null },
  emailDestino: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("CodigoActivacion", schema);
