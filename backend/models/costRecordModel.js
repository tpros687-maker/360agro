import mongoose from "mongoose";

const costRecordSchema = new mongoose.Schema(
    {
        lote: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lote",
            required: true,
        },
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        precioCompraPorAnimal: {
            type: Number,
            default: 0,
        },
        costoAlimento: {
            type: Number,
            default: 0,
        },
        costoMedicina: {
            type: Number,
            default: 0,
        },
        costoManoObra: {
            type: Number,
            default: 0,
        },
        costoCampo: {
            type: Number,
            default: 0,
        },
        otrosGastos: {
            type: Number,
            default: 0,
        },
        // Resultados autocalculados:
        costoTotalPorAnimal: {
            type: Number,
            default: 0,
        },
        costoTotalPorKilo: {
            type: Number,
            default: 0,
        },
        inversionTotal: {
            type: Number,
            default: 0,
        },
        utilidadEstimada: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const CostRecord = mongoose.models.CostRecord || mongoose.model("CostRecord", costRecordSchema, "costos");
export default CostRecord;
