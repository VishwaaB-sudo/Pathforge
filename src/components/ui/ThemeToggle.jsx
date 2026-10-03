import { useEffect, useState } from 'react';

// Deliberately stored under its own key so it can never interfere with app state
// (which lives under `pathforge_v4`).
const KEY = 'pathforge_theme';

// AMOLED dark is the product's default look, so "no saved choice" resolves to
// dark rather than to whatever the OS happens to prefer.
const stored = () => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'dark';
  } catch {
    return 'dark';
  }
};



/** Light / dark switch. Defaults to AMOLED dark. */
export default function ThemeToggle() {
  const [choice, setChoice] = useState(stored);

  useEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = choice;
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, [choice]);

  const isDark = choice === 'dark';
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
