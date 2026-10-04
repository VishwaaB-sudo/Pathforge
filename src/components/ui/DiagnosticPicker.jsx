import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useUi } from '@/context/UiContext';
import { SUBJECTS, findSubject } from '@/config/subjects';
import { trimRun } from '@/lib/quiz';

/**
 * Diagnostic picker. Opens before a diagnostic or reassessment run and asks
 * which subject, and which concept inside it, to cover. Resolves through
 * `closePick` with `{ subject, concept }` — concept is null for the whole
 * subject — or null when cancelled.
 */
export default function DiagnosticPicker() {
  const { S } = useApp();
  const { pick, closePick, subject, setSubject } = useUi();
  const [concept, setConcept] = useState(null);
  const panel = useRef(null);

  const kind = pick?.kind || 'pre';
  const subj = findSubject(pick ? subject : null);

  /* Question counts come from the real bank, trimmed to the run length, so an
     empty subject is announced before the run starts rather than after. */
  const count = useMemo(() => {
    if (!pick) return { all: 0, by: {} };
    const bank = S.qs.filter((q) =>
      kind === 'pre' ? q.set === 0 || q.set === 3 : q.set === 1 || q.set === 3,
    );
    // only questions that belong to the chosen subject count towards it
    const mine = new Set(subj.concepts.map((c) => c.id));
    const inSubject = bank.filter((q) => mine.has(q.c));
    const by = {};
    subj.concepts.forEach((c) => {
      by[c.id] = trimRun(inSubject.filter((q) => q.c === c.id)).length;
    });
    return { all: trimRun(inSubject).length, by };
  }, [pick, kind, S.qs, subject]);

  // reset to "whole subject" whenever the picker opens or the subject changes
  useEffect(() => {
    if (pick) setConcept(null);
  }, [pick, subject]);

  useEffect(() => {
    if (!pick) return;
    const first = panel.current?.querySelector('input, button');
    first?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePick(null);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = panel.current?.querySelectorAll('input, button');
      if (!items?.length) return;
      const list = [...items].filter((el) => !el.disabled);
      const i = list.indexOf(document.activeElement);
      e.preventDefault();
      const next = e.shiftKey ? (i <= 0 ? list.length - 1 : i - 1) : (i === -1 ? 0 : (i + 1) % list.length);
      list[next].focus();
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pick, closePick]);

  if (!pick) return null;

  const total = count.all;
  const chosen = concept ? count.by[concept] || 0 : total;
  const title = kind === 'post' ? 'Start your reassessment' : 'Start your diagnostic';

  const start = () => {
    setSubject(subj.id);
    closePick({ subject: subj.id, concept });
  };

  return (
    <div className="overlay" onMouseDown={() => closePick(null)}>
      <div
        className="dialog pick"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pick-title"
        ref={panel}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h3 id="pick-title">{title}</h3>
        <p className="mu sm" style={{ marginTop: 0 }}>
          Pick the subject and the concept you want to be checked on.
        </p>

        <fieldset className="pick-set">
          <legend className="pick-leg">Subject</legend>
          <div className="pick-chips">
            {SUBJECTS.map((s) => (
              <label key={s.id} className={`pick-chip${s.id === subj.id ? ' on' : ''}`}>
                <input
                  type="radio"
                  name="pick-subject"
                  value={s.id}
                  checked={s.id === subj.id}
                  onChange={() => setSubject(s.id)}
                />
                {s.name}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="pick-set">
          <legend className="pick-leg">Concept</legend>
          <div className="pick-list">
            <label className={`pick-row${!concept ? ' on' : ''}`}>
              <input
                type="radio"
                name="pick-concept"
                checked={!concept}
                onChange={() => setConcept(null)}
              />
              <span className="pick-name">Whole subject</span>
              <span className="mu sm tnum">{total}</span>
            </label>
            {subj.concepts.map((c) => (
              <label key={c.id} className={`pick-row${concept === c.id ? ' on' : ''}`}>
                <input
                  type="radio"
                  name="pick-concept"
                  checked={concept === c.id}
                  onChange={() => setConcept(c.id)}
                />
                <span className="pick-name">{c.name}</span>
                <span className="mu sm tnum">{count.by[c.id] || 0}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <p className="mu sm" role="status">
          {chosen
            ? `${chosen} question${chosen === 1 ? '' : 's'} in this run.`
            : 'No questions are published for this subject yet.'}
        </p>

        <div className="dialog-actions">
          <button className="btn" onClick={() => closePick(null)}>
            Cancel
          </button>
          <button className="btn p" disabled={!chosen} onClick={start}>
            {kind === 'post' ? 'Start Reassessment' : 'Start Diagnostic'}
          </button>
        </div>
      </div>
    </div>
  );
}