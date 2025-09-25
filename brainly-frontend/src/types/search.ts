import { Content } from './content';

export interface SearchRequest {
  query: string;
  limit?: number;
  numCandidates?: number;
}

export interface SearchResult extends Omit<Content, 'textContent' | 'userId' | 'ingestionError' | 'embeddingError' | 'ingestionAttempts' | 'isDeleted' | 'deletedAt' | 'updatedAt'> {
  score: number;
}

export interface TrendingTag {
  _id: string;
  name: string;
  uses: number;
}