import { Queue } from "bullmq";
import { redisOptions } from "../utils/redis-bullmq";

export const embeddingQueue = new Queue("embeddingQueue", {
  connection: redisOptions
});

export type EmbeddingJobData = {
  contentId: string;
  text: string;
};
