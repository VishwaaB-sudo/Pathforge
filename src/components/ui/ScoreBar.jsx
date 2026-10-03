import Bar from './Bar';

/** Bar + percentage cell used in several lists. */
export default function ScoreBar({ value, label }) {
  return (
    <span className="lb">
      <Bar value={value ?? 0} label={label} />
      <b>{value == null ? '–' : value + '%'}</b>
    </span>
  );
}
