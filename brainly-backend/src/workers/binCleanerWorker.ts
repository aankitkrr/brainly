import { Worker } from "bullmq";
import { redisOptions } from "../utils/redis-bullmq";
import { purgeOldSoftDeleted } from "../controllers/contentController";

export const binCleanerWorker = new Worker(
  "bin-cleaner",
  async () => {
    const purgedCount = await purgeOldSoftDeleted();
    if (purgedCount) {
      console.log(`Purged ${purgedCount} hard-deleted contents from bin`);
    }
  },
  { connection: redisOptions }
);

binCleanerWorker.on("failed", (job, err) => {
  console.error("Bin cleaner failed", job?.id, err);
});
