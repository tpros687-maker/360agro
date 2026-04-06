import express from "express";
import CostRecord from "../models/costRecordModel.js";
import Lote from "../models/lotModel.js";
import proteger from "../middleware/authMiddleware.js";

const router = express.Router();

// @desc    Calcular y opcionalmente guardar un nuevo registro de costos
// @route   POST /api/costs/calculate
// @access  Private (Premium Only check handled in frontend or middleware)
router.post("/calculate", proteger, async (req, res) => {
    try {
        const {
            loteId,
            precioCompraPorAnimal = 0,
            costoAlimento = 0,
            costoMedicina = 0,
            costoManoObra = 0,
            costoCampo = 0,
            otrosGastos = 0,
            saveRecord = true,
        } = req.body;

        const lote = await Lote.findById(loteId);

        if (!lote) {
            return res.status(404).json({ success: false, error: "Lote no encontrado" });
        }

        if (lote.usuario.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: "No autorizado" });
        }

        // Cálculos
        const costoCompraTotal = precioCompraPorAnimal * lote.cantidad;
        const inversionTotal =
            costoCompraTotal +
            costoAlimento +
            costoMedicina +
            costoManoObra +
            costoCampo +
            otrosGastos;

        const costoTotalPorAnimal = lote.cantidad > 0 ? inversionTotal / lote.cantidad : 0;

        let costoTotalPorKilo = 0;
        if (lote.pesoPromedio > 0) {
            costoTotalPorKilo = costoTotalPorAnimal / lote.pesoPromedio;
        }

        const costData = {
            lote: loteId,
            usuario: req.user.id,
            precioCompraPorAnimal,
            costoAlimento,
            costoMedicina,
            costoManoObra,
            costoCampo,
            otrosGastos,
            costoTotalPorAnimal,
            costoTotalPorKilo,
            inversionTotal,
            utilidadEstimada: 0,
        };

        if (saveRecord) {
            const costRecord = await CostRecord.create(costData);
            return res.status(201).json({ success: true, data: costRecord });
        } else {
            return res.status(200).json({ success: true, data: costData });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Obtener todos los registros de costos del usuario
// @route   GET /api/costs
// @access  Private
router.get("/", proteger, async (req, res) => {
    try {
        const records = await CostRecord.find({ usuario: req.user.id })
            .populate("lote", "titulo cantidad pesoPromedio")
            .sort("-createdAt");
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// @desc    Obtener registros de costos de un lote específico
// @route   GET /api/costs/lote/:loteId
// @access  Private
router.get("/lote/:loteId", proteger, async (req, res) => {
    try {
        const records = await CostRecord.find({
            lote: req.params.loteId,
            usuario: req.user.id,
        }).sort("-createdAt");
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
