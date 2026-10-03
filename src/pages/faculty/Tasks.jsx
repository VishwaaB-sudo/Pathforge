import { useApp } from '@/context/AppContext';
import { useSelectors } from '@/hooks/useSelectors';
import PageHeader from '@/components/ui/PageHeader';

export default function FacultyTasks() {
  const { S } = useApp();
  const { nm } = useSelectors();
  return (
    <>
      <PageHeader title="Tasks" sub="Applied tasks and their rubrics" />
      {S.tasks.map((T) => (
        <div className="card" key={T.id}>
          <h3>{T.title}</h3>
          <p className="mu sm">Concept: {nm(T.c)}</p>
          <p>{T.obj}</p>
          <h4>Rubric (4 × 4 points)</h4>
          {T.rubric.map((r) => (
            <div className="sm" key={r[0]}>
              {r[0]} — {r[1]}
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
