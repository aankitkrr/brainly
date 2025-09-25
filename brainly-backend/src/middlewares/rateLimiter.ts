// import { Request, Response, NextFunction } from "express";
// import rateLimit, {
//   RateLimitRequestHandler,
//   Options as RateLimitOptions
// } from "express-rate-limit";
// import RedisStore from "rate-limit-redis";
// import { redisClient, connectRedisRateLimiter } from "../utils/redis-rate-limit";

// type RateLimitInfo = {
//   limit: number;
//   current: number;
//   remaining: number;
//   resetTime?: Date;
// };

// export async function createRateLimiter(): Promise<RateLimitRequestHandler> {
//   await connectRedisRateLimiter();

//   const options: Partial<RateLimitOptions> = {
//     windowMs: 10_000, 
//     max: 100000,
//     standardHeaders: true,
//     legacyHeaders: false,
    
//     handler: (
//       req: Request,
//       res: Response,
//       _next: NextFunction,
//       _options
//     ) => {
//       const info = (req as any).rateLimit as RateLimitInfo | undefined;

//       console.log("BLOCKED by rate limiter", {
//         ip: req.ip,
//         info
//       });

//       res.status(429).json({
//         message: "Too many requests. Please try again later.",
//         info
//       });
//     },
//     store: new RedisStore({
//       prefix: "ratelimit:",
//       resetExpiryOnChange: false,
//       sendCommand: async (...args: string[]) => {
//         return redisClient.sendCommand(args);
//       }
//     })
//   };

//   return rateLimit(options);
// }
