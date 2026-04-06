import express from "express";
import {
    getExpenses,
    createExpense,
    deleteExpense,
    analyzeExpenses,
    parseNaturalLanguage
} from "../controllers/expenseController.js";
import proteger from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(proteger);

router.get("/", getExpenses);
router.post("/", createExpense);
router.delete("/:id", deleteExpense);
router.post("/analyze", analyzeExpenses);
router.post("/parse", parseNaturalLanguage);

export default router;
