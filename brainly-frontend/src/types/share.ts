import { Content } from "./content";

export interface CreateShareRequest {
  name: string;
}

export interface ShareResponse {
  shareLink: string;
}

export interface ShareLink {
  _id: string;
  shareLink: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedContentResponse {
  content: Content[];
}