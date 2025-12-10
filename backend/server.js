import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Asegúrate de instalar node-fetch

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Token de Hugging Face guardado en .env
const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const MODEL = "gpt2"; // Puedes cambiar por otro modelo si quieres

app.post("/generar-dieta", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt" });
    }

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error || "Error en la API de Hugging Face" });
    }

    const data = await response.json();
    // data es un array de resultados, tomamos el texto generado
    const generatedText = data[0]?.generated_text || "No se obtuvo resultado";

    res.json({ dieta: generatedText });
  } catch (error) {
    console.error("Error en Hugging Face API:", error);
    res.status(500).json({ error: "Error generando la dieta" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
