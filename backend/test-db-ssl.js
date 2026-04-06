import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const testConnection = async () => {
    try {
        console.log("Intentando conectar a MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Conexión exitosa.");

        // Intentar una consulta simple
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("✅ Consulta de colecciones exitosa:", collections.map(c => c.name));

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error detectado:");
        console.error("Mensaje:", error.message);
        console.error("Stack:", error.stack);
        process.exit(1);
    }
};

testConnection();
