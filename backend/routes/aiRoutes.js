import express from "express";
import { consultarIA } from "../controllers/aiController.js";
import proteger from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/consultar", proteger, consultarIA);

export default router;
