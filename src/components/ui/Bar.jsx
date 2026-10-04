export default function Bar({ value, label }) {
  return (
    <div
      className="bar"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <i aria-hidden="true" style={{ width: `${value}%` }} />
    </div>
  );
}
