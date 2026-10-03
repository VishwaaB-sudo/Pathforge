import { useNavigate } from 'react-router-dom';
import { useSelectors } from '@/hooks/useSelectors';
import { useRunLauncher } from '@/hooks/useRunLauncher';
import PageHeader from '@/components/ui/PageHeader';
import Empty from '@/components/ui/Empty';

export default function Mistakes() {
  const { me, Q, nm } = useSelectors();
  const { startRun, retry } = useRunLauncher();
  const navigate = useNavigate();

  const grouped = {};
  me.mist
    .filter((x) => Q(x.id))
    .forEach((x) => (grouped[Q(x.id).c] = grouped[Q(x.id).c] || []).push(x));
  const concepts = Object.keys(grouped);

  return (
    <>
      <PageHeader
        title="My Mistakes"
        sub="Questions to revisit, grouped by concept."
        action={
          concepts.length ? (
            <button className="btn p" onClick={() => startRun('mist')}>
              Practice My Mistakes
            </button>
          ) : null
        }
      />
      {concepts.length ? (
        concepts.map((c) => (
          <section className="section" key={c}>
            <div className="section-head">
              <h3>{nm(c)}</h3>
              <span className="sh-meta">
                {grouped[c].length} recurring mistake{grouped[c].length > 1 ? 's' : ''}
              </span>
            </div>
            {grouped[c].map((x) => {
              const q = Q(x.id);
              return (
                <div className="lr" key={x.id}>
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <b>{q.err}</b>
                    <div className="mu sm">{q.t}</div>
                    <details style={{ marginTop: 'var(--s2)' }}>
                      <summary className="mu sm">Why this was marked wrong</summary>
                      <div className="sm" style={{ paddingTop: 'var(--s2)' }}>
                        Your answer: {q.o[x.ch]}
                        <br />
                        Correct answer: {q.o[q.a]}
                        <br />
                        {q.e}
                      </div>
                    </details>
                  </div>
                  <button className="btn sm" onClick={() => retry(q.id)}>
                    Retry
                  </button>
                </div>
              );
            })}
          </section>
        ))
      ) : (
        <Empty
          title="No mistakes saved"
          text="Wrong answers from diagnostics and practice appear here."
          action="Start Practice"
          onAction={() => navigate('/prac')}
        />
      )}
    </>
  );
}
