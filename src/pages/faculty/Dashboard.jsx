import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useSelectors } from '@/hooks/useSelectors';
import PageHeader from '@/components/ui/PageHeader';
import DemoTag from '@/components/ui/DemoTag';
import Bar from '@/components/ui/Bar';
import SubmissionBadge from '@/components/ui/SubmissionBadge';

export default function FacultyDashboard() {
  const { S } = useApp();
  const { stats, weakest } = useSelectors();
  const navigate = useNavigate();
  const x = stats();
  const pending = S.subs.filter((s) => s.status === 'pending');
  const verified = S.subs.filter((s) => s.status === 'verified').length;

  return (
    <>
      <PageHeader
        title="Class Overview"
        sub={
          <>
            Programming Fundamentals · CSE-A <DemoTag />
          </>
        }
      />
      <div className="mets">
        <div className="met">
          <span className="mu sm">Students Assessed</span>
          <b>
            {x.as.length}/{x.total}
          </b>
        </div>
        <div className="met">
          <span className="mu sm">Need Intervention</span>
          <b>{x.need.length}</b>
        </div>
        <div className="met">
          <span className="mu sm">Pending Reviews</span>
          <b>{pending.length}</b>
        </div>
        <div className="met">
          <span className="mu sm">Verified</span>
          <b>{verified}</b>
        </div>
        <div className="met">
          <span className="mu sm">Avg Before → After</span>
          <b>
            {x.b ?? '–'}→{x.a ?? '–'}%
          </b>
        </div>
      </div>

      <div className="card">
        <h3>Common Misconceptions</h3>
        {[...x.ca]
          .sort((a, b) => (a.avg ?? 101) - (b.avg ?? 101))
          .map((c) => (
            <div className="lr" key={c.c.id}>
              <div>
                <b>{c.c.name}</b>
                <div className="mu sm">
                  {c.low} students under 60% · themes: {c.errs.join(', ')}
                </div>
              </div>
              <div className="lb">
                <Bar value={c.avg || 0} label={c.c.name} />
                <b>{c.avg ?? '–'}%</b>
              </div>
            </div>
          ))}
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Students Needing Attention</h3>
          {x.need.length ? (
            x.need.slice(0, 6).map((r) => {
              const w = weakest(r);
              return (
                <div className="lr sm" key={r.n}>
                  <span>{r.n}</span>
                  <span className="mu">{w && `Needs Practice in ${w}`}</span>
                </div>
              );
            })
          ) : (
            <p className="mu">No one right now.</p>
          )}
        </div>
        <div className="card">
          <h3>Recent Submissions</h3>
          {S.subs
            .slice(-4)
            .reverse()
            .map((s) => (
              <div className="lr sm" key={s.id}>
                <span>
                  {s.who} <SubmissionBadge status={s.status} />
                </span>
                <button className="btn sm" onClick={() => navigate('/subs/' + s.id)}>
                  Review
                </button>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
