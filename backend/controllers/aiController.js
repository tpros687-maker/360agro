import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export const consultarIA = async (req, res) => {
    console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
    try {
        const { mensaje, contexto, historial } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json({
                respuesta: "El sistema de IA está en modo offline (Falta API Key). Pero puedo decirte que 360 Agro es la mejor plataforma para tus negocios rurales."
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // --- PROMPT DE SISTEMA (EL CEREBRO DE AGRO-ASISTENTE) ---
        const systemInstruction = `
            Eres "Agro-Asistente", el experto en inteligencia artificial de la plataforma 360 Agro. 
            Tu objetivo es ser un consultor de élite para productores agropecuarios, contratistas y comerciantes.
            
            FUNCIONES PRINCIPALES:
            1. SOPORTE TÉCNICO: Conoces la plataforma (Lotes, Tienda, Servicios). Ayuda a navegar y usar el sistema.
            2. ASISTENTE DE CREACIÓN: Ayuda a redactar publicaciones técnicas y vendedoras (raza, kg, trazabilidad).
            3. CONSULTORÍA DE NEGOCIOS Y MAPAS (GIS): Analiza datos de Lotes. Si recibes detalles de hectáreas, gastos y carga animal, da consejos de optimización (ej: rotar animales si la carga es > 3 C/Ha, o revisar márgenes si el costo/Ha es elevado).
            4. FARM OS (AgroLedger): Eres el núcleo inteligente del Farm OS. Tu objetivo es maximizar el ROI del productor basándote en datos reales.

            TONO: Profesional, élite, estético (Agro-Noir), directo y altamente analítico.
            CONTEXTO ACTUAL: ${contexto || 'Navegación general'}
        `;

        // --- CONFIGURACIÓN DE MODELO ---
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash-latest",
        });

        // Preparar y limpiar historial para Gemini (Debe empezar con 'user' y alternar)
        let historyCleaned = [
            { role: "user", parts: [{ text: systemInstruction }] },
            { role: "model", parts: [{ text: "Entendido." }] },
        ];
        let lastRole = "model";

        if (historial && Array.isArray(historial) && historial.length > 0) {
            historial.forEach(h => {
                const currentRole = h.role === 'ia' ? 'model' : 'user';
                if (currentRole !== lastRole) {
                    historyCleaned.push({
                        role: currentRole,
                        parts: [{ text: h.text || "..." }],
                    });
                    lastRole = currentRole;
                }
            });
        }

        const chat = model.startChat({
            history: historyCleaned,
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        // Enviamos el mensaje
        const payloadText = mensaje || "Dame un consejo técnico breve.";
        const fullPrompt = contexto ? `CONTEXTO: ${contexto}\n\nMensaje: ${payloadText}` : payloadText;

        console.log("➡️ Enviando a Gemini:", { payloadText: fullPrompt.substring(0, 100) + "..." });

        const result = await chat.sendMessage(fullPrompt);
        const response = await result.response;
        const text = response.text();

        console.log("✅ Respuesta de Gemini obtenida con éxito.");

        res.status(200).json({ respuesta: text });
    } catch (error) {
        console.error("❌ ERROR CRÍTICO EN AGRO-IA:", error);

        // El error 500 detailed para depuración
        res.status(500).json({
            mensaje: "Error en la terminal de inteligencia",
            detalle: error.message,
            stack: error.stack?.substring(0, 200), // Enviar un poco del stack para depuración remota
            tipo: error.name
        });
    }
};
