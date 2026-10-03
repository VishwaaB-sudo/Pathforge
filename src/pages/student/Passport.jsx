import { useApp } from '@/context/AppContext';
import { useSelectors } from '@/hooks/useSelectors';
import { latest } from '@/lib/selectors';
import { date, sum } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';

/** One evidence line with an accessible done / not-done indicator (never colour-only). */
const Evidence = ({ ok, children, meta }) => (
  <div className="ev">
    <span className={`ev-ico ${ok ? 'ok' : 'no'}`} aria-hidden="true">
      {ok ? '✓' : '–'}
    </span>
    <span className="sm">
      {children}
      {meta ? <span className="mu"> · {meta}</span> : null}
    </span>
  </div>
);

export default function Passport() {
  const { S } = useApp();
  const { me, taskFor, mySub, status } = useSelectors();
  const sc = latest(me) || {};

  const verifiedCount = S.concepts.filter((c) => mySub(c.id)?.status === 'verified').length;
  const practicedCount = S.concepts.filter((c) => me.prac[c.id]).length;
  const assessedCount = S.concepts.filter((c) => sc[c.id] != null).length;
  const inProgress = S.concepts.filter((c) => sc[c.id] != null && mySub(c.id)?.status !== 'verified')
    .length;
  // evidence records = diagnostic + practice + applied + verification, per concept
  const evidenceRecords = S.concepts.reduce((n, c) => {
    const applied = mySub(c.id) && mySub(c.id).status !== 'revise';
    return n + [!!me.pre, !!me.prac[c.id], !!applied, mySub(c.id)?.status === 'verified'].filter(Boolean)
      .length;
  }, 0);

  return (
    <>
      <PageHeader
        title="My Skill Passport"
        sub="Evidence of what you have learned and demonstrated."
      />

      <div className="passport-summary">
        <div>
          <div className="n">{verifiedCount}</div>
          <div className="lbl">Verified competencies</div>
        </div>
        <div>
          <div className="n">{inProgress}</div>
          <div className="lbl">Learning in progress</div>
        </div>
        <div>
          <div className="n">{practicedCount}</div>
          <div className="lbl">Concepts practiced</div>
        </div>
        <div>
          <div className="n">{evidenceRecords}</div>
          <div className="lbl">Evidence records</div>
        </div>
        <div>
          <div className="n">{assessedCount}</div>
          <div className="lbl">Concepts assessed</div>
        </div>
      </div>

      <p className="mu sm">
        PathForge records classroom learning evidence and faculty verification; it is not a
        professional certification.
      </p>

      {S.concepts.map((c) => {
        const t = taskFor(c.id);
        const s = mySub(c.id);
        const verified = s?.status === 'verified';
        const applied = s && s.status !== 'revise';
        const before = me.pre?.scores[c.id];
        const after = me.post?.scores[c.id];
        const current = sc[c.id];
        const delta = before != null && after != null ? after - before : null;
        const evidenceCount = [!!me.pre, !!me.prac[c.id], !!applied, verified].filter(
          Boolean,
        ).length;

        return (
          <article className="card" key={c.id}>
            <div className="lr" style={{ paddingTop: 0 }}>
              <h3 style={{ margin: 0 }}>{c.name}</h3>
              <span className="row" style={{ gap: 8 }}>
                <Badge status={status(c.id)} />
                <b>{current == null ? '–' : current + '%'}</b>
              </span>
            </div>

            <div className="grid2">
              <div>
                <Evidence ok={!!me.pre} meta={me.pre ? date(me.pre.at) : undefined}>
                  Diagnostic
                </Evidence>
                <Evidence ok={!!me.prac[c.id]}>Practice</Evidence>
                <Evidence ok={!!applied}>
                  Applied task{t ? '' : ' (none in pilot)'}
                </Evidence>
                <Evidence
                  ok={verified}
                  meta={verified ? `rubric ${sum(s.rub)}/16` : undefined}
                >
                  {verified && s.by ? `Faculty verification · ${s.by} · ${date(s.at)}` : 'Faculty verification'}
                </Evidence>
              </div>

              <div className="sm">
                <h4 style={{ marginTop: 0 }}>Improvement history</h4>
                {before != null ? (
                  <p style={{ marginBottom: 4 }}>
                    Before <b>{before}%</b>
                    {after != null ? (
                      <>
                        {' → '}After <b>{after}%</b>
                      </>
                    ) : null}
                  </p>
                ) : (
                  <p className="mu" style={{ marginBottom: 4 }}>
                    No diagnostic yet
                  </p>
                )}
                {delta != null && (
                  <p>
                    <span className={`delta ${delta > 0 ? 'up' : 'flat'}`}>
                      {delta > 0 ? '+' : ''}
                      {delta} pts
                    </span>{' '}
                    <span className="mu">since diagnostic</span>
                  </p>
                )}
                <p className="mu" style={{ marginTop: 8, marginBottom: 0 }}>
                  {evidenceCount} of 4 evidence types recorded
                </p>
              </div>
            </div>

            {verified && s.fb ? (
              <>
                <h4>Faculty feedback</h4>
                <p className="sm" style={{ marginBottom: 0 }}>
                  {s.fb}
                </p>
              </>
            ) : null}
          </article>
        );
      })}
    </>
  );
}
