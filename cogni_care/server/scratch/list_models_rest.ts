import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function listAllModels() {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not configured.");
    return;
  }

  console.log("Fetching full model list via REST API...");
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data: any = await response.json();
    
    if (data.models) {
      console.log("Available Models:");
      data.models.forEach((m: any) => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
           console.log(`- ${m.name.split("/").pop()} (${m.displayName})`);
        }
      });
    } else {
      console.log("No models returned. Response:", JSON.stringify(data));
    }
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}

listAllModels();
