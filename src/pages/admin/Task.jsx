import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useUi } from '@/context/UiContext';
import { saveTask } from '@/lib/domain';
import PageHeader from '@/components/ui/PageHeader';

export default function AdminTask() {
  const { S, update } = useApp();
  const { toast } = useUi();
  const [id, setId] = useState(S.tasks[0]?.id);
  const T = S.tasks.find((t) => t.id === id) || S.tasks[0];
  const [title, setTitle] = useState(T?.title || '');
  const [obj, setObj] = useState(T?.obj || '');
  const [rubric, setRubric] = useState((T?.rubric || []).map((r) => [...r]));

  if (!T) return null;

  const pick = (nextId) => {
    const t = S.tasks.find((x) => x.id === nextId);
    setId(nextId);
    setTitle(t.title);
    setObj(t.obj);
    setRubric(t.rubric.map((r) => [...r]));
  };
  const setCell = (i, j) => (e) =>
    setRubric((rb) =>
      rb.map((r, k) => (k === i ? r.map((x, l) => (l === j ? e.target.value : x)) : r)),
    );

  const save = () => {
    const t = title.trim(),
      o = obj.trim();
    const rb = rubric.map((r) => [r[0].trim(), r[1].trim()]);
    if (!t || !o || rb.some((x) => !x[0] || !x[1])) return toast('Fill in every field.');
    update((d) => saveTask(d, T.id, { title: t, obj: o, rubric: rb }));
    toast('Saved.');
  };

  return (
    <>
      <PageHeader title="Tasks" sub="Applied tasks and rubrics" />
      <div className="card">
        <label htmlFor="tpick">Task</label>
        <select id="tpick" value={id} onChange={(e) => pick(e.target.value)}>
          {S.tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        <label htmlFor="tt">Title</label>
        <input id="tt" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} />
        <label htmlFor="to">Objective</label>
        <textarea id="to" rows={3} value={obj} onChange={(e) => setObj(e.target.value)} />
        <h4>Rubric (each criterion scored 0–4)</h4>
        {rubric.map((r, i) => (
          <div key={i}>
            <label htmlFor={`rn${i}`}>Criterion {i + 1}</label>
            <input id={`rn${i}`} value={r[0]} maxLength={40} onChange={setCell(i, 0)} />
            <label htmlFor={`rd${i}`}>What faculty look for</label>
            <input id={`rd${i}`} value={r[1]} maxLength={120} onChange={setCell(i, 1)} />
          </div>
        ))}
        <button className="btn p" onClick={save}>
          Save task
        </button>
      </div>
    </>
  );
}
