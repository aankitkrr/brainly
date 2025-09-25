import {apiClient} from "../lib/axios";
import { ShareResponse, Content } from '../types';

export const shareService = {
  async createOrDeleteShare(): Promise<ShareResponse> {
    const response = await apiClient.post('/api/v1/brain/share');
    return response.data;
  },

  async getSharedContent(shareLink: string): Promise<Content[]> {
    const response = await apiClient.get(`/api/v1/brain/${shareLink}`);
    return response.data.content;
  }
};