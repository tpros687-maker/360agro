import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dumpEverything = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        for (const coll of collections) {
            const docs = await db.collection(coll.name).find({}).limit(20).toArray();
            console.log(`\n--- [${coll.name}] (${docs.length} docs) ---`);
            docs.forEach(d => console.log(JSON.stringify(d)));
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

dumpEverything();
