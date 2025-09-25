import { Worker, Job } from "bullmq";
import { ContentModel } from "../models/contentModel";
import { embeddingQueue } from "../queue/embeddingQueue";
import { extractText } from "../utils/textExtractor";
import { redisOptions } from "../utils/redis-bullmq";

export const ingestionWorker = new Worker(
  "ingestionQueue",
  async (job: Job<{ contentId: string; type: string; link: string }>) => {
    const { contentId, type, link } = job.data;
    const content = await ContentModel.findById(contentId);
    if (!content || content.isDeleted || content.ingestionStatus !== "pending") return;

    try {
      await ContentModel.findByIdAndUpdate(contentId, {
        $inc: { ingestionAttempts: 1 }
      });

      const textContent = await extractText(link, type as "youtube" | "tweet");

      await ContentModel.findByIdAndUpdate(contentId, {
        textContent,
        ingestionStatus: "success",
        embeddingStatus: "pending",
        ingestionError: null
      });

      await embeddingQueue.add(
        "generate-embedding",
        { contentId, text: textContent },
        { jobId: contentId, attempts: 3, backoff: { type: "exponential", delay: 1500 }, removeOnFail: true}
      );

      console.log(`Ingestion complete for ${contentId}`);
    } catch (err: any) {
      await ContentModel.findByIdAndUpdate(contentId, {
        ingestionStatus: "failed",
        ingestionError: String(err?.message ?? err)
      });
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
