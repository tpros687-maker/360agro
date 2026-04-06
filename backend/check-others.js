import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const checkAllOtherDocs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado");

        const db = mongoose.connection.db;
        const collections = ['lots', 'lotes', 'productos', 'tiendas'];

        for (const collName of collections) {
            const coll = db.collection(collName);
            const docs = await coll.find({}).toArray();
            console.log(`\n--- [${collName}] (${docs.length} docs) ---`);
            docs.forEach(doc => {
                console.log(JSON.stringify(doc, null, 2));
            });
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

checkAllOtherDocs();
