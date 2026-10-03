import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { current } from '@/lib/selectors';

const cellClass = (v) => (v == null ? '' : v < 60 ? 'bad' : v < 80 ? 'warn' : 'ok');

/** Student × concept score grid. */
export default function Heatmap({ rows }) {
  const { S } = useApp();
  return (
    <div className="tw">
      <table>
        <caption className="sm mu" style={{ textAlign: 'left' }}>
          Scores (%). Under 60 = Needs Practice, 60–79 = Learning, 80+ = Practiced.
        </caption>
        <thead>
          <tr>
            <th>Student</th>
            {S.concepts.map((c) => (
              <th key={c.id}>{c.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.n}>
              <td>
                {r.pre ? <Link to={`/stu/${encodeURIComponent(r.n)}`}>{r.n}</Link> : r.n}
                {r.live ? ' (live)' : ''}
              </td>
              {S.concepts.map((c) => {
                const v = r.pre ? current(r)[c.id] : null;
                return (
                  <td key={c.id} className={`h ${cellClass(v)}`}>
                    {v == null ? '–' : v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
