import { useEffect, useRef } from 'react';

interface UsePollingOptions {
  enabled: boolean;
  interval: number;
  callback: () => void | Promise<void>;
}

export const usePolling = ({ enabled, interval, callback }: UsePollingOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(() => {
        callbackRef.current();
      }, interval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [enabled, interval]);

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = () => {
    if (!intervalRef.current && enabled) {
      intervalRef.current = setInterval(() => {
        callbackRef.current();
      }, interval);
    }
  };

  return { stop, start };
};