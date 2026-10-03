import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useSelectors } from '@/hooks/useSelectors';
import { band, ov } from '@/lib/utils';
import { confetti } from '@/lib/fx';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Bar from '@/components/ui/Bar';
import Empty from '@/components/ui/Empty';
import BeforeAfter from '@/components/ui/BeforeAfter';

/** /result/pre = learning gaps, /result/post = before/after progress. */
export default function Result() {
  const { S } = useApp();
  const { me, nm, why } = useSelectors();
  const navigate = useNavigate();
  const { which } = useParams();
  const k = which === 'post' ? 'post' : 'pre';
  const a = me[k];
  const improved = k === 'post' && !!me.pre && !!a && ov(a.scores) > ov(me.pre.scores);

  useEffect(() => (improved ? confetti() : undefined), [improved]);

  if (!a) {
    return (
      <>
        <PageHeader title="Results" />
        <Empty
          title="No results yet"
          text="Take the diagnostic to see your learning gaps."
          action="Start Diagnostic"
          onAction={() => navigate('/diag')}
        />
      </>
    );
  }

  const ids = Object.keys(a.scores)
    .filter((c) => S.concepts.some((x) => x.id === c))
    .sort((x, y) => a.scores[x] - a.scores[y]);
  const top = ids[0];
  const primary = k === 'pre' ? 'View Recovery Plan' : 'View Skill Passport';

  return (
    <>
      <PageHeader
        title={k === 'pre' ? 'Your Learning Gaps' : 'Your Progress'}
        sub={
          k === 'pre'
            ? 'Concepts to practise, not a judgement of you.'
            : 'Reassessment compared with your starting point.'
        }
      />

      {k === 'post' && <BeforeAfter before={ov(me.pre.scores)} after={ov(a.scores)} animated change />}

      {/* plain-language summary and the one action that matters */}
      <div className="card">
        {top ? (
          <>
            <h3>
              {k === 'pre'
                ? `Focus first on ${nm(top)}`
                : `${nm(top)} is your lowest current concept`}
            </h3>
            <p className="mu">
              {why(a, top) ||
                `You scored ${a.scores[top]}% on ${nm(top)} in this ${k === 'pre' ? 'diagnostic' : 'reassessment'}.`}
            </p>
          </>
        ) : (
          <p className="mu">No concept scores were recorded.</p>
        )}
        <div className="row" style={{ marginTop: 'var(--s5)' }}>
          <button
            className="btn p"
            onClick={() => navigate(k === 'pre' ? '/recovery' : '/pass')}
          >
            {primary}
            <span className="cta-arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>

      {/* full per-concept detail behind progressive disclosure */}
      <details>
        <summary>
          View full analysis <span className="mu sm">({ids.length} concepts)</span>
        </summary>
        <div style={{ paddingTop: 'var(--s4)' }}>
          {ids.map((c) => {
            const v = a.scores[c];
            return (
              <div className="lr" key={c}>
                <div>
                  <b>{nm(c)}</b> <Badge status={band(v)} />
                  <div className="mu sm">
                    {why(a, c)}
                    {k === 'post' && me.pre.scores[c] != null
                      ? ` Before: ${me.pre.scores[c]}%.`
                      : ''}
                  </div>
                </div>
                <div className="lb">
                  <Bar value={v} label={nm(c)} />
                  <b>{v}%</b>
                </div>
              </div>
            );
          })}
          <p className="mu sm" style={{ marginTop: 'var(--s4)' }}>
            Labels follow fixed rules: under 60% = Needs Practice, 60–79% = Learning, 80%+ =
            Practiced.
          </p>
        </div>
      </details>
    </>
  );
}
