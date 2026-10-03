import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useSelectors } from '@/hooks/useSelectors';
import { current } from '@/lib/selectors';
import { band, ov } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import DemoTag from '@/components/ui/DemoTag';
import Badge from '@/components/ui/Badge';
import Empty from '@/components/ui/Empty';
import BeforeAfter from '@/components/ui/BeforeAfter';
import ScoreBar from '@/components/ui/ScoreBar';

/** Always-visible section: heading + content. */
const Section = ({ title, children }) => (
  <section className="card">
    <div className="sec-head">
      <h3>{title}</h3>
    </div>
    {children}
  </section>
);

/** Collapsed-by-default detail, so the record is not fully expanded at once. */
const Disclosure = ({ title, meta, children }) => (
  <details className="disc">
    <summary>
      <span>{title}</span>
      {meta ? <span className="mu sm">{meta}</span> : null}
    </summary>
    <div style={{ paddingTop: 'var(--s3)' }}>{children}</div>
  </details>
);

export default function StudentDetail() {
  const { S } = useApp();
  const { rost } = useSelectors();
  const { name } = useParams();
  const navigate = useNavigate();
  const r = rost().find((x) => x.n === name);

  if (!r || !r.pre) {
    return (
      <Empty
        title="Student not found"
        text="This student has not been assessed yet."
        action="Back to Class Insights"
        onAction={() => navigate('/insights')}
      />
    );
  }

  const scores = current(r);
  const sub = S.subs.find((x) => x.who === r.n);
  // weakest first: answers "what does this learner need next?"
  const ranked = S.concepts
    .filter((k) => scores[k.id] != null)
    .sort((a, b) => scores[a.id] - scores[b.id]);
  const need = ranked[0];

  return (
    <>
      <div>
        <button className="btn sm" onClick={() => navigate('/insights')}>
          ← Class Insights
        </button>
        <div style={{ height: 16 }} />
      </div>
      <PageHeader title={r.n} sub={r.live ? '' : <DemoTag />} />

      <Section title="Overview">
        {r.post ? (
          <BeforeAfter bare before={ov(r.pre)} after={ov(r.post)} />
        ) : (
          <p className="mu" style={{ marginBottom: 0 }}>
            Reassessment not taken yet. Overall {ov(r.pre)}%.
          </p>
        )}
      </Section>

      <Section title="What this learner needs next">
        {need ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <b>{need.name}</b> <Badge status={band(scores[need.id])} />
              <div className="mu sm">
                Lowest current score ({scores[need.id]}%). Assign practice for this concept.
              </div>
            </div>
          </div>
        ) : (
          <p className="mu" style={{ marginBottom: 0 }}>
            No concept scores recorded.
          </p>
        )}
      </Section>

      <Disclosure title="Concept progress" meta={`${ranked.length} concepts · weakest first`}>
        {ranked.map((k) => (
          <div className="lr" key={k.id}>
            <span>
              <b>{k.name}</b> <Badge status={band(scores[k.id])} />
            </span>
            <ScoreBar value={scores[k.id]} label={k.name} />
          </div>
        ))}
      </Disclosure>

      <Disclosure title="Applied work">
        {sub ? (
          <div className="row">
            <button className="btn" onClick={() => navigate('/subs/' + sub.id)}>
              Open applied task submission
            </button>
            <span className="mu sm">
              {S.tasks.find((t) => t.id === sub.tid)?.title || 'Applied task'}
            </span>
          </div>
        ) : (
          <p className="mu" style={{ marginBottom: 0 }}>
            No applied task submitted yet.
          </p>
        )}
      </Disclosure>

      {r.post ? (
        <Disclosure title="Improvement" meta="diagnostic → reassessment">
          {S.concepts
            .filter((k) => r.pre[k.id] != null && r.post[k.id] != null)
            .map((k) => (
              <div className="lr sm" key={k.id}>
                <span>{k.name}</span>
                <span className="tnum">
                  {r.pre[k.id]}% → {r.post[k.id]}%{' '}
                  <b
                    style={{
                      color:
                        r.post[k.id] > r.pre[k.id]
                          ? 'var(--ok)'
                          : r.post[k.id] < r.pre[k.id]
                            ? 'var(--err)'
                            : 'var(--m)',
                    }}
                  >
                    {r.post[k.id] > r.pre[k.id] ? '+' : ''}
                    {r.post[k.id] - r.pre[k.id]} pts
                  </b>
                </span>
              </div>
            ))}
        </Disclosure>
      ) : null}
    </>
  );
}
