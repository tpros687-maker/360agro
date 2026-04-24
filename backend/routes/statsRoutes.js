import express from "express";
import Lote from "../models/lotModel.js";
import Servicio from "../models/servicioModel.js";

const router = express.Router();

router.get("/por-departamento", async (req, res) => {
  try {
    const [lotes, servicios] = await Promise.all([
      Lote.aggregate([
        { $match: { estado: { $ne: "Vendido" } } },
        { $group: { _id: "$departamento", total: { $sum: 1 } } }
      ]),
      Servicio.aggregate([
        { $group: { _id: "$departamento", total: { $sum: 1 } } }
      ])
    ]);

    const resultado = {};
    lotes.forEach(l => { if (l._id) resultado[l._id] = { lotes: l.total, servicios: 0 }; });
    servicios.forEach(s => {
      if (s._id) {
        if (resultado[s._id]) resultado[s._id].servicios = s.total;
        else resultado[s._id] = { lotes: 0, servicios: s.total };
      }
    });

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error", error: error.message });
  }
});

export default router;
