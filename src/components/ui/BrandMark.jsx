/** PathForge logo mark — a small ascending path glyph inside a rounded tile. */
export default function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3.2 11.4 6.6 8l2.4 2.3L13 5.6"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="13" cy="5.6" r="1.7" fill="currentColor" />
      </svg>
    </span>
  );
}
