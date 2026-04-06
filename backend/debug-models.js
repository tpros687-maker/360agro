import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
    try {
        console.log("--- INICIANDO DIAGNÓSTICO DE MODELOS ---");
        console.log("API KEY (primeros 5):", process.env.GEMINI_API_KEY?.substring(0, 5));

        // El SDK no tiene un método directo listModels fácil de acceder siempre, 
        // pero podemos intentar probar varios nombres comunes.
        const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.0-pro"];

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("test");
                console.log(`✅ MODELO DETECTADO Y OPERATIVO: ${modelName}`);
                return;
            } catch (err) {
                console.log(`❌ FALLO EN MODELO: ${modelName} - Error: ${err.message}`);
            }
        }

        console.log("--- FIN DEL DIAGNÓSTICO ---");
        console.log("Ningún modelo estándar respondió. Esto suele indicar que:");
        console.log("1. La API Key es inválida.");
        console.log("2. El servicio 'Generative Language API' no está habilitado en tu consola de Google Cloud.");
        console.log("3. Hay un problema de facturación o cuota en la cuenta.");
    } catch (error) {
        console.error("Error crítico en el diagnóstico:", error);
    }
}

listModels();
