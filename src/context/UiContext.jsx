import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { DEFAULT_SUBJECT } from '@/config/subjects';

const UiContext = createContext(null);

/** Short-lived UI state that is not saved: the active quiz run, Ask PathForge chat, toast, confirm dialog. */
export function UiProvider({ children }) {
  const [run, setRun] = useState(null);
  const [chat, setChat] = useState([]);
  const [toastState, setToastState] = useState({ msg: '', show: false });
  const [confirmState, setConfirmState] = useState(null);
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  // the open diagnostic picker: { kind } while shown
  const [pick, setPick] = useState(null);
  const timer = useRef();
  const resolver = useRef(null);
  const pickResolver = useRef(null);

  const toast = useCallback((msg) => {
    setToastState({ msg, show: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastState((t) => ({ ...t, show: false })), 3000);
  }, []);

  /**
   * Ask the user to confirm a destructive action.
   * Resolves true when confirmed, false when cancelled or dismissed.
   */
  const askConfirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setConfirmState(opts);
      }),
    [],
  );

  const closeConfirm = useCallback((value) => {
    setConfirmState(null);
    const resolve = resolver.current;
    resolver.current = null;
    if (resolve) resolve(value);
  }, []);

  /**
   * Asks which subject and concept to diagnose before a run starts.
   * Resolves `{ subject, concept }` (concept may be null for "whole subject"),
   * or null when the student cancels.
   */
  const askScope = useCallback(
    (kind) =>
      new Promise((resolve) => {
        pickResolver.current = resolve;
        setPick({ kind });
      }),
    [],
  );

  const closePick = useCallback((scope) => {
    setPick(null);
    const resolve = pickResolver.current;
    pickResolver.current = null;
    if (resolve) resolve(scope);
  }, []);

  const value = useMemo(
    () => ({
      run,
      setRun,
      chat,
      setChat,
      toast,
      toastState,
      confirmState,
      askConfirm,
      closeConfirm,
      subject,
      setSubject,
      pick,
      askScope,
      closePick,
    }),
    [
      run,
      chat,
      toast,
      toastState,
      confirmState,
      askConfirm,
      closeConfirm,
      subject,
      pick,
      askScope,
      closePick,
    ],
  );
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export const useUi = () => useContext(UiContext);
