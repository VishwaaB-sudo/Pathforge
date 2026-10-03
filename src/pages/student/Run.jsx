import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useUi } from '@/context/UiContext';
import { useSelectors } from '@/hooks/useSelectors';
import { completeRun, countRight } from '@/lib/domain';
import PageHeader from '@/components/ui/PageHeader';
import Bar from '@/components/ui/Bar';
import Empty from '@/components/ui/Empty';

/** One question at a time. Diagnostics hide answers; practice shows feedback straight away. */
export default function Run() {
  const { S, update } = useApp();
  const { run, setRun } = useUi();
  const { Q, nm } = useSelectors();
  const navigate = useNavigate();

  if (!run) {
    return (
      <Empty
        title="Nothing in progress"
        text="Start a diagnostic or practice set."
        action="Go to Diagnostics"
        onAction={() => navigate('/diag')}
      />
    );
  }

  if (run.done) {
    const isMist = run.k === 'mist';
    return (
      <>
        <PageHeader
          title="Practice complete"
          sub={`You answered ${run.right} of ${run.ids.length} correctly.`}
        />
        <div className="card">
          <p>Questions you missed are saved in My Mistakes so you can retry them.</p>
          <div className="row">
            <button className="btn p" onClick={() => navigate(isMist ? '/mist' : '/recovery')}>
              {isMist ? 'Back to My Mistakes' : 'Back to Recovery Plan'}
            </button>
            <button className="btn" onClick={() => navigate('/prac')}>
              More practice
            </button>
          </div>
        </div>
      </>
    );
  }

  const q = Q(run.ids[run.i]);
  const practice = run.k === 'prac' || run.k === 'mist';
  const a = run.ans[run.i];
  const lock = practice && a != null;
  const last = run.i === run.ids.length - 1;
  const title = {
    pre: 'Starting Diagnostic',
    post: 'Reassessment',
    mist: 'Practice My Mistakes',
    prac: 'Practice · ' + nm(run.c),
  }[run.k];

  const pick = (i) => setRun((r) => ({ ...r, ans: { ...r.ans, [r.i]: i } }));
  const step = (d) => {
    if (d > 0 && last) return finish();
    setRun((r) => ({ ...r, i: r.i + d }));
  };
  const finish = () => {
    const right = countRight(S, run);
    update((draft) => completeRun(draft, run));
    if (run.k === 'pre' || run.k === 'post') navigate('/result/' + run.k);
    else setRun({ ...run, right, done: true });
  };

  const pct = Math.round((run.i / run.ids.length) * 100);

  return (
    <>
      <PageHeader
        title={title}
        sub={`Question ${run.i + 1} of ${run.ids.length}${practice ? ` · ${nm(q.c)}` : ''}`}
      />
      <div className="progress-row">
        <Bar value={pct} label="Progress" />
        <span className="mu sm tnum">{pct}%</span>
      </div>
      <div className="card quiz">
        <fieldset>
          <legend className="qt">{q.t}</legend>
          {q.o.map((o, i) => {
            const cls = lock ? (i === q.a ? ' ok' : a === i ? ' no' : '') : '';
            return (
              <label className={`op${cls}`} key={i}>
                <input
                  type="radio"
                  name="o"
                  checked={a === i}
                  disabled={lock}
                  onChange={() => pick(i)}
                />
                {o}
                {lock && i === q.a ? ' ✓ Correct answer' : ''}
                {lock && a === i && i !== q.a ? ' ✗ Your answer' : ''}
              </label>
            );
          })}
        </fieldset>
        {lock && (
          <div className="ex">
            <b>{a === q.a ? 'Correct.' : 'Not quite.'}</b> {q.e}
          </div>
        )}
        <div className="row quiz-actions">
          {!practice && run.i > 0 && (
            <button className="btn" onClick={() => step(-1)}>
              Previous
            </button>
          )}
          <button className="btn p" disabled={a == null} onClick={() => step(1)}>
            {last ? (practice ? 'Finish' : 'Submit') : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}
