import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useSelectors } from '@/hooks/useSelectors';
import { useRunLauncher } from '@/hooks/useRunLauncher';
import { latest } from '@/lib/selectors';
import { date } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Bar from '@/components/ui/Bar';

/** Non-card region: heading + hairline rule, content sits on the page. */
const Section = ({ title, action, children }) => (
  <section className="section">
    <div className="section-head">
      <h3>{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

export default function StudentDashboard() {
  const { S, user } = useApp();
  const { me, status, nextAct, journey, rationale } = useSelectors();
  const { startRun } = useRunLauncher();
  const navigate = useNavigate();

  const sc = latest(me) || {};
  const cs = S.concepts.filter((c) => sc[c.id] != null);
  const st = cs.map((c) => status(c.id));
  const n = nextAct();
  const j = journey();
  const ci = j.findIndex((x) => !x.d);
  const progress = Math.round((j.filter((x) => x.d).length / 6) * 100);
  const h = new Date().getHours();
  const greeting = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
  const gaps = cs.filter((c) => sc[c.id] < 80).sort((a, b) => sc[a.id] - sc[b.id]);

  return (
    <>
      <PageHeader
        title={`Good ${greeting}, ${user.n.split(' ')[0]}`}
        sub="Here is what to do next."
      />

      {/* 1. the single dominant action */}
      <div className="card hero">
        <span className="eyebrow">Your next step</span>
        <h2>{n.t}</h2>
        <p className="mu">
          {n.s}
          {n.m ? ' · ' + n.m : ''}
        </p>
        <Bar value={progress} label="Course progress" />
        <div className="cj" aria-hidden="true">
          {j.map((x, i) => (
            <span key={x.k} className={`cj-dot${x.d ? ' done' : ''}${i === ci ? ' on' : ''}`}>
              <i />
              {x.k}
            </span>
          ))}
        </div>
        <span className="cj-tag">
          <b>From what you study</b> → to what you can do
        </span>
        <button className="btn p" onClick={() => (n.run ? startRun(n.run) : navigate(n.to))}>
          {n.b}
          <span className="cta-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>

      {/* 2. compact metric strip */}
      <div className="mets strip">
        <div className="met">
          <span className="mu">Course progress</span>
          <b>{progress}%</b>
        </div>
        <div className="met">
          <span className="mu">Competencies</span>
          <b>
            {cs.length}/{S.concepts.length}
          </b>
        </div>
        <div className="met">
          <span className="mu">Needs attention</span>
          <b>{st.filter((x) => x === 'Needs Practice').length}</b>
        </div>
        <div className="met">
          <span className="mu">Verified</span>
          <b>{st.filter((x) => x === 'Faculty Verified').length}</b>
        </div>
      </div>

      {/* 3. supporting information, no card chrome */}
      <Section title="Learning Gaps">
        {!me.pre ? (
          <p className="mu">Take the diagnostic to see your learning gaps.</p>
        ) : gaps.length ? (
          <>
            {gaps.map((c) => (
              <div className="lr" key={c.id}>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <b>{c.name}</b> <Badge status={status(c.id)} />
                  <div className="mu sm">{rationale(c)}</div>
                </div>
                <button className="btn sm" onClick={() => navigate('/recovery')}>
                  Recover
                </button>
              </div>
            ))}
            <div className="row" style={{ marginTop: 'var(--s4)' }}>
              <button className="btn p" onClick={() => navigate('/recovery')}>
                Open my recovery plan
                <span className="cta-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          </>
        ) : (
          <p className="mu">No gaps right now. Nice work.</p>
        )}
      </Section>

      <Section
        title="Learning Journey"
        action={<span className="sh-meta">{j.filter((x) => x.d).length} of 6 complete</span>}
      >
        <ol className="jr" aria-label="Learning journey">
          {j.map((x, i) => (
            <li key={x.k} className={x.d ? 'd' : i === ci ? 'c' : ''}>
              {x.k}
              {x.d ? <span className="sm"> (done)</span> : i === ci ? <span className="sm"> (now)</span> : null}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Skill Progress" action={<span className="sh-meta">Latest score per concept</span>}>
        {S.concepts.map((c) => (
          <div className="lr" key={c.id}>
            <span style={{ minWidth: 140 }}>{c.name}</span>
            <span className="lb">
              <Bar value={sc[c.id] || 0} label={c.name} />
              <span className="sm tnum">{sc[c.id] == null ? '–' : sc[c.id] + '%'}</span>
            </span>
          </div>
        ))}
      </Section>

      <Section title="Recent Activity">
        {me.act.length ? (
          me.act
            .slice(-5)
            .reverse()
            .map((a, i) => (
              <div className="lr sm" key={i}>
                <span>{a.t}</span>
                <span className="mu">{date(a.at)}</span>
              </div>
            ))
        ) : (
          <p className="mu">Your activity will appear here.</p>
        )}
      </Section>
    </>
  );
}
