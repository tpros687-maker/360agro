import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fecha: {
            type: Date,
            default: Date.now,
            required: true,
        },
        categoria: {
            type: String,
            required: true,
        },
        descripcion: {
            type: String,
            required: true,
            trim: true,
        },
        monto: {
            type: Number,
            required: true,
            min: 0,
        },
        lote: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lote",
            default: null,
        },
        gisAsset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "GisAsset",
            default: null,
        },
        estado: {
            type: String,
            enum: ["Pagado", "Pendiente"],
            default: "Pendiente",
        },
        alcance: {
            type: String,
            enum: ["Directo", "Rubro", "Estructural"],
            default: "Directo",
        },
        imputacionAgri: {
            type: Number,
            default: 0,
        },
        imputacionGana: {
            type: Number,
            default: 0,
        },
        entidadDestino: {
            type: String,
            default: "General",
        },
    },
    {
        timestamps: true,
    }
);

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
