import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/userModel.js";
import Proveedor from "./models/proveedorModel.js";

dotenv.config();

const setupTutorialUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const email = "tutorial@360agro.com";
        const password = "password123";

        // 1. Reset User
        await User.deleteOne({ email });
        const user = await User.create({
            nombre: "Tutorial Master",
            email: email,
            password: password,
            plan: "pro", // Set plan to pro to avoid limits
            tipoUsuario: "proveedor",
            esVerificado: true
        });
        console.log("Tutorial user created/reset.");

        // 2. Clear old tutorial provider data
        await Proveedor.deleteOne({ usuario: user._id });
        console.log("Old tutorial provider data cleared.");

        await mongoose.disconnect();
        console.log("Done.");
    } catch (error) {
        console.error("Setup failed:", error);
        process.exit(1);
    }
};

setupTutorialUser();
