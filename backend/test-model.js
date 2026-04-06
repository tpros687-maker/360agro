import mongoose from "mongoose";
import dotenv from "dotenv";
import Proveedor from "./models/proveedorModel.js";

dotenv.config();

console.log("🚀 Iniciando prueba de modelo...");

try {
    console.log("Modelos registrados:", mongoose.modelNames());
    console.log("Proveedor model imported successfully");
    process.exit(0);
} catch (error) {
    console.error("❌ Error al importar/registrar modelos:", error);
    process.exit(1);
}
