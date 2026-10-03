import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useSelectors } from '@/hooks/useSelectors';
import { useRunLauncher } from '@/hooks/useRunLauncher';
import { latest } from '@/lib/selectors';
import { markStudied } from '@/lib/domain';
import PageHeader from '@/components/ui/PageHeader';
import Empty from '@/components/ui/Empty';
import StatusIcon from '@/components/ui/StatusIcon';

const SUBTITLES = [
  'Read the idea',
  'Read the worked example',
  'Targeted questions',
  'Submit evidence',
  'Measure your improvement',
];

// Rough time estimates per step, shown alongside the subtitle.
const SUBTIMES = ['5 min', '5 min', '10 min', '20 min', '10 min'];

export default function Recovery() {
  const { S, update } = useApp();
  const { me, plan, rationale, nm, gap, taskFor, mySub, reassessReady } = useSelectors();
  const { startRun } = useRunLauncher();
  const navigate = useNavigate();

  const g = gap();
  if (!me.pre || !g) {
    return (
      <>
        <PageHeader title="Recovery Path" />
        <Empty
          title="Take the diagnostic first"
          text="Your recovery plan is built from your learning gaps."
          action="Start Diagnostic"
          onAction={() => navigate('/diag')}
        />
      </>
    );
  }

  const steps = plan();
  const cur = steps.findIndex((x) => !x.d);
  const scores = latest(me);
  const sc = scores[g.id];
  const r = S.res[g.id] || { notes: '', ex: '' };
  const pre = g.pre ? S.concepts.find((c) => c.id === g.pre) : null;
  const ps = pre ? scores[pre.id] : null;
  const t = taskFor(g.id);
  const s = mySub(g.id);
  const qCount = S.qs.filter((q) => q.c === g.id).length;

  const body = [
    <>
      <p>{r.notes}</p>
      <button className="btn p" onClick={() => update((d) => markStudied(d, 'und', g.id))}>
        Mark as understood
      </button>
    </>,
    <>
      <pre>{r.ex}</pre>
      <button className="btn p" onClick={() => update((d) => markStudied(d, 'ex', g.id))}>
        I have studied this
      </button>
    </>,
    <>
      <p>
        Answer {qCount} targeted {g.name} questions with instant explanations.
      </p>
      <button className="btn p" onClick={() => startRun('prac', g.id)}>
        Start Practice
      </button>
    </>,
    <>
      <p>{t ? `${t.title}. Faculty will review it.` : 'No applied task for this concept in the pilot.'}</p>
      {t && (
        <button className="btn p" onClick={() => navigate(`/task/${t.id}`)}>
          {s ? 'Revise Applied Task' : 'Open Applied Task'}
        </button>
      )}
    </>,
    steps[4].lock ? (
      <p className="mu">Unlocks after faculty verifies your applied task.</p>
    ) : (
      <button className="btn p" onClick={() => startRun('post')}>
        Start Reassessment
      </button>
    ),
  ];

  return (
    <>
      <PageHeader title="Recovery Path" sub={g.name} />
      <div className="card">
        <p>
          {sc < 80
            ? `Your diagnostic suggests that ${g.name} is the concept to focus on next.`
            : `You are doing well in ${g.name}. Complete any remaining steps to add evidence.`}
        </p>
        <p className="mu sm">
          <b>Why:</b> {rationale(g)}
          {ps != null ? ` Prerequisite: ${nm(pre.id)} (${ps}%).` : ''}
        </p>
        {ps != null && ps < 70 && (
          <p className="sm">
            <b>Tip:</b> {nm(pre.id)} is also a gap. Revisit it in My Learning as you go.
          </p>
        )}
      </div>
      <ol className="stp">
        {steps.map((x, i) => (
          <li key={x.k} className={x.d ? 'dn' : i === cur ? 'cur' : 'fu'}>
            <span className="sn">0{i + 1}</span>
            <div style={{ flex: 1 }}>
              <b>{x.k}</b>{' '}
              {x.d ? (
                <span className="bd ok">
                  <StatusIcon shape="check" />
                  Done
                </span>
              ) : i === cur ? (
                <span className="bd info">
                  <StatusIcon shape="dot" />
                  Current step
                </span>
              ) : (
                <span className="bd mute">
                  <StatusIcon shape="ring" />
                  Up next
                </span>
              )}
              <div className="mu sm">
                {x.na
                  ? 'Not required for this concept'
                  : `${SUBTITLES[i]}${SUBTIMES[i] ? ` · about ${SUBTIMES[i]}` : ''}`}
              </div>
              {i === cur && <div style={{ marginTop: 16 }}>{body[i]}</div>}
            </div>
          </li>
        ))}
      </ol>
      {!reassessReady() && (
        <p className="mu sm">Reassessment unlocks once your applied task is faculty-verified.</p>
      )}
    </>
  );
}
