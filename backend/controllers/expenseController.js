import Expense from "../models/expenseModel.js";
import Lote from "../models/lotModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Obtener todos los gastos del usuario
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ usuario: req.user._id })
            .sort("-fecha")
            .populate("lote", "titulo")
            .populate("gisAsset", "nombre tipo");
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener gastos", error: error.message });
    }
};

// @desc    Crear un nuevo gasto
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res) => {
    try {
        const { fecha, categoria, descripcion, monto, lote, gisAsset, estado, alcance, imputacionAgri, imputacionGana, entidadDestino } = req.body;
        const expense = await Expense.create({
            usuario: req.user._id,
            fecha: fecha || Date.now(),
            categoria,
            descripcion,
            monto,
            lote: lote || null,
            gisAsset: gisAsset || null,
            estado: estado || "Pendiente",
            alcance: alcance || "Directo",
            imputacionAgri: imputacionAgri || 0,
            imputacionGana: imputacionGana || 0,
            entidadDestino: entidadDestino || "General",
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear gasto", error: error.message });
    }
};

// @desc    Eliminar un gasto
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ mensaje: "Gasto no encontrado" });
        if (expense.usuario.toString() !== req.user._id.toString()) {
            return res.status(403).json({ mensaje: "No autorizado" });
        }
        await expense.deleteOne();
        res.json({ mensaje: "Gasto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar gasto", error: error.message });
    }
};

// @desc    Analizar gastos con IA
// @route   POST /api/expenses/analyze
// @access  Private
export const analyzeExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ usuario: req.user._id }).populate("lote", "titulo");

        if (expenses.length === 0) {
            return res.json({
                analisis: "No hay datos suficientes para realizar un análisis estratégico. Por favor, registre sus gastos operativos para iniciar la terminal de inteligencia."
            });
        }

        const dataContext = expenses.map(e => ({
            fecha: e.fecha,
            categoria: e.categoria,
            descripcion: e.descripcion,
            monto: e.monto,
            lote: e.lote?.titulo || "General"
        }));

        const prompt = `
      Eres el consultor analítico de "360 Agro Elite", una terminal de inteligencia para productores rurales de alta performance.
      Tu misión es analizar el siguiente listado de gastos operativos y proporcionar:
      1. Un resumen ejecutivo del flujo de caja.
      2. Identificación de categorías críticas (donde se gasta más).
      3. 3 Consejos tácticos para optimizar costos o mejorar la rentabilidad.
      4. Una alerta de 'Riesgo' o 'Oportunidad' detectada en los datos.

      DATOS DE GASTOS:
      ${JSON.stringify(dataContext, null, 2)}

      Responde en un tono profesional, directo, minimalista y orientado a resultados (estética Noir/Elite). 
      Usa markdown para el formato.
    `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ analisis: text });
    } catch (error) {
        console.error("Error en AI Analysis:", error);
        res.status(500).json({ mensaje: "Error en la terminal de inteligencia AI", error: error.message });
    }
};

// @desc    Parsear lenguaje natural para crear gasto
// @route   POST /api/expenses/parse
// @access  Private
export const parseNaturalLanguage = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ mensaje: "No se proporcionó texto" });

        const categoriasValidas = [
            "Nutrición / Alimento",
            "Sanidad / Medicina",
            "Semillas / Fertilizantes",
            "Combustible / Energía",
            "Mano de Obra / Jornales",
            "Mantenimiento / Reparaciones",
            "Impuestos / Tasas",
            "Arrendamiento",
            "Logística / Flete",
            "Otros Gastos",
        ];

        const prompt = `
      Eres un asistente experto en contabilidad agropecuaria avanzada.
      Tu tarea es extraer datos de un gasto a partir de una descripción en lenguaje natural.
      
      TEXTO DEL USUARIO: "${text}"
      FECHA ACTUAL: ${new Date().toISOString().split('T')[0]}

      CATEGORÍAS VÁLIDAS: ${categoriasValidas.join(", ")}

      REGLAS:
      1. Extrae el monto numérico.
      2. Clasifica en la categoría más cercana de las permitidas. Si no estás seguro, usa "Otros Gastos".
      3. Extrae la descripción breve.
      4. Si menciona una fecha (ej: "ayer", "el lunes", "15 de mayo"), calcúlala basándote en la fecha actual. Si no, usa la fecha actual.
      5. Responde ÚNICAMENTE con un objeto JSON válido con este formato:
      {
        "fecha": "YYYY-MM-DD",
        "categoria": "Nombre de Categoría",
        "descripcion": "Descripción extraída",
        "monto": 123.45
      }
    `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = response.text().replace(/```json/g, "").replace(/```/g, "").trim();

        const parsedData = JSON.parse(jsonText);
        res.json(parsedData);
    } catch (error) {
        console.error("Error en Natural Language Parsing:", error);
        res.status(500).json({ mensaje: "Error al interpretar el texto", error: error.message });
    }
};
