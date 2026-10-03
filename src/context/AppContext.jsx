import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { loadState, saveState, clearState } from '@/lib/storage';
import { seed } from '@/data/seed';

const AppContext = createContext(null);

/**
 * Holds the persisted app state `S` (users, questions, results, submissions...).
 * Change it with `update(draft => { ... })`; the draft is a deep copy, so mutating it is safe.
 */
export function AppProvider({ children }) {
  const [S, setS] = useState(loadState);
  const latest = useRef(S);

  const commit = useCallback((next) => {
    latest.current = next;
    saveState(next);
    setS(next);
  }, []);

  const update = useCallback(
    (fn) => {
      const draft = structuredClone(latest.current);
      fn(draft);
      commit(draft);
    },
    [commit],
  );

  /** Demo-only sign in. Returns true on success. */
  const login = useCallback(
    (email, password) => {
      const u = latest.current.users.find((x) => x.e === email.trim().toLowerCase());
      if (!u || password !== 'demo123') return false;
      update((d) => {
        d.role = u.role;
        d.user = u;
      });
      return true;
    },
    [update],
  );

  const logout = useCallback(
    () =>
      update((d) => {
        d.role = null;
        d.user = null;
      }),
    [update],
  );

  const resetData = useCallback(() => {
    clearState();
    commit(seed());
  }, [commit]);

  const value = useMemo(
    () => ({ S, update, login, logout, resetData, role: S.role, user: S.user }),
    [S, update, login, logout, resetData],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
