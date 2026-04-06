import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const listCollections = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");

        const admin = mongoose.connection.db.admin();
        const db = mongoose.connection.db;

        const collections = await db.listCollections().toArray();
        console.log("Colecciones encontradas:", collections.map(c => c.name));

        for (const coll of collections) {
            const count = await db.collection(coll.name).countDocuments();
            console.log(`- ${coll.name}: ${count} documentos`);

            if (coll.name === "servicios") {
                const samples = await db.collection(coll.name).find({}).toArray();
                console.log("Ejemplo de servicios legacy:", JSON.stringify(samples, null, 2));
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

listCollections();
