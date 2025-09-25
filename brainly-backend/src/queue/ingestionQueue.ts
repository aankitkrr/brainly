import { Queue } from "bullmq";
import { redisOptions } from "../utils/redis-bullmq";

export const ingestionQueue = new Queue("ingestionQueue", {
  connection: redisOptions
});
