import { useState, useEffect, useCallback } from 'react';
import { shareService } from '../services/shareService';


export const useShare = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createShare = async (data: { name: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await shareService.createOrDeleteShare();
      
      if (result.shareLink) {
        const fullUrl = `${window.location.origin}/shared/${result.shareLink}`;
        return {
          shareLink: result.shareLink,
          url: fullUrl
        };
      } else {
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.msg || 'Failed to create share link';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    createShare,
    isLoading,
    error,
    clearError
  };
};

export const useSharedContent = (shareLink: string) => {
  const [content, setContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSharedContent = useCallback(async () => {
    if (!shareLink) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await shareService.getSharedContent(shareLink);
      setContent(data);
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to fetch shared content');
    } finally {
      setIsLoading(false);
    }
  }, [shareLink]);

  useEffect(() => {
    fetchSharedContent();
  }, [fetchSharedContent]);

  return {
    content,
    isLoading,
    error,
    refetch: fetchSharedContent
  };
};