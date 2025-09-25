import { Queue } from "bullmq";
import { redisOptions } from "../utils/redis-bullmq";

export const binCleanerQueue = new Queue("bin-cleaner", {
  connection: redisOptions
});

export async function scheduleBinCleaner() {
  await binCleanerQueue.add(
    "clean",
    {},
    {
      repeat: {
        pattern: process.env.BIN_CLEANER_CRON ?? "0 * * * *"
      },
      removeOnComplete: true,
      removeOnFail: 10
    }
  );
}