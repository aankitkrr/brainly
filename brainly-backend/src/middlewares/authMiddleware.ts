import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASS } from "../config";

interface JwtPayload {
  id: string;
}

export const authMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization ?? "";
  let token: string | undefined;

  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else {
    token = authHeader.trim();
  }

  if (!token) {
    res.status(401).json({ message: "Authorization token missing or invalid" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_PASS) as { id: string };
    (req as any).user = { id: decoded.id };
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};
