import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const findRecent = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        const fifteenMinsAgo = new Date(Date.now() - 15 * 60000);
        console.log("Buscando documentos creados/editados después de:", fifteenMinsAgo.toISOString());

        for (const coll of collections) {
            const docs = await db.collection(coll.name).find({
                $or: [
                    { createdAt: { $gte: fifteenMinsAgo } },
                    { updatedAt: { $gte: fifteenMinsAgo } }
                ]
            }).toArray();

            if (docs.length > 0) {
                console.log(`\n--- [${coll.name}] (${docs.length} docs recientes) ---`);
                docs.forEach(d => console.log(JSON.stringify(d, null, 2)));
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

findRecent();
