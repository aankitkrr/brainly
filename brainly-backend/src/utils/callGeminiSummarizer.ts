import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API
});

const MODEL = "gemini-2.5-flash";

export async function callGeminiSummarizer(link: string, type: "youtube"): Promise<string> {
  let prompt = "";

  if (type === "youtube") {
    prompt = `Summarize the content of this YouTube video into 2-3 clear paragraphs. 
Extract key ideas, themes, and takeaways. 
Avoid filler and be concise.\n\nVideo Link: ${link}`;
  } else {
    throw new Error("Unsupported type for Gemini summarization");
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt
    });
    // console.log(response);
    console.log(link);

    return response.text!.trim();
  } catch (err: any) {
    console.error("Gemini summarization failed:", err.message || err);
    throw new Error("Gemini summarization failed");
  }
}
