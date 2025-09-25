import { Schema, model, Types } from "mongoose";

const ContentSchema = new Schema({
  title: String,
  link: String,
  type: {
    type: String,
    enum: ["note", "youtube", "tweet"],
    required: true
  },
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  tags: [{ 
    type: Types.ObjectId,
    ref: "Tag",
    index: true 
  }],
  textContent: String,

  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },

  embedding: {
    type: [Number],
    default: undefined
  },
  embeddingStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
    index: true
  },
  embeddingAttempts: { type: Number, default: 0 },
  embeddingError: { type: String, default: null },

  ingestionStatus: {
    type: String,
    enum: ["pending", "success", "failed", "skipped"],
    default: "pending",
    index: true
  },
  ingestionAttempts: { type: Number, default: 0 },
  ingestionError: { type: String, default: null },

  createdAt: { type: Date, default: Date.now }
});

export const ContentModel = model("Content", ContentSchema);
