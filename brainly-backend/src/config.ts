import { configDotenv } from "dotenv";

configDotenv();

export const JWT_PASS = process.env.JWT_SECRET!;
export const mongodb = process.env.DB_URL!;
export const apiKey = process.env.GEMINI_API!;
export const BIN_TTL_DAYS = 30;
export const UNDO_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;