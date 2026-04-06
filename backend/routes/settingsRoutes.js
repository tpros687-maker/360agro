import express from "express";
import { getSettings } from "../controllers/siteSettingsController.js";

const router = express.Router();

router.get("/", getSettings);

export default router;
