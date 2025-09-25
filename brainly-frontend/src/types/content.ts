export type ContentType = 'youtube' | 'tweet' | 'note';
export type IngestionStatus = 'success' | 'failed' | 'pending' | 'skipped';
export type EmbeddingStatus = 'success' | 'failed' | 'pending';

export interface Tag {
  id: string;
  name: string;
}

export interface Content {
  _id: string;
  type: ContentType;
  title: string;
  textContent?: string;
  link?: string;

  ingestionStatus: IngestionStatus;
  ingestionError?: string | null;
  ingestionAttempts?: number;

  embeddingStatus: EmbeddingStatus;
  embeddingError?: string | null;
  embeddingAttempts?: number;

  tags?: (string | Tag)[];

  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  
  deletedAt?: string;
}

export interface CreateContentRequest {
  type: ContentType;
  link?: string;
  title: string;
  textContent?: string;
  tags?: string[];
}

/**
 * Manual ingestion only requires textContent payload
 * because backend already knows content type, link, etc.
 */
export interface ManualIngestionRequest {
  textContent: string;
}

export interface RetryIngestionResponse {
  success: boolean;
  message: string;
}

export interface RetryEmbeddingResponse {
  success: boolean;
  message: string;
}

export interface BinContent extends Content {
  deletedAt: string;
}