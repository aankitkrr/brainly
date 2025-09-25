import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { semanticSearch } from "../controllers/searchController";


const router = express.Router();

router.post("/", authMiddleware, semanticSearch);

export default router;
