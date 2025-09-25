import { Worker, Job } from "bullmq";
import { ContentModel } from "../models/contentModel";
import { redisOptions } from "../utils/redis-bullmq";
import { retryGenerateEmbedding } from "../utils/retryEmbedding";

export const embeddingWorker = new Worker(
  "embeddingQueue",
  async (job: Job<{ contentId: string; text: string }>) => {
    const { contentId, text } = job.data;
    const content = await ContentModel.findById(contentId);
    console.log("embedding worker is online");

    if (!content || content.isDeleted) {
      console.warn(`Content ${contentId} missing/deleted. Skipping.`);
      return;
    }

    if(content.embeddingStatus === "success"){
      console.log(`Embedding already ready for ${contentId}, skipping.`);
      return;
    }

    try {
      const embedding = await retryGenerateEmbedding(text, 2, 1500);

      const stillThere = await ContentModel.findById(contentId);
      if (!stillThere || stillThere.isDeleted) {
        console.warn(`Content ${contentId} deleted mid-process. Not storing embedding.`);
        return;
      }

      await ContentModel.findByIdAndUpdate(contentId, {
        embedding,
        embeddingStatus: "success",
        embeddingAttempts: (Number(content?.embeddingAttempts) ?? 0) + 1,
        lastEmbeddingAt: new Date(),
        embeddingError: null
      });

      console.log(`Embedding stored for ${contentId}`);
    }catch (err: any) {
      const attempts = (Number(content?.embeddingAttempts) ?? 0) + 1;

      await ContentModel.findByIdAndUpdate(contentId, {
        embeddingStatus: attempts >= 3 ? "failed" : "pending",
        embeddingAttempts: attempts,
        embeddingError: String(err?.message ?? err),
        lastEmbeddingAt: new Date()
      });

      console.error(`Embedding failed for ${contentId}:`, err);
      throw err;
    }
  },
  {
    connection: redisOptions,
    concurrency: 3,
    removeOnComplete: { age: 3600 },
    removeOnFail: { count: 3 }
  }
);
