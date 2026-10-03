import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { consent } from '@/lib/domain';

export default function Consent() {
  const { update } = useApp();
  const [agreed, setAgreed] = useState(false);
  return (
    <main className="lg">
      <div className="card lgc">
        <h1>Before you start</h1>
        <p className="mu">PathForge keeps only what is needed to support your learning.</p>
        <ul className="sm">
          <li>Your quiz answers, mistakes and task submissions</li>
          <li>Faculty rubric scores and feedback</li>
        </ul>
        <p className="sm">
          Your faculty can see these to support your learning. Other students cannot. Results
          describe concepts to practise, never "weak students".
        </p>
        <label>
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />I
          have read the privacy notice and agree.
        </label>
        <br />
        <br />
        <button className="btn p w" disabled={!agreed} onClick={() => update(consent)}>
          Continue
        </button>
      </div>
    </main>
  );
}
