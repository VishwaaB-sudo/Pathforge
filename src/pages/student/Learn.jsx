import { Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useSelectors } from '@/hooks/useSelectors';
import { useRunLauncher } from '@/hooks/useRunLauncher';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';

const UNITS = [
  'Unit 1 · Programming Basics',
  'Unit 2 · Functions & Data',
  'Unit 3 · Problem Solving',
];

/** Notes + worked examples grouped by unit. Also served at /res as "Resources". */
export function Learn({ resources = false }) {
  const { S } = useApp();
  const { me, nm, status, taskFor } = useSelectors();
  const { startRun } = useRunLauncher();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title={resources ? 'Resources' : 'My Learning'}
        sub="Programming Fundamentals · approved course content"
      />
      {[1, 2, 3].map((u) => {
        const cs = S.concepts.filter((c) => (c.u || 3) === u);
        if (!cs.length) return null;
        return (
          <Fragment key={u}>
            <div className="unit-h">
              <h3>{UNITS[u - 1]}</h3>
              <span className="mu sm">
                {cs.length} concept{cs.length > 1 ? 's' : ''}
              </span>
            </div>
            {cs.map((c) => {
              const r = S.res[c.id] || { notes: '', ex: '' };
              return (
                <details key={c.id}>
                  <summary>
                    {c.name} {me.pre ? <Badge status={status(c.id)} /> : null}
                  </summary>
                  {c.pre ? <p className="mu sm">Builds on: {nm(c.pre)}</p> : null}
                  <h4>Notes</h4>
                  <p>{r.notes}</p>
                  <h4>Example</h4>
                  <pre>{r.ex}</pre>
                  <div className="row">
                    <button className="btn sm" onClick={() => startRun('prac', c.id)}>
                      Practice
                    </button>
                    {taskFor(c.id) && (
                      <button className="btn sm" onClick={() => navigate(`/task/${c.id}`)}>
                        Applied Task
                      </button>
                    )}
                  </div>
                </details>
              );
            })}
          </Fragment>
        );
      })}
    </>
  );
}

export const Resources = () => <Learn resources />;
