import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { makeSelectors } from '@/lib/selectors';

/** Derived-data helpers bound to the current state. */
export function useSelectors() {
  const { S } = useApp();
  return useMemo(() => makeSelectors(S), [S]);
}
