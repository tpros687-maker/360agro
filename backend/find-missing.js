import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const findInAllCollections = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        for (const coll of collections) {
            const documents = await db.collection(coll.name).find({}).sort({ createdAt: -1 }).limit(5).toArray();
            if (documents.length > 0) {
                console.log(`\n--- ÚLTIMOS DOCUMENTOS EN: ${coll.name} ---`);
                documents.forEach(doc => {
                    console.log(JSON.stringify(doc, null, 2));
                });
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

findInAllCollections();
