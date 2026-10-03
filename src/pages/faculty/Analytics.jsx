import { useApp } from '@/context/AppContext';
import { useSelectors } from '@/hooks/useSelectors';
import { avg } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import DemoTag from '@/components/ui/DemoTag';
import BeforeAfter from '@/components/ui/BeforeAfter';
import DeltaBars from '@/components/ui/DeltaBars';
import Empty from '@/components/ui/Empty';

export default function Analytics() {
  const { S } = useApp();
  const { stats, rost } = useSelectors();
  const x = stats();
  const reassessed = rost().filter((r) => r.post);

  const deltaOf = (r) => (r.b != null && r.a != null ? r.a - r.b : -999);
  const rows = S.concepts
    .map((c) => ({
      c,
      b: avg(reassessed.map((r) => r.pre[c.id]).filter((v) => v != null)),
      a: avg(reassessed.map((r) => r.post[c.id]).filter((v) => v != null)),
    }))
    .sort((p, q) => deltaOf(q) - deltaOf(p)); // biggest improvement first

  const top = rows.find((r) => deltaOf(r) > 0);

  return (
    <>
      <PageHeader
        title="Analytics"
        sub={
          <>
            Before and after <DemoTag />
          </>
        }
      />

      {reassessed.length ? (
        <>
          <BeforeAfter before={x.b} after={x.a}>
            <div className="mu sm">{x.n} students reassessed</div>
          </BeforeAfter>

          <section className="section">
            <div className="section-head">
              <h3>Improvement by concept</h3>
              <span className="sh-meta">diagnostic → reassessment</span>
            </div>
            {top ? (
              <p className="mu sm" style={{ marginBottom: 'var(--s3)' }}>
                Largest gain: <b>{top.c.name}</b>, {top.b}% → {top.a}% (+
                {top.a - top.b} points).
              </p>
            ) : null}
            {rows.map((r) => (
              <div className="lr" key={r.c.id}>
                <span style={{ minWidth: 150, flex: '1 1 180px' }}>
                  <b>{r.c.name}</b>
                </span>
                <DeltaBars before={r.b} after={r.a} />
              </div>
            ))}
          </section>
        </>
      ) : (
        <Empty
          title="No reassessments yet"
          text="Before and after improvement appears here once students complete a reassessment."
        />
      )}
    </>
  );
}
