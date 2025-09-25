import { RedisOptions } from "ioredis";

export const redisOptions: RedisOptions = {
  host: "127.0.0.1",
  port: 6379,
  retryStrategy(times) {
    return Math.min(times * 1000, 10000);
  }
};
