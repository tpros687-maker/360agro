import express from "express";
import { consultarIA } from "../controllers/aiController.js";

const router = express.Router();

router.post("/consultar", consultarIA);

export default router;
