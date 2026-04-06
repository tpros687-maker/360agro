import mongoose from "mongoose";
import dotenv from "dotenv";
import Lote from "./models/lotModel.js";

dotenv.config();

const findPhotos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await Lote.countDocuments({ "fotos.0": { $exists: true } });
        console.log(`Lotes with photos: ${count}`);

        if (count > 0) {
            const lotes = await Lote.find({ "fotos.0": { $exists: true } }, "titulo fotos").limit(5);
            lotes.forEach(l => console.log(`${l.titulo}: ${JSON.stringify(l.fotos)}`));
        }

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

findPhotos();
