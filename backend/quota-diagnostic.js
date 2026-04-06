import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function diagnostic() {
    const models = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-2.5-flash-lite"
    ];

    console.log("--- DIAGNÓSTICO DE CUOTA ---");
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("ping");
            console.log(`✅ [OK] ${m}: Funcionando correctamente.`);
        } catch (err) {
            console.log(`❌ [ERROR] ${m}: ${err.message}`);
        }
    }
}

diagnostic();
