// Read-only derived data. `makeSelectors(S)` binds every helper to a state snapshot.
import { avg, ov } from './utils';
import { getMe } from './domain';
import { trimRun } from './quiz';

/** Most recent score map for a student record (reassessment if taken, else diagnostic). */
export const latest = (m) => m.post?.scores || m.pre?.scores || null;
/** Same idea for a roster row. */
export const current = (r) => r.post || r.pre;

// Deterministic thresholds (shared with lib/utils band()).
export const NEEDS_PRACTICE = 60; // below this a concept needs practice
export const PRACTICED = 80; // at or above this a concept is practiced
export const PREREQ_OK = 70; // a prerequisite below this is reviewed first

export function makeSelectors(S) {
  const me = getMe(S);

  const nm = (c) => S.concepts.find((x) => x.id === c)?.name || c;
  const Q = (id) => S.qs.find((q) => q.id === id);
  const taskFor = (c) => S.tasks.find((t) => t.c === c) || null;
  const myEmail = S.user && S.user.e;
  const mySub = (c) => {
    const t = taskFor(c);
    return t ? S.subs.find((s) => s.uid === myEmail && s.tid === t.id) : undefined;
  };
  const qset = (k) =>
    S.qs.filter((q) => (k === 'pre' ? q.set === 0 || q.set === 3 : q.set === 1 || q.set === 3));
  // Counts a trimmed run, so the stated length matches what the student sees.
  const qm = (k) => {
    const n = trimRun(qset(k)).length;
    return `${n} questions · about ${Math.ceil(n * 0.7)} min`;
  };

  const errCount = (conceptId) => me.mist.filter((x) => Q(x.id)?.c === conceptId).length;

  /**
   * The single concept that most needs attention, chosen deterministically from the
   * latest score map. Priority: weakest score, then recurring mistakes, then a
   * prerequisite that is itself below the recommended threshold.
   */
  function gap() {
    const sc = latest(me);
    if (!sc) return null;
    const scored = S.concepts.filter((c) => sc[c.id] != null);
    if (!scored.length) return null;
    const pre = me.pre?.scores || {};
    // Prefer concepts still below the practiced threshold; otherwise keep the
    // diagnostic-lowest concept so the recovery narrative stays stable.
    const pool = scored.some((c) => sc[c.id] < PRACTICED)
      ? scored.filter((c) => sc[c.id] < PRACTICED)
      : scored;
    let g = pool
      .slice()
      .sort(
        (a, b) =>
          sc[a.id] - sc[b.id] ||
          errCount(b.id) - errCount(a.id) ||
          (pre[a.id] ?? 101) - (pre[b.id] ?? 101),
      )[0];
    const seen = new Set();
    while (g.pre && !seen.has(g.id)) {
      seen.add(g.id);
      const pre = S.concepts.find((c) => c.id === g.pre);
      if (pre && sc[pre.id] != null && sc[pre.id] < PREREQ_OK) g = pre;
      else break;
    }
    return g;
  }

  /** Plain-language, human-readable reason for a recommendation (spec §7). */
  function rationale(c) {
    if (!c) return '';
    const a = me.pre;
    const d = a?.detail?.[c.id];
    const parts = [];
    if (d) {
      const e = [...new Set(a.errs[c.id] || [])];
      parts.push(
        `You answered ${d[0]} of ${d[1]} ${c.name} questions correctly${
          e.length ? `, including ones on ${e.join(', ')}` : ''
        }.`,
      );
    } else if (latest(me)?.[c.id] != null) {
      parts.push(`${c.name} is your lowest-scoring concept so far.`);
    }
    if (c.pre) {
      const pre = S.concepts.find((x) => x.id === c.pre);
      const ps = latest(me)?.[c.pre];
      if (pre && ps != null && ps < PREREQ_OK)
        parts.push(
          `Because ${pre.name} is also below the recommended threshold, review ${pre.name} before continuing with ${c.name}.`,
        );
    }
    return parts.join(' ');
  }

  function status(c) {
    const sc = latest(me);
    if (!sc || sc[c] == null) return 'Not Started';
    const t = taskFor(c);
    if (t) {
      const sub = mySub(c);
      if (sub?.status === 'verified') return 'Faculty Verified';
      if (sub && sub.status !== 'revise') return 'Applied';
    }
    const v = sc[c];
    const practiced = !!me.prac[c];
    if (v >= PRACTICED) return 'Practiced';
    if (v >= NEEDS_PRACTICE) return practiced ? 'Practiced' : 'Learning';
    return 'Needs Practice';
  }

  /** Recovery steps for the current gap concept. Apply is a no-op when no task exists. */
  function plan() {
    const g = gap();
    const t = g && taskFor(g.id);
    const sub = g && mySub(g.id);
    const applied = !!t && !!sub && sub.status !== 'revise';
    const verified = t ? sub?.status === 'verified' : true;
    return [
      { k: 'Understand', d: g ? !!me.und[g.id] : false },
      { k: 'Study Example', d: g ? !!me.ex[g.id] : false },
      { k: 'Practice', d: g ? !!me.prac[g.id] : false },
      { k: 'Apply', d: t ? applied : true, na: !t },
      { k: 'Reassess', d: !!me.post, lock: !verified },
    ];
  }

  function why(a, c) {
    const d = a?.detail?.[c];
    if (!d) return '';
    const e = [...new Set(a.errs[c] || [])];
    return `You answered ${d[0]} of ${d[1]} ${nm(c)} questions correctly${
      e.length ? ` and missed ones on: ${e.join(', ')}` : ''
    }.`;
  }

  function journey() {
    const g = gap();
    const t = g && taskFor(g.id);
    const sub = g && mySub(g.id);
    const p = plan();
    return [
      { k: 'Diagnosed', d: !!me.pre },
      { k: 'Learning', d: p[0].d },
      { k: 'Practiced', d: p[2].d },
      { k: 'Applied', d: p[3].d && !p[3].na },
      { k: 'Verified', d: t ? sub?.status === 'verified' : false },
      { k: 'Improved', d: !!me.post && !!me.pre && ov(me.post.scores) > ov(me.pre.scores) },
    ];
  }

  /** True when the student may take the reassessment (task verified, or no task exists). */
  function reassessReady() {
    if (!me.pre) return false;
    const g = gap();
    if (!g) return false;
    const t = taskFor(g.id);
    if (!t) return true;
    return mySub(g.id)?.status === 'verified';
  }

  /** The student's "next step" card. `to` is a route, `run` starts a quiz instead. */
  function nextAct() {
    const g = gap();
    const t = g && taskFor(g.id);
    const sub = g && mySub(g.id);
    if (!me.pre)
      return {
        t: 'Take your diagnostic',
        s: 'Find out which concepts to focus on',
        m: qm('pre'),
        b: 'Start Diagnostic',
        run: 'pre',
        to: '/diag',
      };
    if (me.post)
      return {
        t: 'Review your improvement',
        s: 'Your before and after results are ready',
        m: '2 min',
        b: 'See My Progress',
        to: '/result/post',
      };
    if (t && sub?.status === 'pending')
      return {
        t: 'Waiting for faculty review',
        s: 'Your applied task is submitted. You will be notified.',
        m: '',
        b: 'View Submission',
        to: `/task/${t.id}/sub`,
      };
    if (t && sub?.status === 'verified')
      return {
        t: 'Take your reassessment',
        s: 'Your task is verified. Measure your improvement.',
        m: qm('post'),
        b: 'Start Reassessment',
        run: 'post',
      };
    if (t && sub?.status === 'revise')
      return {
        t: 'Revise your applied task',
        s: 'Faculty left feedback for you',
        m: '15 min',
        b: 'Open Feedback',
        to: `/task/${t.id}/fb`,
      };
    const p = plan();
    const raw = p.findIndex((x) => !x.d);
    const i = raw < 0 ? p.length - 1 : raw;
    return {
      t: g ? g.name : 'Continue your recovery',
      s: `Step ${i + 1} of ${p.length} · ${p[i].k}`,
      m: ['5 min', '5 min', '10 min', '20 min', '10 min'][i] || '',
      b: 'Continue Recovery',
      to: '/recovery',
    };
  }

  /* ----- faculty / class level ----- */

  /** Demo roster plus any live students who have taken assessments. */
  const rost = () => {
    const live = S.users
      .filter((u) => u.role === 'student' && S.mes[u.e])
      .map((u) => {
        const m = S.mes[u.e];
        return { n: u.n, live: 1, pre: m.pre?.scores, post: m.post?.scores };
      });
    return [...live, ...S.roster];
  };

  function stats() {
    const rows = rost();
    const as = rows.filter((r) => r.pre);
    const ca = S.concepts.map((c) => {
      const v = as.map((r) => current(r)[c.id]).filter((x) => x != null);
      return {
        c,
        avg: avg(v),
        low: v.filter((x) => x < NEEDS_PRACTICE).length,
        errs: [...new Set(S.qs.filter((q) => q.c === c.id).map((q) => q.err))],
      };
    });
    const need = as.filter(
      (r) => S.concepts.filter((c) => current(r)[c.id] < NEEDS_PRACTICE).length >= 2,
    );
    const wp = as.filter((r) => r.post);
    return {
      total: rows.length,
      as,
      ca,
      need,
      b: avg(wp.map((r) => ov(r.pre))),
      a: avg(wp.map((r) => ov(r.post))),
      n: wp.length,
    };
  }

  /** Name of the concept a roster row scores lowest on. */
  function weakest(r) {
    const s = current(r);
    const c = S.concepts.filter((c) => s[c.id] != null).sort((a, b) => s[a.id] - s[b.id])[0];
    return c ? c.name : '';
  }

  return {
    me,
    nm,
    Q,
    taskFor,
    mySub,
    qset,
    qm,
    gap,
    rationale,
    status,
    plan,
    why,
    journey,
    reassessReady,
    nextAct,
    rost,
    stats,
    weakest,
  };
}
