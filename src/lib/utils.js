export const now = () => new Date().toISOString();

export const date = (s) =>
  new Date(s).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export const sum = (a) => a.reduce((x, y) => x + y, 0);

/** Rounded mean of an array, or null when empty. */
export const avg = (a) => (a.length ? Math.round(sum(a) / a.length) : null);

/** Overall score from a {conceptId: score} map. */
export const ov = (scores) => avg(Object.values(scores || {}));

/** Fixed banding rules shown to students and faculty (deterministic, no AI). */
export const band = (v) => (v < 60 ? 'Needs Practice' : v < 80 ? 'Learning' : 'Practiced');
