import React, { createContext, useContext, ReactNode } from 'react';
import { QadaState } from '@/src/core/types';
import { useQadaState } from './useQadaState';

interface QadaContextValue {
  state: QadaState | null;
  setState: (updater: (prev: QadaState | null) => QadaState) => void;
  loading: boolean;
  reset: () => Promise<void>;
}

const QadaContext = createContext<QadaContextValue | undefined>(undefined);

interface QadaProviderProps {
  children: ReactNode;
}

export function QadaProvider({ children }: QadaProviderProps) {
  const qadaState = useQadaState();

  return <QadaContext.Provider value={qadaState}>{children}</QadaContext.Provider>;
}

export function useQada(): QadaContextValue {
  const context = useContext(QadaContext);
  if (context === undefined) {
    throw new Error('useQada must be used within a QadaProvider');
  }
  return context;
}
