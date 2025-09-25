import express from "express";
import { createContent, getAllContent, deleteContent, undoDelete, getBin, hardDeleteContent, retryEmbedding, retryIngestion, manualIngestion } from "../controllers/contentController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", authMiddleware, createContent);
router.get("/", authMiddleware, getAllContent);
router.delete("/:id", authMiddleware, deleteContent);
router.post("/:id/undo", authMiddleware, undoDelete);

router.get("/bin/list", authMiddleware, getBin);
router.delete("/:id/hard", authMiddleware, hardDeleteContent);

router.post("/:id/retry-embedding", authMiddleware, retryEmbedding);
router.post("/:id/retry-ingestion", authMiddleware, retryIngestion);

router.post("/:id/manual", authMiddleware, manualIngestion);

export default router;
