import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useUi } from '@/context/UiContext';
import { submitTask } from '@/lib/domain';

/** Code + explanation form for the applied task. */
export default function TaskSubmission({ task, submission }) {
  const { update } = useApp();
  const { toast } = useUi();
  const [code, setCode] = useState(submission?.code || 'def solution(n):\n    # your code here\n');
  const [expl, setExpl] = useState(submission?.expl || '');

  const submit = () => {
    const c = code.trim();
    const e = expl.trim();
    if (c.length < 30 || !/def\s+\w+/.test(c)) return toast('Add your function code (a def … block).');
    if (e.length < 20) return toast('Add a short explanation (20+ characters).');
    update((d) => submitTask(d, { tid: task.id, code: c, expl: e }));
    toast('Submitted. Faculty will review it.');
  };

  return (
    <>
      <label htmlFor="code">Your code</label>
      <textarea
        id="code"
        rows={10}
        maxLength={4000}
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <label htmlFor="expl">Explain your approach and trace it with one example</label>
      <textarea
        id="expl"
        rows={4}
        maxLength={2000}
        value={expl}
        onChange={(e) => setExpl(e.target.value)}
      />
      <button className="btn p" onClick={submit}>
        Submit for review
      </button>
    </>
  );
}
