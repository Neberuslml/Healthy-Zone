import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Ruta para obtener dietas compatibles según sexo y ejercicio
app.post("/obtener-dietas", async (req, res) => {
  try {
    const { sexo, ejercicio } = req.body;

    if (!sexo || ejercicio === undefined) {
      return res.status(400).json({ error: "Faltan parámetros 'sexo' o 'ejercicio'" });
    }

    const dietasPath = path.join(process.cwd(), "dietas.json");
    const data = await fs.readFile(dietasPath, "utf-8");
    const dietas = JSON.parse(data);

    // Filtrar dietas por sexo y rango de ejercicio semanal
    const dietasFiltradas = dietas.filter(d => 
      d.sexo.toLowerCase() === sexo.toLowerCase() &&
      ejercicio >= d.minEjercicio &&
      ejercicio <= d.maxEjercicio
    );

    res.json({ dietas: dietasFiltradas });
  } catch (error) {
    console.error("Error obteniendo dietas:", error);
    res.status(500).json({ error: "Error interno al obtener dietas" });
  }
});

// Ruta para obtener contenido de dieta por id
app.get("/dieta/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const dietasPath = path.join(process.cwd(), "dietas.json");
    const data = await fs.readFile(dietasPath, "utf-8");
    const dietas = JSON.parse(data);

    const dieta = dietas.find(d => d.id === id);

    if (!dieta) {
      return res.status(404).json({ error: "Dieta no encontrada" });
    }

    res.json({ contenido: dieta.contenido });
  } catch (error) {
    console.error("Error obteniendo dieta:", error);
    res.status(500).json({ error: "Error interno al obtener dieta" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
