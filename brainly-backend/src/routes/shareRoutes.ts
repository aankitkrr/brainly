import express from "express";
import { createOrDeleteShareLink, getSharedContent } from "../controllers/shareController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/share", authMiddleware, createOrDeleteShareLink);
router.get("/:shareLink", getSharedContent);

export default router;
