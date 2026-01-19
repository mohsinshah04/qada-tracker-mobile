import { useState, useEffect, useCallback, useRef } from 'react';
import { QadaState } from '@/src/core/types';
import { loadState, saveState, clearState } from './storage';

export function useQadaState() {
  const [state, setStateInternal] = useState<QadaState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Track if this is the initial load
  const isInitialMount = useRef(true);

  // Load state on mount
  useEffect(() => {
    let mounted = true;

    async function load() {
      const loadedState = await loadState();
      if (mounted) {
        setStateInternal(loadedState);
        setLoading(false);
        isInitialMount.current = false;
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // Persist state whenever it changes (but not on initial load)
  useEffect(() => {
    if (isInitialMount.current || loading) {
      return;
    }
    if (state !== null) {
      saveState(state);
    }
  }, [state, loading]);

  // Update state with updater function
  const setState = useCallback(
    (updater: (prev: QadaState | null) => QadaState) => {
      setStateInternal((prev) => {
        const newState = updater(prev);
        // Add timestamps
        const now = new Date().toISOString();
        return {
          ...newState,
          createdAt: prev?.createdAt || now,
          updatedAt: now,
        };
      });
    },
    []
  );

  // Reset state and clear storage
  const reset = useCallback(async () => {
    await clearState();
    setStateInternal(null);
  }, []);

  return {
    state,
    setState,
    loading,
    reset,
  };
}
