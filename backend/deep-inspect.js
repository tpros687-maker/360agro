import mongoose from "mongoose";
import dotenv from "dotenv";
import Proveedor from "./models/proveedorModel.js";

dotenv.config();

const deepInspect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");

        const proveedor = await Proveedor.findOne({ nombre: "Mateo Aunchayna" });
        if (proveedor) {
            console.log("Documento encontrado:", JSON.stringify(proveedor, null, 2));
            console.log("Claves del objeto proveedor:", Object.keys(proveedor.toObject()));
            console.log("¿Tiene la propiedad servicios?:", proveedor.servicios !== undefined);
            console.log("Contenido de servicios:", proveedor.servicios);
        } else {
            console.log("No se encontró el proveedor 'Mateo Aunchayna'");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

deepInspect();
