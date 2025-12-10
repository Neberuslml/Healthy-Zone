import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch"; // instala node-fetch si usas Node <18

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN;

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
        },
        options: {
          wait_for_model: true,
        },
      }),
    });

    if (!response.ok) {
      // Intentar leer el texto en caso no sea JSON
      const text = await response.text();
      console.error("Respuesta no JSON de Hugging Face:", text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();

    const generatedText = data[0]?.generated_text || "No se generó texto";

    res.json({ dieta: generatedText });
  } catch (error) {
    console.error("Error en backend:", error);
    res.status(500).json({ error: "Error generando la dieta" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});
