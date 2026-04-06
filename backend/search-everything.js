import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const searchEverything = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log("Colecciones:", collections.map(c => c.name));

        for (const coll of collections) {
            const docs = await db.collection(coll.name).find({}).toArray();
            if (docs.length > 0) {
                console.log(`\n--- [${coll.name}] (${docs.length} docs) ---`);
                docs.forEach(d => {
                    // Si el documento tiene algún campo que parezca un servicio, lo mostramos
                    if (JSON.stringify(d).toLowerCase().includes("servicio") ||
                        JSON.stringify(d).toLowerCase().includes("práctica") ||
                        JSON.stringify(d).toLowerCase().includes("maquina")) {
                        console.log(JSON.stringify(d, null, 2));
                    }
                });
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

searchEverything();
