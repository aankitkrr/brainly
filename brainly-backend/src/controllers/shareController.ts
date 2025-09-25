import { RequestHandler } from "express";
import { ContentModel } from "../models/contentModel";
import { LinkModel } from "../models/linkModel";
import { random } from "../utils/sharelink";

export const createOrDeleteShareLink: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const existingLink = await LinkModel.findOne({ userId });

    if(existingLink){
      await LinkModel.deleteOne({ userId });
    }
    
    const randomHash = random(10);
    await LinkModel.create({ hash: randomHash, userId });

    res.status(200).json({ shareLink: randomHash });
  } catch (err) {
    res.status(500).json({ msg: "Share link update failed", error: err });
  }
};

export const getSharedContent: RequestHandler = async (req, res) => {
  try{
    const { shareLink } = req.params;
    const link = await LinkModel.findOne({ hash: shareLink });

    if (!link) {
      res.status(404).json({ msg: "No link found" });
      return;
    }

    const content = await ContentModel.find({ userId: link.userId });
    res.status(200).json({ content });
  }catch (err) {
    res.status(500).json({ msg: "Could not fetch shared content", error: err });
  }
};
