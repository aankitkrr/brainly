import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
import contentRoutes from "./routes/contentRoutes";
import searchRoutes from "./routes/searchRoutes";
import shareRoutes from "./routes/shareRoutes";
// import { createRateLimiter } from "./middlewares/rateLimiter";
import { scheduleBinCleaner } from "./queue/binCleanerQueue";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
// app.set("trust proxy", 1);

const PORT = process.env.PORT || 3000;

async function server() {
  try{
    await mongoose.connect(process.env.DB_URL!);
    console.log("MongoDB connected");

    // const limiter = await createRateLimiter();

    await import("./workers/embeddingWorker");
    await import("./workers/ingestionWorker");
    await import("./workers/binCleanerWorker");

    app.use("/api/v1/auth", authRoutes);
    app.use("/api/v1/content", contentRoutes);
    app.use("/api/v1/search", searchRoutes);
    app.use("/api/v1/brain", shareRoutes);

    scheduleBinCleaner();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  }catch (err){
    console.error("Failed to start server:", err);
  }
}

server();

// import express, { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import { ContentModel, LinkModel, UserModel } from "./db";
// import { JWT_PASS } from "./config";
// import { authMiddleware } from "./middlewares/authMiddleware";
// import { random } from "./utils/sharelink";
// import cors from "cors";
// import { z } from "zod";
// import { generateEmbedding } from "./utils/embeddings";
// import { getYoutubeTranscript } from "./utils/getTranscript";
// import { getTweetTextViaScraping } from "./utils/getTweet";
// import { limiter } from './middlewares/rateLimiter';

// const app = express();
// app.use(express.json());
// app.use(cors());

// const signupSchema = z.object({
//   username: z
//     .string()
//     .min(3, "At least 3 characters")
//     .max(20, "At most 20 characters")
//     .regex(/^[a-z0-9._]+$/, "Username must contain only lowercase letters, digits, '.', or '_'"),
//   password: z
//     .string()
//     .min(7, "At least 7 characters")
//     .max(20, "At most 20 characters")
//     .regex(/[A-Z]/, "Password must contain an uppercase letter")
//     .regex(/[0-9]/, "Password must contain at least one number")
//     .regex(/[!@#$%^&*]/, "Password must contain at least one special character")
// });

// app.post("/api/v1/signup", async (req: Request, res: Response): Promise<void> => {
//   const { username, password } = req.body;
//   const result = signupSchema.safeParse({ username, password });

//   if (!result.success) {
//     res.status(400).json({ message: result.error.format() });
//     return;
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await UserModel.create({ username, password: hashedPassword });
//     res.json({ message: "User signed up" });
//   } catch {
//     res.status(411).json({ message: "User already exists" });
//   }
// });

// app.post("/api/v1/signin", async (req: Request, res: Response): Promise<void> => {
//   const { username, password } = req.body;

//   const existingUser = await UserModel.findOne({ username });
//   if (!existingUser) {
//     res.status(403).json({ message: "Incorrect credentials or user doesn't exist" });
//     return;
//   }

//   const isMatch = await bcrypt.compare(password, existingUser.password!);
//   if (!isMatch) {
//     res.status(403).json({ message: "Incorrect credentials" });
//     return;
//   }

//   const token = jwt.sign({ id: existingUser._id }, JWT_PASS);
//   res.json({ token });
// });

// app.post("/api/v1/content", authMiddleware, async (req: Request, res: Response): Promise<void> => {
//   const { link, type, title, textContent, embedding } = req.body;
//   const userId = (req as any).userId;

//   if (!embedding || !Array.isArray(embedding)) {
//     res.status(400).json({ message: "Embedding required and must be an array" });
//     return;
//   }

//   await ContentModel.create({
//     link,
//     type,
//     title,
//     userId,
//     tags: [],
//     textContent,
//     embedding
//   });

//   res.json({ message: "Content added successfully" });
// });

// app.get("/api/v1/content", authMiddleware, async (req: Request, res: Response): Promise<void> => {
//   const userId = (req as any).userId;

//   const content = await ContentModel.find({ userId }).populate("userId", "username");
//   res.json({ content });
// });

// app.delete("/api/v1/content/:id", authMiddleware, async (req: Request, res: Response): Promise<void> => {
//   const userId = (req as any).userId;
//   const contentId = req.params.id;

//   try {
//     await ContentModel.deleteOne({ _id: contentId, userId });
//     res.status(200).json({ message: "Content deleted successfully" });
//   } catch (e) {
//     res.status(404).json({ message: "Content not found or unauthorized" });
//   }
// });

// app.post("/api/v1/brain/share", authMiddleware, async (req: Request, res: Response): Promise<void> => {
//   const userId = (req as any).userId;
//   const { share } = req.body;

//   if (share) {
//     const existingLink = await LinkModel.findOne({ userId });
//     if (existingLink) {
//       res.json({ hash: existingLink.hash });
//       return;
//     }

//     const hash = random(10);
//     await LinkModel.create({ userId, hash });
//     res.status(200).json({ hash });
//   } else {
//     await LinkModel.deleteOne({ userId });
//     res.status(200).json({ message: "Updated sharable link successfully" });
//   }
// });

// app.get("/api/v1/brain/:shareLink", async (req: Request, res: Response): Promise<void> => {
//   const hash = req.params.shareLink;
//   const link = await LinkModel.findOne({ hash });

//   if (!link) {
//     res.status(411).json({ message: "Link doesn't exist" });
//     return;
//   }

//   const content = await ContentModel.find({ userId: link.userId });
//   const user = await UserModel.findById(link.userId);

//   res.json({ username: user?.username, content });
// });

// app.post("/api/v1/search", authMiddleware, async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { query, limit = 5 } = req.body;
//     if (!query) {
//       res.status(400).json({ error: "Query required" });
//       return;
//     }

//     const embedding = await generateEmbedding(query);

//     const results = await ContentModel.aggregate([
//       {
//         $vectorSearch: {
//           queryVector: embedding,
//           path: "embedding",
//           numCandidates: 100,
//           limit,
//           index: "vector_index"
//         }
//       },
//       {
//         $project: {
//           title: 1,
//           textContent: 1,
//           type: 1,
//           source: 1,
//           tags: 1,
//           createdAt: 1,
//           score: { $meta: "vectorSearchScore" }
//         }
//       }
//     ]);

//     res.status(200).json({ results });
//   } catch (error) {
//     console.error("Semantic Search Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.post("/api/v1/transcript-from-youtube", authMiddleware, async (req: Request, res: Response): Promise<void> => {
//   const { url, title } = req.body;
//   const userId = (req as any).userId;

//   if (!url || !title) {
//     res.status(400).json({ message: "YouTube URL and title are required" });
//     return;
//   }

//   try {
//     const textContent = await getYoutubeTranscript(url);
//     const embedding = await generateEmbedding(textContent);

//     await ContentModel.create({
//       title,
//       link: url,
//       type: "youtube",
//       userId,
//       textContent,
//       embedding,
//       tags: []
//     });

//     res.status(200).json({ message: "YouTube transcript saved successfully" });
//   } catch (err) {
//     console.error("YouTube transcript error:", err);
//     res.status(500).json({ message: "Failed to extract or embed transcript" });
//   }
// }); 


// app.post("/api/v1/tweet-text", authMiddleware, async (req: Request, res: Response): Promise<void> => {
//   const { url, title } = req.body;
//   const userId = (req as any).userId;

//   if (!url || !title) {
//     res.status(400).json({ message: "Tweet URL and title are required" });
//     return;
//   }

//   try {
//     const textContent = await getTweetTextViaScraping(url);
//     const embedding = await generateEmbedding(textContent);

//     await ContentModel.create({
//       title,
//       link: url,
//       type: "tweet",
//       userId,
//       textContent,
//       embedding,
//       tags: []
//     });

//     res.status(200).json({ message: "Tweet content saved successfully" });
//   } catch (err) {
//     console.error("Tweet extraction error:", err);
//     res.status(500).json({ message: "Failed to extract or embed tweet" });
//   }
// });


// app.listen(3000);
