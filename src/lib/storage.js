import { seed } from '@/data/seed';

export const STORAGE_KEY = 'pathforge_v4';

export function loadState() {
  let s = null;
  try {
    s = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    s = null;
  }
  if (!s) return seed();
  // Progress is kept between visits, but the session is not: every page load
  // starts at the sign-in screen instead of dropping straight into a workspace.
  s.role = null;
  s.user = null;
  return s;
}

export function saveState(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable: demo keeps working in memory */
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
