import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function testFinalModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    try {
        console.log("Testing with gemini-2.0-flash...");
        const result = await model.generateContent("Hola, responde 'SISTEMA ONLINE'.");
        const response = await result.response;
        console.log("RESULT:", response.text());
    } catch (error) {
        console.error("FINAL TEST FAILED:", error.message);
    }
}

testFinalModel();
