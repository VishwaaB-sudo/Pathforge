import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import BrandMark from '@/components/ui/BrandMark';

const JOURNEY = [
  'Diagnosed',
  'Learning',
  'Practiced',
  'Applied',
  'Verified',
  'Improved',
];

export default function Login() {
  const { S, login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

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
        {/* Left: brand / value panel */}
        <section className="lg-brand" aria-label="About PathForge">
          <div className="lg-brandmark">
            <BrandMark />
            PathForge
          </div>
          <p className="lg-tagline">From What You Study to What You Can Do.</p>
          <p className="lg-message">
            Identify learning gaps. Build real evidence. Track improvement.
          </p>
          <div className="lg-journey">
            <div className="lg-journey-title">Your learning journey</div>
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
