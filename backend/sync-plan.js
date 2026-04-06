import mongoose from "mongoose";
import dotenv from "dotenv";
import Proveedor from "./models/proveedorModel.js";
import User from "./models/userModel.js";

dotenv.config();

const syncPlan = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");

        const user = await User.findOne({ email: "tpros687@gmail.com" });
        if (user) {
            const updateResult = await Proveedor.updateOne(
                { usuario: user._id },
                { $set: { plan: user.plan.toLowerCase() } }
            );
            console.log("Sincronización de plan completada:", updateResult);
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

syncPlan();
