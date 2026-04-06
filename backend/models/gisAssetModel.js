import mongoose from "mongoose";

const gisAssetSchema = new mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        nombre: {
            type: String,
            required: true,
            trim: true,
        },
        tipo: {
            type: String,
            enum: ["agri", "gana", "marker"],
            required: true,
        },
        subtipo: {
            type: String,
            default: "Generico",
        },
        geometry: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        hectareas: {
            type: Number,
            default: 0,
        },
        isSubdivision: {
            type: Boolean,
            default: false,
        },
        // Para agricultura/ganadería
        cultivo: String,
        cabezas: Number,
        categoria: String,
        center: mongoose.Schema.Types.Mixed,
        // Nuevos campos para agrupamiento y orden (Franjas)
        nombrePotrero: String,
        numeroFranja: {
            type: Number,
            default: 1
        },
        // --- GESTIÓN DE PASTOREO (FARM OS) ---
        estadoPastoreo: {
            type: String,
            enum: ["Libre", "Ocupado", "Descanso"],
            default: "Libre",
        },
        fechaUltimoMovimiento: {
            type: Date,
            default: Date.now,
        },
        cabezasActuales: {
            type: Number,
            default: 0,
        },
        // --- PASTOREO ROTATIVO (NUEVO) ---
        subdivisiones: {
            type: Number,
            default: 0,
        },
        franjaActual: {
            type: Number,
            default: 1,
        },
        // --- BITÁCORA DE CAMPO (FARM OS) ---
        logbook: [
            {
                fecha: { type: Date, default: Date.now },
                tipo: {
                    type: String,
                    enum: ["Tarea", "Clima", "Observación", "Insumo"],
                    required: true
                },
                descripcion: String,
                datos: mongoose.Schema.Types.Mixed,
                severidad: {
                    type: String,
                    enum: ["Normal", "Alerta", "Crítico"],
                    default: "Normal"
                }
            }
        ],
        // --- PLANIFICACIÓN DE INSUMOS ---
        planificacionInsumos: {
            insumoSugerido: String,
            dosisPorHa: Number,
            totalCalculado: Number,
            ultimaActualizacion: { type: Date, default: Date.now }
        }
    },
    { timestamps: true }
);

const GisAsset = mongoose.models.GisAsset || mongoose.model("GisAsset", gisAssetSchema, "gis_assets");
export default GisAsset;
