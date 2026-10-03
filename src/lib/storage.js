import { seed } from '@/data/seed';

export const STORAGE_KEY = 'pathforge_v4';

export function loadState() {
  let s = null;
  try {
    s = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    s = null;
  }
  return s || seed();
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
