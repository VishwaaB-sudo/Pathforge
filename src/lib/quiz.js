/*
 * Run length. A diagnostic is meant to be finished in one sitting, so a run is
 * capped rather than serving every published question. The cap is applied per
 * run, not to the bank, so the full bank stays available for practice.
 */
export const MAX_RUN = 14; // inside the 12-15 band the product asks for

/**
 * Caps a question set, taking questions round-robin across concepts.
 * Slicing the first N would measure only whichever concepts happened to be
 * asked first; round-robin keeps every concept represented in a short run.
 * Order is preserved per concept and the cap is deterministic.
 */
export function trimRun(qs, cap = MAX_RUN) {
  if (qs.length <= cap) return qs;
  const byConcept = new Map();
  qs.forEach((q) => {
    if (!byConcept.has(q.c)) byConcept.set(q.c, []);
    byConcept.get(q.c).push(q);
  });
  const out = [];
  for (let i = 0; out.length < cap; i += 1) {
    let added = false;
    for (const list of byConcept.values()) {
      const q = list[i];
      if (!q) continue;
      out.push(q);
      added = true;
      if (out.length === cap) break;
    }
    if (!added) break; // every concept ran out of questions
  }
  return out;
}