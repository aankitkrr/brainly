import { generateEmbedding } from "./getEmbedding";

export async function retryGenerateEmbedding(
  text: string,
  maxRetries = 3,
  delay = 1500
): Promise<number[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log("trying for embedding");
      const embedding = await generateEmbedding(text);
      if (!embedding?.length) throw new Error("Empty embedding");
      console.log("got the right embedding");
      return embedding;
    } catch (err) {
      console.warn(`Attempt ${attempt} failed: ${err}`);
      if (attempt === maxRetries) throw err;
      await new Promise((res) => setTimeout(res, delay * attempt));
      console.log("delay set");
    }
  }
  throw new Error("Embedding generation failed after retries");
}
