import express from "express";
import proteger from "../middleware/authMiddleware.js";
import admin from "../middleware/adminMiddleware.js";
import {
    getStats,
    getUsers,
    toggleVerificacion,
    getSolicitudesSub
} from "../controllers/adminController.js";
import { aprobarSubscripcion } from "../controllers/subscripcionController.js";
import { getAdminSettings, updateSettings } from "../controllers/siteSettingsController.js";

const router = express.Router();

// Todas las rutas de este archivo requieren estar logueado Y ser admin
router.use(proteger, admin);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id/verificar", toggleVerificacion);
router.get("/subscripciones", getSolicitudesSub);
router.patch("/subscripciones/:id/aprobar", aprobarSubscripcion);

// Gestión de Sitewide Settings
router.get("/settings", getAdminSettings);
router.patch("/settings", updateSettings);

export default router;
