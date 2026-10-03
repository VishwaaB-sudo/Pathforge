import CountUp from './CountUp';

/** Before → After comparison card. Pass `animated` for the count-up effect, `change` to show the delta,
 *  `bare` to drop the outer card chrome when it is already nested inside a section. */
export default function BeforeAfter({
  before,
  after,
  animated = false,
  change = false,
  bare = false,
  children,
}) {
  const val = (v) => (animated ? <CountUp value={v} /> : <b>{v ?? '–'}%</b>);
  return (
    <div className={`card ba${bare ? ' bare' : ''}`}>
      <div>
        <span className="mu sm">BEFORE</span>
        {val(before)}
      </div>
      <span aria-hidden="true">→</span>
      <div>
        <span className="mu sm">AFTER</span>
        {val(after)}
      </div>
      {change && (
        <div>
          <span className="mu sm">CHANGE</span>
          <b>
            {after >= before ? '+' : ''}
            {after - before} pts
          </b>
        </div>
      )}
      {children}
    </div>
  );
}
