import {apiClient} from "../lib/axios";
import { Content, CreateContentRequest, RetryIngestionResponse, RetryEmbeddingResponse, BinContent } from "../types/content";

export const contentService = {
  async getAllContent(): Promise<Content[]> {
    const response = await apiClient.get("/api/v1/content");
    return response.data;
  },

  async createContent(content: CreateContentRequest): Promise<Content> {
    const response = await apiClient.post("/api/v1/content", content);
    return response.data;
  },

  async deleteContent(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/content/${id}`);
  },

  async undoDelete(id: string): Promise<void> {
    await apiClient.post(`/api/v1/content/${id}/undo`);
  },

  async getBin(): Promise<BinContent[]> {
    const response = await apiClient.get("/api/v1/content/bin/list");
    return response.data;
  },

  async hardDelete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/content/${id}/hard`);
  },

  async retryEmbedding(id: string): Promise<RetryEmbeddingResponse> {
    const response = await apiClient.post(`/api/v1/content/${id}/retry-embedding`);
    return response.data;
  },

  async retryIngestion(id: string): Promise<RetryIngestionResponse> {
    const response = await apiClient.post(`/api/v1/content/${id}/retry-ingestion`);
    return response.data;
  },

  async manualIngestion(id: string, data: { description: string }): Promise<Content> {
    const response = await apiClient.post(`/api/v1/content/${id}/manual`, data);
    return response.data;
  }
};
