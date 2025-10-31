import { useState, useCallback } from 'react';
import { searchService } from '../services/searchService';
import { SearchRequest, SearchResult } from '../types';
import { handleApiError } from '../utils/errorHandler';

interface UseSearchReturn {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  search: (query: string, options?: Partial<SearchRequest>) => Promise<void>;
  clearResults: () => void;
}

export const useSearch = (): UseSearchReturn => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const search = useCallback(async (query: string, options?: Partial<SearchRequest>) => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const searchData: SearchRequest = {
        query: query.trim(),
        limit: 10,
        numCandidates: 200,
        ...options
      };

      const searchResults = await searchService.semanticSearch(searchData);
      setResults(searchResults);
      setHasSearched(true);
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
    setHasSearched(false);
  }, []);

  return {
    results,
    isLoading,
    error,
    hasSearched,
    search,
    clearResults
  };
};
