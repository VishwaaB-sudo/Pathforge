// Pure mutators. Each takes a draft copy of the app state `S` and changes it in place.
// Call them through `update((draft) => fn(draft, ...))` from AppContext.
import { now, sum } from './utils';
import { newMe, DEMO_STUDENT } from '@/data/seed';

const findQ = (S, id) => S.qs.find((q) => q.id === id);

/** The signed-in student's record (falls back to the demo student, as the prototype always did). */
export const getMe = (S) => S.mes[S.user && S.user.e] || S.mes[DEMO_STUDENT];

export const logAct = (S, t) => getMe(S).act.push({ t, at: now() });
export const addNote = (S, role, t, to) => S.notes.push({ role, t, to, at: now() });

/* ---------- student ---------- */

export function consent(S) {
  getMe(S).consent = true;
}

export function markStudied(S, key, conceptId) {
  const name = S.concepts.find((c) => c.id === conceptId)?.name || 'a concept';
  getMe(S)[key][conceptId] = true;
  logAct(S, key === 'und' ? `Studied the ${name} notes` : `Studied the ${name} worked example`);
}

export const countRight = (S, run) =>
  run.ids.filter((id, i) => run.ans[i] === findQ(S, id)?.a).length;

/** Records a finished quiz/practice run: scores, mistakes, activity and notifications. */
export function completeRun(S, run) {
  const m = getMe(S);
  const by = {};
  const errs = {};
  const diag = run.k === 'pre' || run.k === 'post';

  run.ids.forEach((id, i) => {
    const q = findQ(S, id);
    const ok = run.ans[i] === q.a;
    if (diag) {
      by[q.c] = by[q.c] || [0, 0];
      by[q.c][1]++;
      errs[q.c] = errs[q.c] || [];
      if (ok) by[q.c][0]++;
      else errs[q.c].push(q.err);
    }
    if (ok) {
      if (run.k !== 'pre') m.mist = m.mist.filter((x) => x.id !== id);
    } else {
      const x = m.mist.find((x) => x.id === id);
      if (x) {
        x.ch = run.ans[i];
        x.at = now();
      } else m.mist.push({ id, ch: run.ans[i], at: now() });
    }
  });

  if (diag) {
    const scores = {};
    Object.keys(by).forEach((c) => (scores[c] = Math.round((100 * by[c][0]) / by[c][1])));
    m[run.k] = { scores, detail: by, errs, at: now() };
    logAct(S, run.k === 'pre' ? 'Completed your diagnostic' : 'Completed your reassessment');
    addNote(
      S,
      'student',
      run.k === 'pre' ? 'Your learning gaps are ready.' : 'Your reassessment results are ready.',
      S.user.e,
    );
    if (run.k === 'post') addNote(S, 'faculty', S.user.n + ' completed a reassessment.');
  } else {
    run.ids.forEach((id) => (m.prac[findQ(S, id).c] = true));
    logAct(S, `Finished a practice set (${countRight(S, run)}/${run.ids.length})`);
  }
}

export function submitTask(S, { tid, code, expl }) {
  const t = S.tasks.find((x) => x.id === tid);
  if (!t) return;
  const uid = S.user.e;
  const s = S.subs.find((x) => x.uid === uid && x.tid === tid);
  if (s) Object.assign(s, { code, expl, status: 'pending', rub: null, fb: '', by: null, at: null });
  else S.subs.push({ id: 's' + Date.now(), who: S.user.n, uid, tid, code, expl, status: 'pending' });
  logAct(S, `Submitted the applied task: ${t.title}`);
  addNote(S, 'faculty', 'New submission from ' + S.user.n + '.');
}

/* ---------- faculty ---------- */

export function verifySubmission(S, { id, ok, rub, fb }) {
  if (S.role !== 'faculty') return;
  const s = S.subs.find((x) => x.id === id);
  if (!s) return;
  const total = sum(rub);
  const title = S.tasks.find((t) => t.id === s.tid)?.title || 'your applied task';
  Object.assign(s, { rub, fb, status: ok ? 'verified' : 'revise', by: S.user.n, at: now() });
  if (s.uid && S.mes[s.uid]) {
    addNote(
      S,
      'student',
      ok
        ? `Your applied task was verified (${total}/16). Reassessment is unlocked.`
        : 'Faculty requested a revision on your applied task.',
      s.uid,
    );
    S.mes[s.uid].act.push({
      t: ok ? 'Task verified by faculty' : 'Revision requested on your task',
      at: now(),
    });
  }
}

/* ---------- admin ---------- */

const isAdmin = (S) => S.role === 'admin';

export function addConcept(S, { name, u, pre }) {
  if (!isAdmin(S)) return;
  const id = 'c' + Date.now();
  S.concepts.push({ id, name, u, pre });
  S.res[id] = { notes: 'Add notes in Resources.', ex: '', kw: name.toLowerCase() };
}

/** True when a concept is still referenced by questions, other concepts or the task. */
export const conceptInUse = (S, id) =>
  S.qs.some((q) => q.c === id) ||
  S.concepts.some((c) => c.pre === id) ||
  S.tasks.some((t) => t.c === id);

export function removeConcept(S, id) {
  if (!isAdmin(S) || conceptInUse(S, id)) return;
  S.concepts = S.concepts.filter((c) => c.id !== id);
  delete S.res[id];
}

export function addQuestion(S, q) {
  if (!isAdmin(S)) return;
  S.qs.push({ id: S.nid++, ...q });
}

export function removeQuestion(S, id) {
  if (!isAdmin(S)) return;
  S.qs = S.qs.filter((q) => q.id !== id);
  Object.values(S.mes).forEach((m) => (m.mist = m.mist.filter((x) => x.id !== id)));
}

export function saveResource(S, id, { notes, ex }) {
  if (!isAdmin(S)) return;
  S.res[id].notes = notes;
  S.res[id].ex = ex;
}

export function saveTask(S, id, { title, obj, rubric }) {
  if (!isAdmin(S)) return;
  const t = S.tasks.find((x) => x.id === id);
  if (t) Object.assign(t, { title, obj, rubric });
}

export function addUser(S, { e, n, role, d }) {
  if (!isAdmin(S)) return;
  S.users.push({ e, n, role, d });
  if (role === 'student') S.mes[e] = newMe();
}

export function removeUser(S, email) {
  if (!isAdmin(S)) return;
  const i = S.users.findIndex((u) => u.e === email);
  if (i < 3) return; // the three built-in demo accounts are permanent
  S.users.splice(i, 1);
  delete S.mes[email];
  S.subs = S.subs.filter((x) => x.uid !== email);
}
