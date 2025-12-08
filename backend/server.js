import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Permite que el frontend acceda al backend
app.use(express.json()); // Para leer JSON del cuerpo de las peticiones

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/generar-dieta", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // Puedes cambiar a "gpt-4" si tienes acceso
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    const dieta = response.data.choices[0].message.content;
    res.json({ dieta });
  } catch (error) {
    console.error("Error en OpenAI:", error);
    res.status(500).json({ error: "Error generando la dieta" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});