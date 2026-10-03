/**
 * Ask PathForge retrieval.
 *
 * Still fully offline and deterministic — every answer is quoted from the
 * approved course notes, nothing is generated or guessed. What this improves is
 * *relevance*: which concept the question is about, and which part of the notes
 * actually answers it.
 *
 * Scoring combines four signals:
 *   phrase alias  (e.g. "not working" -> Debugging)   strongest
 *   concept name / alias words                        strong
 *   stored keywords                                  medium
 *   the notes body itself                            weak tie-breaker
 */

/* Words that carry no topical meaning. Without this filter "how do I search for
 * something" matched Loops purely because of the word "for". */
const STOPWORDS = new Set(
  `a an the is are was were be been being am do does did doing done have has had having
   i me my mine we us our you your he she it its they them their this that these those
   what which who whom whose when where why how can could should would will shall may
   might must not no nor so than then there here to of in on at by for with without from
   into onto over under about after before again also just only very much many more most
   some any all each every other another such own same both few own get got make makes
   please tell explain describe show give using use used works working work run runs
   running mean means meaning like example examples`.split(/\s+/),
);

/**
 * Extra ways students phrase a concept. Stored separately from the course
 * keywords so approved content is never altered — this only affects retrieval.
 */
const ALIASES = {
  var: ['variable', 'variables', 'declare', 'datatype', 'datatypes', 'type', 'types', 'assign', 'assignment', 'int', 'float', 'bool', 'integer', 'number'],
  loop: ['loop', 'loops', 'iterate', 'iterating', 'iteration', 'repeat', 'repeating', 'range', 'while', 'break', 'continue', 'nested', 'forever', 'count'],
  fn: ['function', 'functions', 'def', 'define', 'return', 'returns', 'argument', 'arguments', 'parameter', 'parameters', 'scope', 'local', 'globals', 'reusable', 'call', 'calls'],
  arr: ['array', 'arrays', 'list', 'lists', 'index', 'indexes', 'indexing', 'slice', 'slices', 'append', 'element', 'elements', 'nested list', 'length'],
  rec: ['recursion', 'recursive', 'basecase', 'factorial', 'stack', 'fibonacci', 'call itself', 'recurse', 'repeats itself'],
  dbg: ['debug', 'debugging', 'bug', 'bugs', 'broken', 'buggy', 'error', 'errors', 'trace', 'tracing', 'syntax error', 'logic error', 'traceback', 'step through', 'print debugging', 'fix'],
  op: ['operator', 'operators', 'precedence', 'expression', 'expressions', 'arithmetic', 'comparison', 'calculate', 'maths', 'math', 'equals'],
  cond: ['conditional', 'conditionals', 'condition', 'conditions', 'branch', 'branching', 'elif', 'toggling', 'boolean logic'],
  io: ['input', 'output', 'inputs', 'outputs', 'user input', 'prompt', 'read input', 'accept', 'print statement', 'display', 'console'],
  str: ['string', 'strings', 'text', 'substring', 'substrings', 'character', 'characters', 'char', 'format', 'formatting', 'uppercase', 'lowercase', 'reverse', 'trim', 'replace', 'split'],
  dict: ['dictionary', 'dictionaries', 'key', 'keys', 'value', 'values', 'mapping', 'keyvalue', 'lookup table'],
  file: ['file', 'files', 'open', 'read', 'write', 'csv', 'filepath', 'directory', 'io error'],
  exc: ['exception', 'exceptions', 'handling', 'try', 'catch', 'raise', 'finally', 'crash', 'crashes', 'stack trace'],
  srch: ['search', 'searching', 'find', 'finding', 'locate', 'membership', 'in operator', 'binary search', 'linear search', 'needle'],
  sort: ['sort', 'sorts', 'sorting', 'sorted', 'order', 'ordering', 'ascending', 'descending', 'alphabetical', 'rank'],
};

/* Whole phrases students actually type. These outrank single words. */
const PHRASES = {
  dbg: ['not working', 'does not work', "doesn't work", 'not running', "doesn't run", 'why is my code', 'why does my code', 'unexpected result', 'wrong answer', 'goes wrong', 'what is wrong', 'is broken', 'code broken', 'not behaving'],
  rec: ['base case', 'call itself', 'infinite recursion', 'stack overflow'],
  io: ['user input', 'take input', 'read input', 'get input'],
  str: ['reverse a string', 'string concatenation', 'concatenate strings', 'join strings'],
  srch: ['search for', 'find an item', 'look for', 'search in'],
  arr: ['index error', 'out of range', 'last element', 'add to list', 'remove from list'],
  sort: ['sort a list', 'sort in order', 'ascending order', 'descending order'],
  fn: ['pass a value', 'return a value', 'function call'],
  loop: ['run many times', 'repeat a task', 'go through'],
};

/* --- text helpers ------------------------------------------------------- */

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(stem)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/** Very light suffix folding so "loops"/"loop" and "reading"/"read" agree. */
function stem(w) {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && (w.endsWith('ing') || w.endsWith('ion'))) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('es') && !w.endsWith('ses')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

const splitSentences = (text) =>
  String(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

/* --- retrieval ---------------------------------------------------------- */

const NAME_W = 4;
const ALIAS_W = 3;
const KEYWORD_W = 2;
const NOTES_W = 1;
const PHRASE_W = 6;

/**
 * Score every concept against a question.
 * Returns a ranked list: [{ concept, score, reason }], best first.
 */
export function rankConcepts(concepts, res, question) {
  const lower = String(question).toLowerCase();
  const q = new Set(tokenize(question));
  if (!q.size) return [];

  const scored = [];

  for (const c of concepts) {
    const r = res[c.id];
    if (!r) continue;
    let score = 0;
    let reason = null;

    // strongest signal: the way a student actually phrases it
    for (const p of PHRASES[c.id] || []) {
      if (lower.includes(p)) {
        score += PHRASE_W;
        reason = reason || `matched phrase "${p}"`;
      }
    }

    const nameWords = tokenize(c.name);
    const aliasWords = (ALIASES[c.id] || []).flatMap(tokenize);
    const kwWords = tokenize(r.kw || '');
    const noteWords = tokenize(r.notes || '');

    for (const w of q) {
      if (nameWords.includes(w)) score += NAME_W;
      else if (aliasWords.includes(w)) score += ALIAS_W;
      if (kwWords.includes(w)) score += KEYWORD_W;
      if (noteWords.includes(w)) score += NOTES_W;
    }

    if (score > 0) {
      // normalise by vocabulary size so a concept with a long word list
      // cannot beat a shorter, more precisely matching one
      const vocab = nameWords.length + aliasWords.length + kwWords.length || 1;
      scored.push({ concept: c, score: score / Math.sqrt(vocab), raw: score, reason });
    }
  }

  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Pick the notes sentence(s) that actually answer this question, so a student
 * asking "what is a base case?" gets that sentence rather than the whole note.
 */
export function extractAnswer(notes, question) {
  const q = new Set(tokenize(question));
  const sentences = splitSentences(notes);
  if (sentences.length <= 1) return notes;

  const scored = sentences.map((s, i) => {
    const words = new Set(tokenize(s));
    let hits = 0;
    q.forEach((w) => {
      if (words.has(w)) hits += 1;
    });
    // prefer earlier sentences — definitions come first in these notes
    return { s, i, hits, score: hits - i * 0.15 };
  });

  const best = scored.reduce((a, b) => (b.score > a.score ? b : a));
  if (best.hits === 0) return notes;

  // return the best sentence plus its neighbour for context
  const keep = new Set([best.i]);
  if (scored[best.i + 1] && best.hits <= 1) keep.add(best.i + 1);
  if (scored[best.i - 1] && best.hits <= 1) keep.add(best.i - 1);

  return [...keep]
    .sort((a, b) => a - b)
    .map((i) => sentences[i])
    .join(' ');
}

/** True when the student is asking to see/understand code. */
function wantsExample(question) {
  return /\b(code|example|program|function|syntax|write|how do i write|show me)\b/i.test(question);
}

/**
 * Main entry point.
 * Returns { answer, conceptId, example, suggestions, matched }.
 * `matched === false` means nothing in the approved content covered it, and
 * `suggestions` offers the nearest topics so the student is not left at a dead end.
 */
export function askPathForge(concepts, res, question) {
  const ranked = rankConcepts(concepts, res, question);

  // Require a real signal, not one weak note-body word.
  const strong = ranked.find((r) => r.raw >= 2);
  const MIN_SCORE = 0.9;

  if (!strong || strong.score < MIN_SCORE) {
    // Only offer fuzzy "did you mean" topics when there is a genuine near miss.
    // Guessing unrelated topics is worse than admitting the gap.
    const nearMiss = ranked[0] && ranked[0].score >= 0.5 ? ranked.slice(0, 3) : [];
    return {
      matched: false,
      answer:
        'I could not find anything about that in the approved Programming Fundamentals notes, so I will not guess. I can answer from the course topics listed below — or ask your instructor.',
      suggestions: nearMiss.map((r) => ({ id: r.concept.id, name: r.concept.name })),
      available: concepts.map((c) => ({ id: c.id, name: c.name })),
    };
  }

  const best = ranked[0];
  const r = res[best.concept.id];
  const answer = extractAnswer(r.notes, question);

  return {
    matched: true,
    answer,
    conceptId: best.concept.id,
    conceptName: best.concept.name,
    example: wantsExample(question) ? r.ex : null,
    suggestions: [],
    available: [],
  };
}
