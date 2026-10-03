/** Falling confetti. Returns a cleanup function that removes any pieces still on screen. */
export function confetti() {
  if (window.matchMedia?.('(prefers-reduced-motion:reduce)').matches) return () => {};
  const pieces = [];
  const timers = [];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('i');
    c.className = 'cf';
    c.style.cssText = `left:${Math.random() * 100}%;background:hsl(${168 + Math.random() * 34},72%,58%);animation-delay:${Math.random() * 0.8}s;animation-duration:${2 + Math.random() * 1.5}s`;
    document.body.appendChild(c);
    pieces.push(c);
    timers.push(setTimeout(() => c.remove(), 4500));
  }
  return () => {
    timers.forEach(clearTimeout);
    pieces.forEach((p) => p.remove());
  };
}
