/**
 * Before → after comparison for one measure. Plain CSS bars on a shared scale
 * so the two values are directly comparable, plus the delta in percentage points.
 */
export default function DeltaBars({ before, after }) {
  const delta = before != null && after != null ? after - before : null;

  return (
    <div className="dbar">
      <div className="dbar-line">
        <span className="dbar-lbl">Before</span>
        <span className="dbar-track">
          <i className="pre" style={{ width: (before ?? 0) + '%' }} />
        </span>
        <b className="tnum">{before == null ? '–' : before + '%'}</b>
      </div>
      <div className="dbar-line">
        <span className="dbar-lbl">After</span>
        <span className="dbar-track">
          <i style={{ width: (after ?? 0) + '%' }} />
        </span>
        <b className="tnum">{after == null ? '–' : after + '%'}</b>
      </div>
      {delta != null ? (
        <div className="dbar-delta">
          <span className={`delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'}`}>
            {delta > 0 ? '+' : ''}
            {delta} percentage points
          </span>
        </div>
      ) : null}
    </div>
  );
}
