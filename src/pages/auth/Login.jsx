import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import BrandMark from '@/components/ui/BrandMark';

const JOURNEY = ['Diagnosed', 'Learning', 'Practiced', 'Applied', 'Verified', 'Improved'];

/* Three real statements about the product. Each drives its own artwork and
   line drawing, so the indicator in the reference layout means something
   rather than decorating a static picture. */
const SLIDES = [
  { line: 'From What You Study to What You Can Do.', motif: 'path' },
  { line: 'Find the gap. Close it. Prove it.', motif: 'gap' },
  { line: 'Real evidence, not just a score.', motif: 'proof' },
];

const DWELL = 4600;

/* Line drawings overlaid on the artwork — abstract, and tied to the slide.
   Stroke only, so they read as drawing rather than as filled shapes. */
function Drawing({ motif }) {
  const common = {
    className: 'lg-draw',
    viewBox: '0 0 320 200',
    fill: 'none',
    'aria-hidden': 'true',
  };
  if (motif === 'path') {
    return (
      <svg {...common}>
        <path d="M20 168h280" className="d-base" />
        <path d="M20 160 L92 122 L150 140 L214 76 L300 40" className="d-line" />
        {[20, 92, 150, 214, 300].map((x, i) => {
          const ys = [160, 122, 140, 76, 40];
          return <circle key={x} cx={x} cy={ys[i]} r={i === 4 ? 6 : 4} className="d-dot" />;
        })}
        <path d="M20 96a74 74 0 0 1 148 0" className="d-arc" />
        <path d="M214 148a60 60 0 0 1 120 0" className="d-arc" />
      </svg>
    );
  }
  if (motif === 'gap') {
    return (
      <svg {...common}>
        <path d="M40 40v120M280 40v120" className="d-base" />
        <path d="M40 100h84M196 100h84" className="d-line" />
        <path d="M124 100l28-28 28 28M180 100l-28 28-28-28" className="d-line" />
        <circle cx="160" cy="100" r="7" className="d-dot" />
        <path d="M96 62v76M224 62v76" className="d-arc" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="70" y="44" width="180" height="112" rx="10" className="d-base" />
      <path d="M96 128l30-34 26 22 32-44 40 56" className="d-line" />
      <circle cx="160" cy="128" r="5" className="d-dot" />
      <path d="M70 74h180" className="d-arc" />
      <path d="M120 34v-14M200 34v-14M160 34v-14" className="d-base" />
    </svg>
  );
}

export default function Login() {
  const { S, login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  /* Auto-advance. Hovering the panel stops it so a reader can finish a line. */
  useEffect(() => {
    if (paused) return undefined;
    timer.current = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), DWELL);
    return () => clearInterval(timer.current);
  }, [paused, slide]);

  const submit = (e) => {
    e.preventDefault();
    if (login(email, password)) navigate('/dash');
    else setError('Email or password is incorrect.');
  };
  const fill = (e) => {
    setEmail(e);
    setPassword('demo123');
  };

  return (
    <main className="lg">
      <div className="lg-split">
        {/* Left: brand panel. Reference split — mark on top, artwork in the
            middle, message and indicators anchored at the bottom. Artwork is
            generated from the accent rather than shipped as an image, so it
            stays on-brand and costs no request. */}
        <section
          className="lg-brand"
          aria-label="About PathForge"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="lg-brandmark">
            <BrandMark />
            PathForge
          </div>

          <div className="lg-art">
            {SLIDES.map((s, i) => (
              <div key={s.line} className={`lg-art-layer${i === slide ? ' on' : ''}`} aria-hidden="true">
                <span />
                <span />
                <span />
                <Drawing motif={s.motif} />
              </div>
            ))}
          </div>

          <div className="lg-foot">
            {/* Rotating copy is decorative; the accessible heading is "Sign in". */}
            <div className="lg-rot" aria-hidden="true">
              {SLIDES.map((s, i) => (
                <span key={s.line} className={i === slide ? 'on' : ''}>
                  {s.line}
                </span>
              ))}
            </div>

            <div className="lg-dots">
              {SLIDES.map((s, i) => (
                <button
                  key={s.line}
                  type="button"
                  aria-label={`Show: ${s.line}`}
                  aria-pressed={i === slide}
                  className={`lg-dot${i === slide ? ' on' : ''}`}
                  onClick={() => setSlide(i)}
                />
              ))}
            </div>
          </div>

          <div className="lg-journey">
            <ol className="lg-nodes">
              {JOURNEY.map((step) => (
                <li className="lg-node" key={step}>
                  <i aria-hidden="true" />
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Right: focused authentication form */}
        <section className="lg-form" aria-label="Sign in">
          <h1>Sign in</h1>
          <p className="mu sm" style={{ marginTop: 0 }}>
            Continue to your learning workspace.
          </p>
          <form onSubmit={submit} style={{ marginTop: 12 }}>
            <label htmlFor="em">Email</label>
            <input
              id="em"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="field">
              <label htmlFor="pw">Password</label>
              <input
                id="pw"
                type={showPw ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="pw-toggle"
                aria-pressed={showPw}
                onClick={() => setShowPw((v) => !v)}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="er" role="alert">
              {error ? <>⚠ {error}</> : null}
            </div>
            <button className="btn p w" style={{ marginTop: 4 }}>
              Sign in
            </button>
          </form>

          <p className="hint" style={{ marginTop: 16 }}>
            Demo accounts · password <b>demo123</b>
          </p>
          <div className="row demo-row">
            {S.users.slice(0, 3).map((u) => (
              <button key={u.e} type="button" className="btn sm" onClick={() => fill(u.e)}>
                {u.role}
              </button>
            ))}
          </div>
          <p className="hint" style={{ marginTop: 16 }}>
            Prototype sign-in for demonstration only. Class roster results are DEMO DATA.
          </p>
        </section>
      </div>
    </main>
  );
}