import { useEffect } from 'react';

import { useAppStore } from '../store/useAppStore';

export const usePreloadData = (): void => {
  const preloadAll = useAppStore((state) => state.preloadAll);
  const preloadStatus = useAppStore((state) => state.preloadStatus);

  useEffect(() => {
    if (preloadStatus === 'idle') {
      void preloadAll();
    }
  }, [preloadAll, preloadStatus]);
};
