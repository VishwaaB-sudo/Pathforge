import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useUi } from '@/context/UiContext';
import { useSelectors } from '@/hooks/useSelectors';
import { addConcept, conceptInUse, removeConcept } from '@/lib/domain';
import PageHeader from '@/components/ui/PageHeader';

const EMPTY = { name: '', u: '1', pre: '' };

export default function Concepts() {
  const { S, update } = useApp();
  const { toast } = useUi();
  const { nm } = useSelectors();
  const [f, setF] = useState(EMPTY);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const add = () => {
    const name = f.name.trim();
    if (name.length < 2) return toast('Enter a concept name.');
    update((d) => addConcept(d, { name, u: +f.u, pre: f.pre }));
    setF(EMPTY);
    toast('Concept added.');
  };
  const remove = (id) => {
    if (conceptInUse(S, id)) return toast('Remove its questions, dependents and task link first.');
    update((d) => removeConcept(d, id));
  };

  return (
    <>
      <PageHeader title="Concepts" sub="Pilot course: Programming Fundamentals" />
      <div className="card tw">
        <table>
          <thead>
            <tr>
              <th>Concept</th>
              <th>Unit</th>
              <th>Prerequisite</th>
              <th>Questions</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {S.concepts.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.u}</td>
                <td>{c.pre ? nm(c.pre) : '–'}</td>
                <td>{S.qs.filter((q) => q.c === c.id).length}</td>
                <td>
                  <button className="btn sm" onClick={() => remove(c.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3>Add concept</h3>
        <label htmlFor="cn1">Name</label>
        <input id="cn1" maxLength={40} value={f.name} onChange={set('name')} />
        <label htmlFor="cu">Unit</label>
        <select id="cu" value={f.u} onChange={set('u')}>
          <option>1</option>
          <option>2</option>
          <option>3</option>
        </select>
        <label htmlFor="cp">Prerequisite</label>
        <select id="cp" value={f.pre} onChange={set('pre')}>
          <option value="">None</option>
          {S.concepts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button className="btn p" onClick={add}>
          Add concept
        </button>
      </div>
    </>
  );
}
