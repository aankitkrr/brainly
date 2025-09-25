import { createClient } from "redis";

export const redisClient = createClient({
  url: "redis://localhost:6379/1"
});

let isListenerAttached = false;

export async function connectRedisRateLimiter() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  if (!isListenerAttached) {
    redisClient.on("connect", () => {
      console.log("Redis (rate limiter) connected");
    });

    redisClient.on("error", (err) => {
      console.error("Redis (rate limiter) error:", err);
    });

    isListenerAttached = true;
  }
}
