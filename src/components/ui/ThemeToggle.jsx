import { useEffect, useState } from 'react';

// Deliberately stored under its own key so it can never interfere with app state
// (which lives under `pathforge_v4`).
const KEY = 'pathforge_theme';

const stored = () => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
};

const prefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches;

/** Light / dark switch. Null means "follow the system". */
export default function ThemeToggle() {
  const [choice, setChoice] = useState(stored);
  const [systemDark, setSystemDark] = useState(prefersDark);

  // track the OS setting while the user is on "follow system"
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    if (choice) el.dataset.theme = choice;
    else delete el.dataset.theme;
    try {
      if (choice) localStorage.setItem(KEY, choice);
      else localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, [choice]);

  const isDark = choice ? choice === 'dark' : systemDark;
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={label}
      title={label}
      onClick={() => setChoice(isDark ? 'light' : 'dark')}
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="3.4" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M9 1.6v1.6M9 14.8v1.6M16.4 9h-1.6M3.2 9H1.6M14.2 3.8l-1.1 1.1M4.9 13.1l-1.1 1.1M14.2 14.2l-1.1-1.1M4.9 4.9 3.8 3.8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M15 10.6A6.4 6.4 0 0 1 7.4 3a6.4 6.4 0 1 0 7.6 7.6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
