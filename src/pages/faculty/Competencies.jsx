import { useApp } from '@/context/AppContext';
import { useSelectors } from '@/hooks/useSelectors';
import { current } from '@/lib/selectors';
import PageHeader from '@/components/ui/PageHeader';
import DemoTag from '@/components/ui/DemoTag';

/**
 * Concept-level decision table: where students struggle, how they score, and
 * what the common error is. Uses the same class stats the dashboard already
 * derives — no new data source.
 */
export default function Competencies() {
  const { S } = useApp();
  const { stats } = useSelectors();
  const { as, ca } = stats();
  const verifiedFor = (cid) => S.subs.filter((s) => s.tid === cid && s.status === 'verified').length;

  // most students needing practice first, then lowest average score
  const rows = [...ca].sort(
    (x, y) => y.low - x.low || (x.avg ?? 101) - (y.avg ?? 101),
  );

  return (
    <>
      <PageHeader
        title="Competencies"
        sub={
          <>
            Where the class stands <DemoTag />
          </>
        }
      />
      <div className="card tw">
        <table>
          <thead>
            <tr>
              <th>Concept</th>
              <th className="num">Needs Practice</th>
              <th className="num">Learning</th>
              <th className="num">Practiced+</th>
              <th className="num">Average score</th>
              <th>Common error</th>
              <th className="num">Faculty verified</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              // `as` holds roster rows, so the score has to be read off the row's score map
              // (reassessment when taken, otherwise the diagnostic) — reading
              // `x[c.id]` returned nothing and every band showed 0.
              const v = as.map((x) => current(x)[r.c.id]).filter((q) => q != null);
              return (
                <tr key={r.c.id}>
                  <td>{r.c.name}</td>
                  <td className="num">{v.filter((q) => q < 60).length}</td>
                  <td className="num">{v.filter((q) => q >= 60 && q < 80).length}</td>
                  <td className="num">{v.filter((q) => q >= 80).length}</td>
                  <td className="num">{r.avg == null ? '–' : r.avg + '%'}</td>
                  <td>{r.errs.length ? r.errs.join(', ') : '–'}</td>
                  <td className="num">
                    {S.tasks.some((t) => t.id === r.c.id) ? verifiedFor(r.c.id) : '–'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
