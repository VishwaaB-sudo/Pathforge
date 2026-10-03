import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useUi } from '@/context/UiContext';
import { verifySubmission } from '@/lib/domain';
import { date, sum } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import DemoTag from '@/components/ui/DemoTag';

/** Rubric scoring for one submission. Verification needs 9/16 or more. */
export default function ReviewForm({ submission: s }) {
  const { S, update } = useApp();
  const { toast } = useUi();
  const navigate = useNavigate();
  const T = S.tasks.find((t) => t.id === s.tid) || S.tasks[0];
  const locked = s.status === 'verified';
  const [rub, setRub] = useState(() => T.rubric.map((_, i) => s.rub?.[i] ?? 0));
  const [fb, setFb] = useState(s.fb || '');

  const submit = (ok) => {
    const feedback = fb.trim();
    if (ok && sum(rub) < 9) return toast('Total is below 9/16. Request a revision instead.');
    if (!ok && !feedback) return toast('Add feedback for the student.');
    update((d) => verifySubmission(d, { id: s.id, ok, rub, fb: feedback }));
    toast(ok ? 'Verified.' : 'Revision requested.');
  };

  return (
    <>
      <div>
        <button className="btn sm" onClick={() => navigate('/subs')}>
          ← All submissions
        </button>
        <div style={{ height: 16 }} />
      </div>
      <PageHeader title={'Review: ' + s.who} sub={s.demo ? <DemoTag /> : ''} />
      <div className="grid2">
        <div className="card">
          <h3>Student work</h3>
          <pre>{s.code}</pre>
          <h4>Explanation</h4>
          <p>{s.expl}</p>
          <p className="mu sm">Code is not executed.</p>
        </div>
        <div className="card">
          <h3>Rubric</h3>
          {T.rubric.map((r, i) => (
            <div key={r[0]}>
              <label htmlFor={`r${i}`}>
                {r[0]} <span className="mu sm">· {r[1]}</span>
              </label>
              <select
                id={`r${i}`}
                disabled={locked}
                value={rub[i]}
                onChange={(e) => setRub((v) => v.map((x, j) => (j === i ? +e.target.value : x)))}
              >
                {[0, 1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <label htmlFor="fb">Feedback</label>
          <textarea
            id="fb"
            rows={4}
            disabled={locked}
            value={fb}
            onChange={(e) => setFb(e.target.value)}
          />
          {locked ? (
            <p className="sm">
              ✓ Verified by {s.by} on {date(s.at)}
            </p>
          ) : (
            <>
              <p className="mu sm total-line">
                Rubric total <b className="tnum">{sum(rub)}</b>/16 · verification needs 9 or more
              </p>
              <div className="row actions">
                <button className="btn p" onClick={() => submit(true)}>
                  Verify competency
                </button>
                <button className="btn" onClick={() => submit(false)}>
                  Request revision
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
