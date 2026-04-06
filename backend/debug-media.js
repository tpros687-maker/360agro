import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Lote from "./models/lotModel.js";
import Proveedor from "./models/proveedorModel.js";

dotenv.config();

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const lotes = await Lote.find({}, "titulo fotos").limit(5);
        console.log("\n--- LOTES ---");
        lotes.forEach(l => console.log(`${l.titulo}: ${JSON.stringify(l.fotos)}`));

        const proveedores = await Proveedor.find({ "servicios.0": { $exists: true } }, "nombre servicios.fotos servicios.nombre").limit(5);
        console.log("\n--- SERVICIOS ---");
        proveedores.forEach(p => {
            console.log(`Proveedor: ${p.nombre}`);
            p.servicios.forEach(s => console.log(`  - ${s.nombre}: ${JSON.stringify(s.fotos)}`));
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspect();
