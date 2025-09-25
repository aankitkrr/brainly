import { RequestHandler } from "express";
import { ContentModel } from "../models/contentModel";
import { embeddingQueue } from "../queue/embeddingQueue";
import { BIN_TTL_DAYS, UNDO_WINDOW_MS } from "../config";
import { ingestionQueue } from "../queue/ingestionQueue";
import { TagModel } from "../models/tagModel";

export const createContent: RequestHandler = async (req, res) => {
  try {
    const { title, link, type, tags, textContent } = req.body;
    const userId = (req as any).user.id;

    const rawTags = Array.isArray(req.body.tags) ? req.body.tags : [];
    const tagNames = [...new Set(rawTags.map((tag: string) => tag.trim().toLowerCase()))].slice(0, 20);

    await TagModel.bulkWrite(tagNames.map(name => ({
      updateOne: {
        filter: { name },
        update: {
          $setOnInsert: { name },
          $set: { lastUsedAt: new Date() },
          $inc: { uses: 1 }
        },
        upsert: true
      }
    })), { ordered: false });

    const tagDocs = await TagModel.find({ name: { $in: tagNames } }, "_id");
    const tagIds = tagDocs.map(tag => tag._id);

    const content = await ContentModel.create({
      title,
      link,
      type,
      tags : tagIds,
      userId,
      textContent: type === "note" ? textContent : undefined,
      ingestionStatus: type === "note" ? "success" : "pending",
      ingestionAttempts: type === "note" ? 1 : 0,
      embeddingStatus: type === "note" ? "pending" : undefined
    });

    if (type === "note") {
      await embeddingQueue.add(
        "generate-embedding",
        { contentId: content._id.toString(), text: textContent },
        { jobId: content._id.toString(), attempts: 3, backoff: { type: "exponential", delay: 1500 }, removeOnFail: true }
      );
    } else {
      await ingestionQueue.add(
        "ingest-content",
        { contentId: content._id.toString(), type, link },
        { jobId: content._id.toString(), attempts: 3, backoff: { type: "exponential", delay: 1500 }, removeOnFail: true }
      );
    }

    res.status(201).json({ message: "Content created", content });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create content" });
  }
};


export const getAllContent : RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const contents = await ContentModel.find({ userId, isDeleted: false }).populate("tags");
    res.status(200).json(contents);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching content", error: err });
  }
};

export const getBin: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const contents = await ContentModel.find({ userId, isDeleted: true }).sort({ deletedAt: -1 });
    res.status(200).json(contents);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bin", error: err });
  }
};

export const deleteContent: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const contentId = req.params.id;

    const content = await ContentModel.findOneAndUpdate(
      { _id: contentId, userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if(!content){
      res.status(404).json({ message: "Content not found or already deleted" });
      return;
    }

    if (!content) {
      res.status(404).json({ msg: "Content not found or unauthorized" });
      return;
    }

    res.status(200).json({ msg: "Content deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting content", error: err });
  }
};

export const undoDelete: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const content = await ContentModel.findOne({ _id: id, userId });
    if (!content || !content.isDeleted || !content.deletedAt) {
      res.status(404).json({ message: "Content not found or not deleted" });
      return;
    }

    const elapsed = Date.now() - new Date(content.deletedAt as Date).getTime();
    if (elapsed > UNDO_WINDOW_MS) {
      res.status(409).json({ message: "Undo window expired" });
      return;
    }

    content.isDeleted = false;
    content.deletedAt = null;

    await content.save();

    res.status(200).json({ message: "Content restored" });
  } catch (err) {
    res.status(500).json({ message: "Error undoing delete", error: err });
  }
};

export const hardDeleteContent: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const content = await ContentModel.findOne({ _id: id, userId });
    if (!content) {
      res.status(404).json({ message: "Content not found" });
      return;
    }

    await ContentModel.deleteOne({ _id: id });

    res.status(200).json({ message: "Content permanently deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error hard deleting content", error: err });
  }
};

export const purgeOldSoftDeleted = async () => {
  const cutoff = new Date(Date.now() - BIN_TTL_DAYS * 24 * 60 * 60 * 1000);

  const toDelete = await ContentModel.find({
    isDeleted: true,
    deletedAt: { $lte: cutoff }
  }).select("_id");

  if (!toDelete.length) return 0;

  const ids = toDelete.map((d) => d._id);
  await ContentModel.deleteMany({ _id: { $in: ids } });

  return ids.length;
};

export const retryEmbedding: RequestHandler = async (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const content = await ContentModel.findOne({ _id: id, userId });
  if (!content) {
    res.status(404).json({ message: "Not found" });
    return;
  }

  if (content.embeddingStatus === "success") {
    res.status(409).json({ message: "Embedding already ready" });
    return;
  }

  await ContentModel.findByIdAndUpdate(id, {
    embeddingStatus: "pending",
    embeddingError: null
  });

  await embeddingQueue.add(
    "generate-embedding",
    { contentId: id,
      text: content.textContent
    },{ 
      jobId: content._id.toString(),
      attempts: 3,
      backoff: { type: "exponential", delay: 1500 },
      removeOnFail: true
    }
  );

  res.json({ message: "Re-queued embedding job" });
};

export const retryIngestion: RequestHandler = async (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  const content = await ContentModel.findOne({ _id: id, userId });
  if (!content) {
    res.status(404).json({ message: "Content not found" });
    return;
  }

  if (content.ingestionStatus === "success") {
    res.status(409).json({ message: "Already ingested" });
    return;
  }

  await ContentModel.findByIdAndUpdate(id, {
    ingestionStatus: "pending",
    ingestionError: null
  });

  await ingestionQueue.add(
    "ingest-content",
    { contentId: id, type: content.type, link: content.link },
    { jobId: id, attempts: 3, backoff: { type: "exponential", delay: 1500 }, removeOnFail: true }
  );

  res.status(200).json({ message: "Re-queued for ingestion" });
};

export const manualIngestion: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { description } = req.body;
    console.log(id);
    if(!description){
      res.status(400).json({ message: "Description too short or missing" });
      return;
    }

    const content = await ContentModel.findOne({ _id: id, userId });
    if(!content){
      res.status(404).json({ message: "Content not found" });
      return;
    }

    content.textContent = description;
    content.ingestionStatus = "success";
    content.ingestionError = null;
    content.embeddingStatus = "pending";
    await content.save();

    await embeddingQueue.add(
      "generate-embedding",
      { contentId: content._id.toString(), text: description },
      { 
        jobId: content._id.toString(),
        attempts: 3,
        backoff: { type: "exponential", delay: 1500 },
        removeOnFail: true 
      }
    );

    res.status(200).json({ message: "Manual ingestion complete. Embedding queued.", content });
  } catch (err) {
    console.error("Manual ingestion failed:", err);
    res.status(500).json({ message: "Manual ingestion failed", error: err });
  }
};
