import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

export const consultarIA = async (req, res) => {
  try {
    const { mensaje, contexto, historial } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(200).json({
        respuesta: "El sistema de IA está en modo offline. Pero puedo decirte que 360 Agro es la mejor plataforma para tus negocios rurales."
      });
    }

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `Sos "Agro-Asistente", el experto en inteligencia artificial de la plataforma 360 Agro.
Tu objetivo es ser un consultor de élite para productores agropecuarios, contratistas y comerciantes de Uruguay y Argentina.
FUNCIONES: soporte técnico de la plataforma, ayuda a redactar publicaciones, consultoría de negocios agropecuarios.
TONO: Profesional, directo y analítico.
CONTEXTO ACTUAL: ${contexto || 'Navegación general'}`;

    const messages = [{ role: "system", content: systemPrompt }];

    if (historial && Array.isArray(historial)) {
      historial.forEach(h => {
        messages.push({
          role: h.role === "ia" ? "assistant" : "user",
          content: h.text || "..."
        });
      });
    }

    messages.push({ role: "user", content: mensaje || "Dame un consejo técnico breve." });

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    res.status(200).json({ respuesta: response.choices[0].message.content });
  } catch (error) {
    console.error("❌ ERROR EN AGRO-IA:", error.message);
    res.status(500).json({ detalle: error.message });
  }
};
