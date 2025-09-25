import { GoogleGenerativeAI } from "@google/generative-ai";
import { apiKey } from "../config";

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
    
    const result = await model.embedContent(text);

    return result.embedding.values;
  } catch (err) {
    console.error("Error generating embedding:", err);
    throw err;
  }
}
