// u = unit (1-3), pre = prerequisite concept id
export const CONCEPTS = [
  { id: 'var', name: 'Variables & Types', u: 1, pre: '' },
  { id: 'loop', name: 'Loops', u: 1, pre: 'var' },
  { id: 'fn', name: 'Functions', u: 2, pre: 'var' },
  { id: 'arr', name: 'Arrays & Lists', u: 2, pre: 'loop' },
  { id: 'rec', name: 'Recursion', u: 3, pre: 'fn' },
  { id: 'dbg', name: 'Debugging', u: 3, pre: 'fn' },
  { id: 'op', name: 'Operators & Expressions', u: 1, pre: 'var' },
  { id: 'cond', name: 'Conditionals', u: 1, pre: 'op' },
  { id: 'io', name: 'Input & Output', u: 1, pre: 'var' },
  { id: 'str', name: 'Strings', u: 2, pre: 'var' },
  { id: 'dict', name: 'Dictionaries', u: 2, pre: 'arr' },
  { id: 'file', name: 'File Handling', u: 2, pre: 'str' },
  { id: 'exc', name: 'Exception Handling', u: 3, pre: 'fn' },
  { id: 'srch', name: 'Searching', u: 3, pre: 'arr' },
  { id: 'sort', name: 'Sorting Basics', u: 3, pre: 'srch' },
];
