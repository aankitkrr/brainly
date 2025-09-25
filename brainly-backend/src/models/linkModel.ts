import { Schema, model, Types } from "mongoose";

const LinkSchema = new Schema({
  hash: String,
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  }
});

export const LinkModel = model("Links", LinkSchema);
