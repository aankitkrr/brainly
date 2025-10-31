import { usePolling } from './usePolling';
import { Content } from '../types';

interface UseContentPollingOptions {
  contents: Content[];
  onRefetch: () => void;
  interval?: number;
}

export const useContentPolling = ({ 
  contents, 
  onRefetch, 
  interval = 5000 
}: UseContentPollingOptions) => {

  const hasPendingItems = contents.some(
    content => 
      content.ingestionStatus === 'pending' || 
      content.embeddingStatus === 'pending'
  );

  const { stop, start } = usePolling({
    enabled: hasPendingItems,
    interval,
    callback: onRefetch,
  });

  return { 
    hasPendingItems,
    stopPolling: stop,
    startPolling: start,
  };
};