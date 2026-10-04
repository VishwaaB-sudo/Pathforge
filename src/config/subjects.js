import { CONCEPTS } from '@/data/concepts';

/*
 * Subjects offered in the top bar and in the diagnostic picker.
 *
 * `concepts` is a list of `{ id, name }`. Programming Fundamentals reads its
 * list straight from the course data, so it can never drift from the question
 * bank. The other subjects are catalogued only — they have no questions yet,
 * so the picker reports that before a run starts instead of failing silently.
 */
const pf = CONCEPTS.map(({ id, name }) => ({ id, name }));

export const SUBJECTS = [
  { id: 'pf', name: 'Programming Fundamentals', code: 'CSE/IT', concepts: pf },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    code: 'CSE',
    concepts: ['Trees', 'Graphs', 'Greedy Methods', 'Dynamic Programming', 'Hashing'].map((name) => ({
      id: `dsa:${name.toLowerCase().replace(/[^a-z]+/g, '-')}`,
      name,
    })),
  },
  {
    id: 'oop',
    name: 'Object-Oriented Programming',
    code: 'CSE/IT',
    concepts: ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Interfaces', 'Abstraction'].map(
      (name) => ({ id: `oop:${name.toLowerCase().replace(/[^a-z]+/g, '-')}`, name }),
    ),
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    code: 'CSE',
    concepts: ['SQL & Queries', 'Normalisation', 'Keys & Indexing', 'Transactions', 'Concurrency'].map(
      (name) => ({ id: `dbms:${name.toLowerCase().replace(/[^a-z]+/g, '-')}`, name }),
    ),
  },
  {
    id: 'os',
    name: 'Operating Systems',
    code: 'CSE',
    concepts: ['Processes & Threads', 'Scheduling', 'Memory Management', 'Synchronisation', 'File Systems'].map(
      (name) => ({ id: `os:${name.toLowerCase().replace(/[^a-z]+/g, '-')}`, name }),
    ),
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    code: 'CSE/IT',
    concepts: ['TCP/IP', 'Application Layer', 'Routing', 'Network Security', 'DNS'].map((name) => ({
      id: `cn:${name.toLowerCase().replace(/[^a-z]+/g, '-')}`,
      name,
    })),
  },
];

export const DEFAULT_SUBJECT = 'pf';

/** Falls back to the default subject so an unknown id never renders blank. */
export const findSubject = (id) => SUBJECTS.find((s) => s.id === id) || SUBJECTS[0];

/** Label shown in the top bar dropdown: name plus the section code. */
export const subjectLabel = (s, role) =>
  `${s.name}${s.id === 'pf' && role === 'faculty' ? ' · CSE-A' : s.code ? ` · ${s.code}` : ''}`;