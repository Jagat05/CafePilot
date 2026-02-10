import "dotenv/config";
import fs from "fs";

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
  try {
    console.log("Fetching models with API Key...");
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    );
    const data = await res.json();

    fs.writeFileSync("models_debug.json", JSON.stringify(data, null, 2));
    console.log("✅ Models saved to models_debug.json");

    if (data.models) {
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`- ${m.name}`);
        }
      });
    }
  } catch (err) {
    console.error("Error fetching models:", err);
  }
}

listModels();
