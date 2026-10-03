import { RAW_QUESTIONS } from './rawQuestions';

/**
 * Turns the raw tuples into question objects.
 * set: 0 = diagnostic, 1 = reassessment, 2 = practice only, 3 = both.
 * From question 25 onward the correct option is moved around so it is not always the same slot.
 */
export function buildQuestions() {
  return RAW_QUESTIONS.map((q, i) => {
    let o = q[2];
    let a = q[3];
    let set = i % 4 < 2 ? 0 : 1;
    if (i >= 24) {
      set = [0, 3, 1][(i - 24) % 3];
      const k = (i * 5 + 1) % 4;
      const correct = o[a];
      const rest = o.filter((_, j) => j !== a);
      rest.splice(k, 0, correct);
      o = rest;
      a = k;
    }
    return { id: i + 1, c: q[0], t: q[1], o, a, err: q[4], e: q[5], set };
  });
}
