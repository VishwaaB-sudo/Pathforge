// Applied tasks. `id` doubles as the concept id it belongs to (for the pilot each
// concept has at most one applied task). Code is never executed anywhere.
export const TASKS = [
  {
    id: 'rec',
    c: 'rec',
    title: 'Implement Recursive Factorial',
    obj: 'Write a recursive function that returns n! and explain how your base case ends the recursion.',
    req: [
      'A function named factorial(n)',
      'A base case for n = 0',
      'A recursive call for n > 0',
      'A short written explanation',
    ],
    ins: [
      'Read the Recursion notes and worked example.',
      'Write factorial(n) in the Submission tab. Do not use loops.',
      'Trace factorial(3) by hand and describe it in your explanation.',
      'Submit. A faculty member scores it against the rubric.',
    ],
    rubric: [
      ['Base case', 'Stops correctly at n = 0'],
      ['Recursive step', 'Calls itself on a smaller input'],
      ['Correctness', 'Returns the right value for sample inputs'],
      ['Explanation', 'Explains the trace and base case clearly'],
    ],
    viva: [
      [
        'What happens if factorial has no base case?',
        'RecursionError: the calls never stop and the stack overflows.',
      ],
      ['Why does each call use n - 1?', 'It moves the input toward the base case.'],
      ['Trace factorial(3).', '3 * (2 * (1 * 1)) = 6'],
    ],
  },
  {
    id: 'arr',
    c: 'arr',
    title: 'Array Statistics Analyzer',
    obj: 'Write a function that returns the sum, average, minimum and maximum of a list of numbers.',
    req: [
      'A function taking one list argument',
      'Correct sum and average',
      'Correct minimum and maximum',
      'A short written explanation',
    ],
    ins: [
      'Read the Arrays & Lists notes and worked example.',
      'Write your function in the Submission tab.',
      'Trace it once with the sample list [4, 8, 1, 6].',
      'Submit. A faculty member scores it against the rubric.',
    ],
    rubric: [
      ['Correct traversal', 'Visits every element once'],
      ['Sum & average', 'Both computed correctly'],
      ['Min & max', 'Handles the sample list correctly'],
      ['Explanation', 'Explains the trace and edge cases clearly'],
    ],
    viva: [
      ['What does your function do with an empty list?', 'Return a sensible default or handle it explicitly.'],
      ['Why not sort the list to find the maximum?', 'Sorting is O(n log n); a single pass is O(n).'],
      ['Trace the sample list [4, 8, 1, 6].', 'sum 19, avg 4.75, min 1, max 8'],
    ],
  },
];

/** The task for a concept id, or null when the pilot has no applied task for it. */
export const taskForConcept = (id) => TASKS.find((t) => t.c === id) || null;
