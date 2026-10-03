import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { NAV, moreLinks } from '@/config/nav';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Topbar({ onToggleNav }) {
  const { role, user, logout } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = role === 'admin';

  // breadcrumb is derived from the real nav config, so it can never drift
  const entries = [
    ...NAV[role].flatMap(([group, items]) =>
      items.map(([to, label]) => ({ group: group || 'Workspace', to, label })),
    ),
    ...moreLinks(role).map(([to, label]) => ({ group: 'More', to, label })),
  ];
  const here =
    entries.find((e) => pathname === e.to) ||
    entries.find((e) => e.to !== '/' && pathname.startsWith(e.to + '/'));

  const search = (e) => {
    if (e.key === 'Enter')
      navigate(`/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
  };
  const signOut = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="top">
      <button className="icon-btn" aria-label="Toggle navigation" onClick={onToggleNav}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M3 5h12M3 9h12M3 13h12"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <nav className="crumbs" aria-label="Breadcrumb">
        <span className="crumb-group">{here ? here.group : 'Programming Fundamentals'}</span>
        {here ? (
          <>
            <span className="crumb-sep" aria-hidden="true">
              /
            </span>
            <span className="crumb-here" aria-current="page">
              {here.label}
            </span>
          </>
        ) : null}
      </nav>
      {isAdmin ? (
        <span style={{ flex: 1 }} />
      ) : (
        <input
          className="srch"
          type="search"
          placeholder="Search this course"
          aria-label="Search this course"
          onKeyDown={search}
        />
      )}
      <div className="top-actions">
        {!isAdmin && (
          <select className="crs" aria-label="Course" style={{ margin: 0 }}>
            <option>Programming Fundamentals{role === 'faculty' ? ' · CSE-A' : ''}</option>
          </select>
        )}
        <span className="role-chip">{role}</span>
        <span className="av" aria-hidden="true">
          {user.n[0]}
        </span>
        <span className="sm who">
          {user.n}
          <br />
          <span className="mu">{role}</span>
        </span>
        <ThemeToggle />
        <button className="btn sm" onClick={signOut}>
          Sign out
        </button>
      </div>
    </header>
  );
}
