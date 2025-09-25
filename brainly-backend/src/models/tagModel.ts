import { Schema, model } from "mongoose";

const TagSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 1,
    maxlength: 50
  },
  uses: { type: Number, default: 0 },
  lastUsedAt: { type: Date, default: Date.now }
}, { timestamps: true });

TagSchema.index({ name: 1 }, { unique: true });

export const TagModel = model("Tag", TagSchema);
