import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useSelectors } from '@/hooks/useSelectors';
import { useRunLauncher } from '@/hooks/useRunLauncher';
import { date, sum } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Empty from '@/components/ui/Empty';
import StatusIcon from '@/components/ui/StatusIcon';
import TaskSubmission from './TaskSubmission';

const TABS = [
  ['ov', 'Overview'],
  ['ins', 'Instructions'],
  ['sub', 'Submission'],
  ['rub', 'Rubric'],
  ['fb', 'Feedback'],
  ['viva', 'Viva Practice'],
];

const Verified = () => (
  <span className="bd ok">
    <StatusIcon shape="check" />
    Faculty Verified
  </span>
);
const Revise = () => (
  <span className="bd warn">
    <StatusIcon shape="alert" />
    Revision requested
  </span>
);

export default function Task() {
  const { S } = useApp();
  const { me, gap, taskFor, mySub } = useSelectors();
  const { startRun } = useRunLauncher();
  const navigate = useNavigate();
  const { tid, tab = 'ov' } = useParams();
  const g = gap();
  const T = (tid && S.tasks.find((t) => t.id === tid)) || (g ? taskFor(g.id) : null);

  if (!T) {
    return (
      <>
        <PageHeader title="Applied Tasks" />
        <Empty
          title="No applied task yet"
          text="Take the diagnostic so we can recommend the right applied task."
          action="Start Diagnostic"
          onAction={() => navigate('/diag')}
        />
      </>
    );
  }

  const s = mySub(T.c);

  let body;
  if (tab === 'ov') {
    body = (
      <>
        <h3>Objective</h3>
        <p>{T.obj}</p>
        <h4>Requirements</h4>
        <ul>
          {T.req.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p>
          Status:{' '}
          {s ? (
            s.status === 'verified' ? (
              <Verified />
            ) : s.status === 'revise' ? (
              <Revise />
            ) : (
              <span className="bd info">
                <StatusIcon shape="dot" />
                Submitted, awaiting review
              </span>
            )
          ) : (
            <span className="bd mute">
              <StatusIcon shape="ring" />
              Not submitted
            </span>
          )}
        </p>
        <p className="mu sm note-inline">
          Faculty review is required for official competency verification.
        </p>
      </>
    );
  } else if (tab === 'ins') {
    body = (
      <>
        <ol>
          {T.ins.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
        <p className="mu sm">
          Your code is not executed in this prototype. Faculty review it against the rubric.
        </p>
      </>
    );
  } else if (tab === 'sub') {
    if (!me.pre)
      body = (
        <Empty
          title="Take the diagnostic first"
          text="The task builds on your recovery plan."
          action="Start Diagnostic"
          onAction={() => navigate('/diag')}
        />
      );
    else if (!me.prac[T.c])
      body = (
        <Empty
          title={`Practice ${T.title.split(' ')[0]} first`}
          text="Finish a practice set for this concept, then submit your evidence."
          action="Start Practice"
          onAction={() => startRun('prac', T.c)}
        />
      );
    else if (s && s.status !== 'revise') {
      body = (
        <>
          <h4>Your code</h4>
          <pre>{s.code}</pre>
          <h4>Your explanation</h4>
          <p>{s.expl}</p>
        </>
      );
    } else body = <TaskSubmission task={T} submission={s} />;
  } else if (tab === 'rub') {
    body = (
      <>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Criterion</th>
                <th>What faculty look for</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {T.rubric.map((r) => (
                <tr key={r[0]}>
                  <td>{r[0]}</td>
                  <td>{r[1]}</td>
                  <td>0–4</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mu sm">Total 16. Verification needs 9 or more.</p>
      </>
    );
  } else if (tab === 'fb') {
    body = s?.rub ? (
      <>
        <p>
          {s.status === 'verified' ? <Verified /> : <Revise />} Score {sum(s.rub)}/16 · {s.by} ·{' '}
          {date(s.at)}
        </p>
        {T.rubric.map((r, i) => (
          <div className="lr sm" key={r[0]}>
            <span>{r[0]}</span>
            <b>{s.rub[i]}/4</b>
          </div>
        ))}
        <h4>Feedback</h4>
        <p>{s.fb || 'No comment.'}</p>
      </>
    ) : (
      <p className="mu">No feedback yet.</p>
    );
  } else {
    body = T.viva.map((v) => (
      <details key={v[0]}>
        <summary>{v[0]}</summary>
        <p className="mu">Answer aloud first. Key point: {v[1]}</p>
      </details>
    ));
  }

  return (
    <>
      <PageHeader title="Applied Task" sub={T.title} />
      <div className="tabs" role="tablist">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'on' : ''}
            onClick={() => navigate(`/task/${T.id}/${id}`)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="card">{body}</div>
    </>
  );
}
