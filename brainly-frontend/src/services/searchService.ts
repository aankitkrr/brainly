import {apiClient} from "../lib/axios";
import { SearchRequest, SearchResult, TrendingTag } from '../types/search';

export const searchService = {
  async semanticSearch(data: SearchRequest): Promise<SearchResult[]> {
    const response = await apiClient.post('/api/v1/search', data);
    return response.data;
  },

  async getTrendingTags(): Promise<TrendingTag[]> {
    const response = await apiClient.get('/api/v1/search/trending-tags');
    return response.data;
  }
};