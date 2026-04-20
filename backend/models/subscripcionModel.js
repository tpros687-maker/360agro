import mongoose from "mongoose";

const subscripcionSchema = new mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        planSolicitado: {
            type: String,
            enum: ["productor", "pro", "empresa"],
            required: true,
        },
        periodo: {
            type: String,
            enum: ["mensual", "trimestral", "anual"],
            default: "mensual",
        },
        status: {
            type: String,
            enum: ["Pendiente", "Aprobado", "Rechazado"],
            default: "Pendiente",
        },
        comprobante: {
            type: String, // URL de la imagen del comprobante (opcional si es WhatsApp)
            default: null,
        },
        fechaSolicitud: {
            type: Date,
            default: Date.now,
        },
        fechaAprobacion: {
            type: Date,
        },
        notas: String, // Notas del admin si se rechaza
    },
    { timestamps: true }
);

const Subscripcion = mongoose.model("Subscripcion", subscripcionSchema);
export default Subscripcion;
