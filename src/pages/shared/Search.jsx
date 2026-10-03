import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import PageHeader from '@/components/ui/PageHeader';
import Empty from '@/components/ui/Empty';

export default function Search() {
  const { S, role } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const raw = (params.get('q') || '').trim();
  const q = raw.toLowerCase();
  const results = q
    ? S.concepts.filter((c) =>
        (c.name + ' ' + (S.res[c.id]?.notes || '') + ' ' + (S.res[c.id]?.kw || ''))
          .toLowerCase()
          .includes(q),
      )
    : [];

  return (
    <>
      <PageHeader title="Search" sub={`Results for “${raw}” in Programming Fundamentals`} />
      {results.length ? (
        results.map((c) => (
          <div className="card" key={c.id}>
            <h3>{c.name}</h3>
            <p className="mu">{(S.res[c.id]?.notes || '').slice(0, 160)}…</p>
            {role === 'student' && (
              <button className="btn sm" onClick={() => navigate('/learn')}>
                Open in My Learning
              </button>
            )}
          </div>
        ))
      ) : (
        <Empty title="No matches" text="Try a concept name such as loops or recursion." />
      )}
    </>
  );
}
