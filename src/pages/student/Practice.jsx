import { useApp } from '@/context/AppContext';
import { useSelectors } from '@/hooks/useSelectors';
import { useRunLauncher } from '@/hooks/useRunLauncher';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';

export default function Practice() {
  const { S } = useApp();
  const { me, Q, status } = useSelectors();
  const { startRun } = useRunLauncher();
  const saved = me.mist.filter((x) => Q(x.id)).length;

  return (
    <>
      <PageHeader title="Practice" sub="Short sets with instant explanations." />
      <div className="card">
        <div className="lr">
          <div>
            <b>Practice My Mistakes</b>
            <div className="mu sm">{saved} saved</div>
          </div>
          <button className="btn p" onClick={() => startRun('mist')} disabled={!saved}>
            Start
          </button>
        </div>
        {S.concepts.map((c) => (
          <div className="lr" key={c.id}>
            <div>
              <b>{c.name}</b> {me.pre ? <Badge status={status(c.id)} /> : null}
            </div>
            <button className="btn" onClick={() => startRun('prac', c.id)}>
              Practice
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
