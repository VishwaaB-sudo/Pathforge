import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useUi } from '@/context/UiContext';
import { useSelectors } from '@/hooks/useSelectors';
import { addQuestion, removeQuestion } from '@/lib/domain';
import PageHeader from '@/components/ui/PageHeader';

const SET_LABELS = ['Diagnostic', 'Reassess', 'Practice', 'Both'];
const blank = (concepts) => ({
  c: concepts[0]?.id || '',
  t: '',
  o: ['', '', '', ''],
  a: '0',
  err: '',
  e: '',
  set: '2',
});

export default function Questions() {
  const { S, update } = useApp();
  const { toast, askConfirm } = useUi();
  const { nm } = useSelectors();
  const [f, setF] = useState(() => blank(S.concepts));
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const setOpt = (i) => (e) =>
    setF((v) => ({ ...v, o: v.o.map((x, j) => (j === i ? e.target.value : x)) }));

  const add = () => {
    const o = f.o.map((x) => x.trim());
    const t = f.t.trim(),
      e = f.e.trim(),
      err = f.err.trim();
    if (!t || o.some((x) => !x) || !e || !err) return toast('Fill every field.');
    update((d) => addQuestion(d, { c: f.c, t, o, a: +f.a, err, e, set: +f.set }));
    setF(blank(S.concepts));
    toast('Question added.');
  };
  const remove = async (id) => {
    const ok = await askConfirm({
      title: 'Delete this question?',
      body: 'It will be removed from every practice and assessment set.',
      confirmLabel: 'Delete question',
      danger: true,
    });
    if (ok) update((d) => removeQuestion(d, id));
  };

  return (
    <>
      <PageHeader
        title="Questions"
        sub="Diagnostic and reassessment sets use 2 questions per concept each."
      />
      <div className="card">
        <h3>Add question</h3>
        <label htmlFor="qc">Concept</label>
        <select id="qc" value={f.c} onChange={set('c')}>
          {S.concepts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label htmlFor="qt">Question</label>
        <input id="qt" maxLength={200} value={f.t} onChange={set('t')} />
        {f.o.map((v, i) => (
          <div key={i}>
            <label htmlFor={`o${i}`}>Option {i + 1}</label>
            <input id={`o${i}`} maxLength={100} value={v} onChange={setOpt(i)} />
          </div>
        ))}
        <label htmlFor="qa">Correct option</label>
        <select id="qa" value={f.a} onChange={set('a')}>
          <option value="0">1</option>
          <option value="1">2</option>
          <option value="2">3</option>
          <option value="3">4</option>
        </select>
        <label htmlFor="qe">Error type</label>
        <input id="qe" maxLength={40} value={f.err} onChange={set('err')} />
        <label htmlFor="qx">Explanation</label>
        <input id="qx" maxLength={200} value={f.e} onChange={set('e')} />
        <label htmlFor="qs">Used in</label>
        <select id="qs" value={f.set} onChange={set('set')}>
          <option value="2">Practice only</option>
          <option value="0">Diagnostic</option>
          <option value="1">Reassessment</option>
          <option value="3">Both</option>
        </select>
        <button className="btn p" onClick={add}>
          Add question
        </button>
      </div>
      <div className="card tw">
        <table>
          <thead>
            <tr>
              <th>Concept</th>
              <th>Question</th>
              <th>Set</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {S.qs.map((q) => (
              <tr key={q.id}>
                <td>{nm(q.c)}</td>
                <td>{q.t}</td>
                <td>{SET_LABELS[q.set]}</td>
                <td>
                  <button className="btn sm" onClick={() => remove(q.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
