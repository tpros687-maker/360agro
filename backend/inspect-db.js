import mongoose from "mongoose";
import dotenv from "dotenv";
import Proveedor from "./models/proveedorModel.js";

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");

        const proveedores = await Proveedor.find({});
        console.log(`Encontrados ${proveedores.length} proveedores.`);

        proveedores.forEach((p, i) => {
            console.log(`\n--- Proveedor ${i + 1} ---`);
            console.log(`Nombre: ${p.nombre}`);
            console.log(`Usuario ID: ${p.usuario}`);
            console.log(`Tipo: ${p.tipoProveedor}`);
            console.log(`Servicios count: ${p.servicios?.length || 0}`);

            if (p.servicios && p.servicios.length > 0) {
                p.servicios.forEach((s, si) => {
                    console.log(`  [S${si + 1}] Nombre: ${s.nombre}, TipoServicio: ${s.tipoServicio}`);
                });
            }
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

checkDB();
