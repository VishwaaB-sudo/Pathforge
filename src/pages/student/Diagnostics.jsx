import { useNavigate } from 'react-router-dom';
import { useSelectors } from '@/hooks/useSelectors';
import { useRunLauncher } from '@/hooks/useRunLauncher';
import { date, ov } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';

export default function Diagnostics() {
  const { me, qm, reassessReady } = useSelectors();
  const { diagnose } = useRunLauncher();
  const navigate = useNavigate();
  const ready = reassessReady();

  return (
    <>
      <PageHeader title="Diagnostics" sub="Check where you stand, then measure your progress." />
      <div className="grid2">
        <div className="card">
          <h3>Starting Diagnostic</h3>
          {me.pre ? (
            <>
              <p className="mu">
                Taken {date(me.pre.at)} · overall {ov(me.pre.scores)}%
              </p>
              <button className="btn" onClick={() => navigate('/result/pre')}>
                View results
              </button>
            </>
          ) : (
            <>
              <p className="mu">{qm('pre')} · one at a time</p>
              <button className="btn p" onClick={() => diagnose('pre')}>
                Start Diagnostic
              </button>
            </>
          )}
        </div>
        <div className="card">
          <h3>Reassessment</h3>
          {me.post ? (
            <>
              <p className="mu">
                Taken {date(me.post.at)} · overall {ov(me.post.scores)}%
              </p>
              <button className="btn" onClick={() => navigate('/result/post')}>
                View progress
              </button>
            </>
          ) : ready && me.pre ? (
            <>
              <p className="mu">Your task is verified. You are ready.</p>
              <button className="btn p" onClick={() => diagnose('post')}>
                Start Reassessment
              </button>
            </>
          ) : (
            <p className="mu">Unlocks after faculty verifies your applied task.</p>
          )}
        </div>
      </div>
    </>
  );
}
