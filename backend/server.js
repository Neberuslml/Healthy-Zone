import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Necesitas instalar node-fetch si usas Node <18

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN; // Tu token Hugging Face

app.post("/generar-dieta", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Falta el prompt" });

    const response = await fetch("https://router.huggingface.co/api/tasks/text-generation", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          // Puedes incluir otros parámetros según lo necesites
        },
        options: {
          wait_for_model: true
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error || "Error en la API de Hugging Face" });
    }

    const data = await response.json();
    // data es un arreglo de objetos con "generated_text"
    const generatedText = data[0]?.generated_text || "No se generó texto";

    res.json({ dieta: generatedText });
  } catch (error) {
    console.error("Error en Hugging Face API:", error);
    res.status(500).json({ error: "Error generando la dieta" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
