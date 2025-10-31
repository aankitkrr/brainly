// src/hooks/useContent.ts
import { useState, useEffect, useCallback } from 'react';
import { contentService as contentAPI } from '../services/contentService';
import type { Content, CreateContentRequest } from '../types/content';

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

const getErrMsg = (err: any, fallback = 'Something went wrong') =>
  err?.response?.data?.message ||
  err?.response?.data?.msg ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

export const useContent = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [binContents, setBinContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all content
  const fetchContents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await contentAPI.getAllContent(); // returns Content[]
      setContents(items);
    } catch (err) {
      const msg = getErrMsg(err, 'Failed to fetch content');
      setError(msg);
      console.error('Fetch contents error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch bin content
  const fetchBinContents = useCallback(async () => {
    try {
      const items = await contentAPI.getBin(); // returns Content[]
      setBinContents(items);
    } catch (err) {
      console.error('Fetch bin contents error:', err);
    }
  }, []);

  // Create new content
  const createContent = useCallback(
    async (contentData: CreateContentRequest): Promise<ActionResult<Content>> => {
      try {
        const created = await contentAPI.createContent(contentData); // returns Content
        await fetchContents(); // Refresh the list
        return { success: true, data: created };
      } catch (err) {
        const errorMessage = getErrMsg(err, 'Failed to create content');
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [fetchContents]
  );

  // Soft delete content
  const deleteContent = useCallback(
    async (contentId: string): Promise<ActionResult> => {
      try {
        await contentAPI.deleteContent(contentId);
        await fetchContents(); // Refresh the list
        return { success: true };
      } catch (err) {
        const errorMessage = getErrMsg(err, 'Failed to delete content');
        return { success: false, error: errorMessage };
      }
    },
    [fetchContents]
  );

  // Undo delete (restore from bin)
  const undoDelete = useCallback(
    async (contentId: string): Promise<ActionResult> => {
      try {
        await contentAPI.undoDelete(contentId);
        await fetchContents();
        await fetchBinContents();
        return { success: true };
      } catch (err) {
        const errorMessage = getErrMsg(err, 'Failed to restore content');
        return { success: false, error: errorMessage };
      }
    },
    [fetchContents, fetchBinContents]
  );

  // Hard delete content (permanent)
  const hardDeleteContent = useCallback(
    async (contentId: string): Promise<ActionResult> => {
      try {
        await contentAPI.hardDelete(contentId);
        await fetchBinContents();
        return { success: true };
      } catch (err) {
        const errorMessage = getErrMsg(err, 'Failed to permanently delete content');
        return { success: false, error: errorMessage };
      }
    },
    [fetchBinContents]
  );

  // Retry embedding for failed content
  const retryEmbedding = useCallback(
    async (contentId: string): Promise<ActionResult> => {
      try {
        await contentAPI.retryEmbedding(contentId);
        await fetchContents(); // Refresh to show updated status
        return { success: true };
      } catch (err) {
        const errorMessage = getErrMsg(err, 'Failed to retry embedding');
        return { success: false, error: errorMessage };
      }
    },
    [fetchContents]
  );

  const retryIngestion = useCallback(
    async (_contentId: string): Promise<ActionResult> => {
      try{
        await contentAPI.retryIngestion(_contentId);
        return {success: true};
      }catch(e: any){
        const errMsg = getErrMsg(e);
        return {success: false, error : errMsg};
      }
    },
    []
  );

  const updateContentDescription = useCallback(
    async (contentId: string, textContent: string): Promise<ActionResult> => {
      try{
        await contentAPI.manualIngestion(contentId, {description: textContent});
        return {success: true };
      }catch(e : any){
        return {success: false, error: getErrMsg(e)};
      }
    },
    []
  );
  // -----------------------------------------------------------------------

  // Refetch all data
  const refetch = useCallback(async () => {
    await fetchContents();
  }, [fetchContents]);

  // Load content on mount
  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  return {
    // Data
    contents,
    binContents,
    isLoading,
    error,

    // Actions
    createContent,
    deleteContent,
    undoDelete,
    hardDeleteContent,
    retryEmbedding,

    // If some components still import these, they’ll get a clear error message
    retryIngestion,
    updateContentDescription,

    refetch,
    fetchBinContents,

    setError,
  };
};
