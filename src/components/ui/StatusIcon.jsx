/**
 * Small status glyphs. Paired with a visible text label so meaning never depends
 * on colour alone (shape carries it too: check = done, dot = active, ring = not started).
 */
const SHAPES = {
  check: (
    <path
      d="M2.2 7.2 4.9 9.9 9.9 3.4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  dot: <circle cx="6" cy="6" r="3.1" fill="currentColor" />,
  ring: (
    <circle cx="6" cy="6" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
  ),
  alert: (
    <>
      <path
        d="M6 1.9 10.7 9.9H1.3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M6 5v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="6" cy="8.6" r="0.85" fill="currentColor" />
    </>
  ),
};

export default function StatusIcon({ shape = 'dot' }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      {SHAPES[shape] || SHAPES.dot}
    </svg>
  );
}
