import { useState, useEffect, useCallback } from 'react';
import { searchService } from '../services/searchService';
import { TrendingTag } from '../types';
import { handleApiError } from '../utils/errorHandler';

interface UseTrendingTagsReturn {
  tags: TrendingTag[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTrendingTags = (): UseTrendingTagsReturn => {
  const [tags, setTags] = useState<TrendingTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const trendingTags = await searchService.getTrendingTags();
      setTags(trendingTags);
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    isLoading,
    error,
    refetch: fetchTags
  };
};