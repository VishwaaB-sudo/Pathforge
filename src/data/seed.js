import { now } from '@/lib/utils';
import { CONCEPTS } from './concepts';
import { buildQuestions } from './questions';
import { buildRoster } from './roster';
import RESOURCES from './resources';
import { TASKS } from './task';

export const FACULTY_NAME = 'Dr. Meena Rao';
export const DEMO_STUDENT = 'arun@demo.edu';

/**
 * Per-student learning record.
 * und/ex/prac are keyed by concept id so recovery is concept-agnostic.
 */
export const newMe = () => ({
  consent: false,
  pre: null,
  post: null,
  und: {},
  ex: {},
  prac: {},
  mist: [],
  act: [],
});

export function seed() {
  const qs = buildQuestions();
  const res = {};
  CONCEPTS.forEach((c) => {
    const [notes, ex, kw] = RESOURCES[c.id];
    res[c.id] = { notes, ex, kw };
  });
  const at = now();

  return {
    role: null,
    user: null,
    concepts: CONCEPTS.map((c) => ({ ...c })),
    qs,
    nid: qs.length + 1,
    res,
    tasks: structuredClone(TASKS),
    roster: buildRoster(CONCEPTS),
    subs: [
      {
        id: 'd1',
        who: 'Divya Nair',
        tid: 'rec',
        demo: 1,
        code: 'def factorial(n):\n    if n == 0:\n        return 1\n    return n * factorial(n - 1)',
        expl: 'The base case n == 0 returns 1 so the calls stop. Each call multiplies n by the result for n - 1.',
        status: 'verified',
        rub: [4, 4, 4, 3],
        fb: 'Clear and correct. Consider guarding negative input.',
        by: FACULTY_NAME,
        at,
      },
      {
        id: 'd2',
        who: 'Harini Iyer',
        tid: 'rec',
        demo: 1,
        code: 'def factorial(n):\n    return n * factorial(n - 1)',
        expl: 'It multiplies n by the factorial of the number before it.',
        status: 'pending',
      },
      {
        id: 'd3',
        who: 'Gokul Rao',
        tid: 'arr',
        demo: 1,
        code: 'def stats(nums):\n    total = sum(nums)\n    return total, total / len(nums), min(nums), max(nums)',
        expl: 'One pass built-ins: sum, average (total / count), min and max over the list.',
        status: 'verified',
        rub: [3, 3, 3, 2],
        fb: 'Good. Explain the trace in more detail.',
        by: FACULTY_NAME,
        at,
      },
    ],
    users: [
      { e: DEMO_STUDENT, n: 'Arun Kumar', role: 'student' },
      { e: 'meena@demo.edu', n: FACULTY_NAME, role: 'faculty' },
      { e: 'admin@demo.edu', n: 'Admin', role: 'admin' },
    ],
    mes: { [DEMO_STUDENT]: newMe() },
    notes: [],
  };
}
