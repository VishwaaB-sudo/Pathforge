// Deterministic demo class roster (labelled DEMO DATA in the UI).
const MEAN = {
  var: 85,
  loop: 91,
  fn: 81,
  arr: 68,
  rec: 42,
  dbg: 51,
  op: 88,
  cond: 84,
  io: 90,
  str: 78,
  dict: 63,
  file: 72,
  exc: 58,
  srch: 66,
  sort: 60,
};
const FIRST = [
  'Aadhav',
  'Bhavya',
  'Charan',
  'Divya',
  'Eshwar',
  'Farah',
  'Gokul',
  'Harini',
  'Imran',
  'Janani',
];
const LAST = ['Nair', 'Iyer', 'Rao', 'Menon'];

export function buildRoster(concepts) {
  let s = 7;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const roster = [];
  for (let i = 0; i < 40; i++) {
    const pre = {};
    const post = {};
    const improved = i % 5 < 3;
    concepts.forEach(({ id }) => {
      const v = Math.max(5, Math.min(100, Math.round(MEAN[id] + (rand() - 0.5) * 44)));
      pre[id] = v;
      post[id] = Math.min(100, v + (improved ? Math.round(8 + rand() * (v < 60 ? 35 : 12)) : 0));
    });
    roster.push({ n: FIRST[i % 10] + ' ' + LAST[(i / 10) | 0], pre, post: improved ? post : null });
  }
  return roster;
}
