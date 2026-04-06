import express from "express";
import { getGisAssets, createGisAsset, updateGisAsset, deleteGisAsset } from "../controllers/gisController.js";
import proteger from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(proteger, getGisAssets)
    .post(proteger, createGisAsset);

router.route("/:id")
    .put(proteger, updateGisAsset)
    .delete(proteger, deleteGisAsset);

export default router;
