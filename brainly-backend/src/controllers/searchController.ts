import { RequestHandler } from "express";
import { Types } from "mongoose";
import { generateEmbedding } from "../utils/getEmbedding";
import { ContentModel } from "../models/contentModel";
import { TagModel } from "../models/tagModel";

export const semanticSearch: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { query, limit = 10, numCandidates = 200 } = req.body;

    const queryEmbedding = await generateEmbedding(query);
    console.log(`Query: ${query}`);
    console.log(`Embedding length: ${queryEmbedding.length}`);

    const results = await ContentModel.aggregate([
      {
        $vectorSearch: {
          index: "vector_index_1", 
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates,
          limit,
          filter: {
            userId: new Types.ObjectId(userId),
            isDeleted: false
          }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          link: 1,
          type: 1,
          tags: 1,
          createdAt: 1,
          score: { $meta: "vectorSearchScore" },
          embeddingStatus: 1,
          ingestionStatus: 1
        }
      },
      {
        $match: {
          score: { $gte: 0.76}
        }
      },
      { $sort: { score: -1 } 
    }]);

    res.status(200).json(results);
  } catch (err) {
    console.error("Semantic search failed:", err);
    res.status(500).json({ msg: "Search failed", err });
  }
};

export const getTrendingTags: RequestHandler = async (req, res) => {
  try {
    const trending = await TagModel.find()
      .sort({ uses: -1, lastUsedAt: -1 })
      .limit(20)
      .select("name uses");

    res.status(200).json(trending);
  } catch (err) {
    console.error("Failed to fetch trending tags:", err);
    res.status(500).json({ msg: "Error fetching trending tags", err });
  }
};
