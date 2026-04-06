import mongoose from "mongoose";
import dotenv from "dotenv";
import Proveedor from "./models/proveedorModel.js";

dotenv.config();

const showAllProviders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");

        const proveedores = await Proveedor.find({}).lean();
        console.log(`Total proveedores: ${proveedores.length}`);

        proveedores.forEach((p, i) => {
            console.log(`\n--- [P${i + 1}] ${p.nombre} ---`);
            console.log(`ID: ${p._id}`);
            console.log(`Usuario: ${p.usuario}`);
            console.log(`Servicios (${p.servicios?.length || 0}):`);
            p.servicios?.forEach((s, si) => {
                console.log(`  [S${si + 1}] ${s.nombre} (ID: ${s._id})`);
            });
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

showAllProviders();
