import mongoose from "mongoose";
import dotenv from "dotenv";
import Proveedor from "./models/proveedorModel.js";
import User from "./models/userModel.js";

dotenv.config();

const auditAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");

        const usuarios = await User.find({});
        console.log(`\nUsuarios [${usuarios.length}]:`);
        usuarios.forEach(u => console.log(`- ${u.nombre} (${u.email}) Plan: ${u.plan} ID: ${u._id}`));

        const proveedores = await Proveedor.find({});
        console.log(`\nProveedores [${proveedores.length}]:`);
        proveedores.forEach(p => {
            console.log(`- ${p.nombre} ID: ${p._id} Usuario: ${p.usuario} Servicios: ${p.servicios.length}`);
            p.servicios.forEach(s => console.log(`   [S] ${s.nombre}`));
        });

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

auditAll();
